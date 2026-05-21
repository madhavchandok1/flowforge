import { useState } from "react";
import { useNavigate } from "react-router";
import { useProjectStore } from "@/stores/useProjectStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { STATUS } from "@/lib/constants";
import { Search, ArrowRight, FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const actions = useProjectStore((s) => s.actions);
  const blueprints = useProjectStore((s) => s.blueprints);
  const modules = useProjectStore((s) => s.modules);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getProjectStats = (projectId) => {
    const bpIds = blueprints.filter((b) => b.projectId === projectId).map((b) => b.id);
    const modIds = modules.filter((m) => bpIds.includes(m.blueprintId)).map((m) => m.id);
    const projectActions = actions.filter((a) => modIds.includes(a.moduleId));
    const total = projectActions.length;
    const completed = projectActions.filter((a) => a.status === STATUS.CRAFTED).length;
    return { total, completed, progress: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your forges and track progress.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FolderKanban size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <Card
                key={project.id}
                className="group cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name.charAt(0)}
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <h3 className="font-semibold text-base mb-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
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
                      <span>{stats.completed}/{stats.total} tasks done</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
