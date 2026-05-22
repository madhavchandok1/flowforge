import { useState } from "react";
import { useNavigate } from "react-router";
import { useProjectStore } from "@/stores/useProjectStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Columns3, Plus, Search, ArrowRight, Trash2 } from "lucide-react";

export default function BoardsListPage() {
  const boards = useProjectStore((s) => s.boards);
  const forges = useProjectStore((s) => s.forges);
  const getForge = useProjectStore((s) => s.getForge);
  const getActionsForBoard = useProjectStore((s) => s.getActionsForBoard);
  const getIterationsForForge = useProjectStore((s) => s.getIterationsForForge);
  const createBoard = useProjectStore((s) => s.createBoard);
  const deleteBoard = useProjectStore((s) => s.deleteBoard);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: "", forgeId: "" });

  const filtered = boards.filter((b) => {
    const forge = getForge(b.forgeId);
    return (
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      forge?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreate = () => {
    if (!newBoard.name.trim() || !newBoard.forgeId) return;
    createBoard({ name: newBoard.name.trim(), forgeId: newBoard.forgeId });
    setNewBoard({ name: "", forgeId: "" });
    setCreateOpen(false);
  };

  const handleDelete = (e, boardId) => {
    e.stopPropagation();
    deleteBoard(boardId);
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
                      <button
                        onClick={(e) => handleDelete(e, board.id)}
                        className="p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ArrowRight
                        size={16}
                        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{board.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
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
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Board</DialogTitle>
            <DialogDescription>
              Create a new kanban board scoped to a project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Board Name</label>
              <Input
                placeholder="e.g. Sprint Board"
                value={newBoard.name}
                onChange={(e) =>
                  setNewBoard((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Forge</label>
              <select
                value={newBoard.forgeId}
                onChange={(e) =>
                  setNewBoard((prev) => ({ ...prev, forgeId: e.target.value }))
                }
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a forge...</option>
                {forges.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newBoard.name.trim() || !newBoard.forgeId}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
