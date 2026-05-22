import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/stores/useProjectStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { STATUS } from "@/lib/constants";
import {
  Search,
  ArrowRight,
  FolderKanban,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

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
        <h3 className="text-lg font-semibold mb-2">Delete Forge</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <strong>{name}</strong>? This will remove all blueprints, modules, and actions within it. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Forge Form Dialog (Create + Edit) ───────
function ForgeFormDialog({ open, onClose, initial, onSubmit, isEdit }) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-1">
          {isEdit ? "Edit Forge" : "New Forge"}
        </h3>
        {!isEdit && (
          <p className="text-sm text-muted-foreground mb-5">
            Create a new forge to organize your projects.
          </p>
        )}
        {isEdit && <div className="mb-5" />}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What is this forge about?"
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{
                    backgroundColor: c,
                    outline: form.color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim()}>
            {isEdit ? "Save" : "Create Forge"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ───────────────────────────────
export default function ForgesPage() {
  const forges = useProjectStore((s) => s.forges);
  const actions = useProjectStore((s) => s.actions);
  const blueprints = useProjectStore((s) => s.blueprints);
  const modules = useProjectStore((s) => s.modules);
  const createForge = useProjectStore((s) => s.createForge);
  const updateForge = useProjectStore((s) => s.updateForge);
  const deleteForge = useProjectStore((s) => s.deleteForge);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingForge, setEditingForge] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingForge, setDeletingForge] = useState(null);

  const handleCreate = (form) => {
    createForge({ name: form.name.trim(), description: form.description.trim(), color: form.color });
    setCreateOpen(false);
  };

  const handleEdit = (form) => {
    updateForge(editingForge.id, { name: form.name.trim(), description: form.description.trim(), color: form.color });
    setEditOpen(false);
    setEditingForge(null);
  };

  const openEdit = (e, forge) => {
    e.stopPropagation();
    setEditingForge(forge);
    setEditOpen(true);
  };

  const openDelete = (e, forge) => {
    e.stopPropagation();
    setDeletingForge(forge);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingForge) {
      deleteForge(deletingForge.id);
      setDeleteOpen(false);
      setDeletingForge(null);
    }
  };

  const filtered = forges.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q)
    );
  });

  const getForgeStats = (forgeId) => {
    const bpIds = blueprints.filter((b) => b.forgeId === forgeId).map((b) => b.id);
    const modIds = modules.filter((m) => bpIds.includes(m.blueprintId)).map((m) => m.id);
    const forgeActions = actions.filter((a) => modIds.includes(a.moduleId));
    const total = forgeActions.length;
    const completed = forgeActions.filter((a) => a.status === STATUS.CRAFTED).length;
    return { total, completed, progress: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Forges</h2>
          <p className="text-sm text-muted-foreground">Manage your forges and track progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search forges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button size="sm" className="h-9 text-sm gap-1.5 shrink-0" onClick={() => setCreateOpen(true)}>
            <Plus size={15} />
            New Forge
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FolderKanban size={48} className="mb-4 opacity-30" />
          <p className="text-base font-medium">No forges found</p>
          <p className="text-sm">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((forge) => {
            const stats = getForgeStats(forge.id);
            return (
              <Card
                key={forge.id}
                className="group cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/forges/${forge.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: forge.color }}
                    >
                      {forge.name.charAt(0)}
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
                          <DropdownMenuItem onClick={(e) => openEdit(e, forge)}>
                            <Pencil size={14} className="mr-2" />
                            Edit Forge
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => openDelete(e, forge)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete Forge
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ArrowRight
                        size={16}
                        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{forge.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                    {forge.description}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{stats.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{stats.completed}/{stats.total} actions crafted</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Forge Dialog */}
      <ForgeFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initial={{ name: "", description: "", color: COLORS[0] }}
        onSubmit={handleCreate}
        isEdit={false}
      />

      {/* Edit Forge Dialog */}
      <ForgeFormDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingForge(null); }}
        initial={editingForge ? { name: editingForge.name, description: editingForge.description || "", color: editingForge.color } : { name: "", description: "", color: COLORS[0] }}
        onSubmit={handleEdit}
        isEdit={true}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingForge(null); }}
        onConfirm={confirmDelete}
        name={deletingForge?.name}
      />
    </div>
  );
}
