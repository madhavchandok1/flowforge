import { useState } from "react";
import { useNavigate } from "react-router";
import { useProjectStore } from "@/stores/useProjectStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { STATUS } from "@/lib/constants";
import { Search, ArrowRight, FolderKanban, Plus } from "lucide-react";

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function ForgesPage() {
  const forges = useProjectStore((s) => s.forges);
  const actions = useProjectStore((s) => s.actions);
  const blueprints = useProjectStore((s) => s.blueprints);
  const modules = useProjectStore((s) => s.modules);
  const createForge = useProjectStore((s) => s.createForge);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newForge, setNewForge] = useState({ name: "", description: "", color: COLORS[0] });

  const handleCreate = () => {
    if (!newForge.name.trim()) return;
    createForge({ name: newForge.name.trim(), description: newForge.description.trim(), color: newForge.color });
    setNewForge({ name: "", description: "", color: COLORS[0] });
    setDialogOpen(false);
  };

  const filtered = forges.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <Button size="sm" className="h-9 text-sm gap-1.5 shrink-0" onClick={() => setDialogOpen(true)}>
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
                    <ArrowRight
                      size={16}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Forge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g. Website Redesign"
                value={newForge.name}
                onChange={(e) => setNewForge((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={newForge.description}
                onChange={(e) => setNewForge((f) => ({ ...f, description: e.target.value }))}
                placeholder="What is this forge about?"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewForge((f) => ({ ...f, color: c }))}
                    className="w-7 h-7 rounded-full transition-all"
                    style={{
                      backgroundColor: c,
                      outline: newForge.color === c ? `2px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!newForge.name.trim()}>
              Create Forge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
