import { useParams, useNavigate } from "react-router";
import { useProjectStore } from "@/stores/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  ACTION_TYPE_LABELS,
} from "@/lib/constants";
import { ArrowLeft, Layers, BookOpen, CheckSquare } from "lucide-react";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const getProject = useProjectStore((s) => s.getProject);
  const getBlueprintsForProject = useProjectStore((s) => s.getBlueprintsForProject);
  const getModulesForBlueprint = useProjectStore((s) => s.getModulesForBlueprint);
  const getActionsForModule = useProjectStore((s) => s.getActionsForModule);

  const project = getProject(projectId);
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium">Project not found</p>
        <Button variant="ghost" onClick={() => navigate("/projects")} className="mt-2">
          Back to Projects
        </Button>
      </div>
    );
  }

  const blueprints = getBlueprintsForProject(projectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
            <p className="text-muted-foreground text-sm">{project.description}</p>
          </div>
        </div>
      </div>

      {/* Hierarchy */}
      {blueprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Layers size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">No blueprints yet</p>
          <p className="text-sm">This project doesn't have any epics defined.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blueprints.map((blueprint) => {
            const modules = getModulesForBlueprint(blueprint.id);
            return (
              <Card key={blueprint.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" />
                    <CardTitle className="text-base">{blueprint.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{blueprint.description}</p>
                </CardHeader>
                <CardContent>
                  {modules.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No modules</p>
                  ) : (
                    <div className="space-y-3">
                      {modules.map((mod) => {
                        const modActions = getActionsForModule(mod.id);
                        return (
                          <div key={mod.id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Layers size={16} className="text-muted-foreground" />
                              <span className="font-medium text-sm">{mod.name}</span>
                              <Badge variant="secondary" className="ml-auto">
                                {modActions.length} actions
                              </Badge>
                            </div>
                            {modActions.length > 0 ? (
                              <div className="space-y-2">
                                {modActions.map((action) => (
                                  <div
                                    key={action.id}
                                    className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted/50"
                                  >
                                    <CheckSquare size={14} className="text-muted-foreground shrink-0" />
                                    <span className="text-sm flex-1">{action.title}</span>
                                    <Badge variant="outline" className="text-[10px]">
                                      {ACTION_TYPE_LABELS[action.type]}
                                    </Badge>
                                    <Badge
                                      className={`text-[10px] ${STATUS_COLORS[action.status]}`}
                                    >
                                      {STATUS_LABELS[action.status]}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">
                                No actions in this module
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
