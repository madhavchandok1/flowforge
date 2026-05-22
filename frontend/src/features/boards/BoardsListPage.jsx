import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/stores/useProjectStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Columns3,
  Plus,
  Search,
  ArrowRight,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

// ─── Framer Motion Modal ─────────────────────
function Modal({ open, onClose, children }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[8vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card rounded-lg shadow-lg border w-full max-w-lg mx-4"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Confirm Delete Dialog ───────────────────
function ConfirmDeleteDialog({ open, onClose, onConfirm, name }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Delete Board</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <strong>{name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Board Form Dialog (Create + Edit) ───────
function BoardFormDialog({ open, onClose, forges, initial, onSubmit, isEdit }) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open]);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.forgeId) return;
    onSubmit(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-1">
          {isEdit ? "Edit Board" : "Create Board"}
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          {isEdit ? "Update board details." : "Create a new kanban board scoped to a project."}
        </p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Board Name</label>
            <Input
              placeholder="e.g. Sprint Board"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="What is this board for?"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Forge</label>
            <select
              value={form.forgeId}
              onChange={(e) => setForm((p) => ({ ...p, forgeId: e.target.value }))}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a forge...</option>
              {forges.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim() || !form.forgeId}>
            {isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ───────────────────────────────
export default function BoardsListPage() {
  const boards = useProjectStore((s) => s.boards);
  const forges = useProjectStore((s) => s.forges);
  const getForge = useProjectStore((s) => s.getForge);
  const getActionsForBoard = useProjectStore((s) => s.getActionsForBoard);
  const getIterationsForForge = useProjectStore((s) => s.getIterationsForForge);
  const createBoard = useProjectStore((s) => s.createBoard);
  const updateBoard = useProjectStore((s) => s.updateBoard);
  const deleteBoard = useProjectStore((s) => s.deleteBoard);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingBoard, setDeletingBoard] = useState(null);

  const filtered = boards.filter((b) => {
    const forge = getForge(b.forgeId);
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      forge?.name.toLowerCase().includes(q)
    );
  });

  const handleCreate = (form) => {
    createBoard({ name: form.name.trim(), description: form.description.trim(), forgeId: form.forgeId });
    setCreateOpen(false);
  };

  const handleEdit = (form) => {
    updateBoard(editingBoard.id, { name: form.name.trim(), description: form.description.trim(), forgeId: form.forgeId });
    setEditOpen(false);
    setEditingBoard(null);
  };

  const openEdit = (e, board) => {
    e.stopPropagation();
    setEditingBoard(board);
    setEditOpen(true);
  };

  const openDelete = (e, board) => {
    e.stopPropagation();
    setDeletingBoard(board);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingBoard) {
      deleteBoard(deletingBoard.id);
      setDeleteOpen(false);
      setDeletingBoard(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Boards</h2>
          <p className="text-sm text-muted-foreground">
            Manage kanban boards for your forges.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search boards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button size="sm" className="h-9 text-sm gap-1.5 shrink-0" onClick={() => setCreateOpen(true)}>
            <Plus size={15} />
            New Board
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Columns3 size={48} className="mb-4 opacity-30" />
          <p className="text-base font-medium">No boards found</p>
          <p className="text-sm">Create a board to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((board) => {
            const forge = getForge(board.forgeId);
            const boardActions = getActionsForBoard(board.id);
            const iterations = getIterationsForForge(board.forgeId);
            return (
              <Card
                key={board.id}
                className="group cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/boards/${board.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: forge?.color || "#6366f1" }}
                    >
                      <Columns3 size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={(e) => openEdit(e, board)}>
                            <Pencil size={14} className="mr-2" />
                            Edit Board
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => openDelete(e, board)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete Board
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ArrowRight
                        size={16}
                        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{board.name}</h3>
                  {board.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{board.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground/70 mb-3">
                    {forge?.name || "Unknown Forge"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {boardActions.length} actions
                    </Badge>
                    {iterations.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {iterations.length} sprint{iterations.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Board Dialog */}
      <BoardFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        forges={forges}
        initial={{ name: "", description: "", forgeId: "" }}
        onSubmit={handleCreate}
        isEdit={false}
      />

      {/* Edit Board Dialog */}
      <BoardFormDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingBoard(null); }}
        forges={forges}
        initial={editingBoard ? { name: editingBoard.name, description: editingBoard.description || "", forgeId: editingBoard.forgeId } : { name: "", description: "", forgeId: "" }}
        onSubmit={handleEdit}
        isEdit={true}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingBoard(null); }}
        onConfirm={confirmDelete}
        name={deletingBoard?.name}
      />
    </div>
  );
}
