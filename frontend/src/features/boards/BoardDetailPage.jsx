import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useProjectStore } from "@/stores/useProjectStore";
import { KANBAN_COLUMNS, ACTION_TYPE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { users } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  AlertCircle,
  Inbox,
  ChevronRight,
  BookOpen,
  Layers,
  CircleDot,
  Bug,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  X,
  Save,
  Plus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Assignee Avatar (small, for cards)
// ─────────────────────────────────────────────
function AssigneeAvatar({ user, size = "sm" }) {
  const sizeClass = size === "sm" ? "h-5 w-5 text-[8px]" : "h-7 w-7 text-[10px]";
  if (!user) {
    return (
      <div className={cn(sizeClass, "rounded-full bg-muted flex items-center justify-center shrink-0")}>
        <span className="text-muted-foreground">?</span>
      </div>
    );
  }
  return (
    <div
      className={cn(sizeClass, "rounded-full flex items-center justify-center shrink-0 font-semibold text-white")}
      style={{ backgroundColor: user.color }}
      title={user.name}
    >
      {user.initials}
    </div>
  );
}

// ─────────────────────────────────────────────
// Draggable Task Row (sidebar item)
// ─────────────────────────────────────────────
function DraggableTaskRow({ action, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: action.id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  const isGlitch = action.type === "glitch";

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(action);
            }}
            className={cn(
              "group flex items-center gap-2 py-1.5 px-2 rounded-md cursor-grab active:cursor-grabbing transition-colors",
              "hover:bg-accent/60",
              isDragging && "opacity-40 bg-primary/10"
            )}
          >
            {isGlitch ? (
              <Bug size={12} className="text-destructive shrink-0" />
            ) : (
              <CircleDot size={12} className="text-muted-foreground/60 shrink-0" />
            )}
            <span className="text-xs text-foreground/80 truncate flex-1 leading-tight">
              {action.title}
            </span>
            <AssigneeAvatar user={action.assignee} size="sm" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="max-w-[250px] bg-popover text-popover-foreground border shadow-md"
        >
          <span className="text-xs break-words">{action.title}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─────────────────────────────────────────────
// Kanban Card (inside columns)
// ─────────────────────────────────────────────
function KanbanCard({ action, isDragging, onClick }) {
  const isGlitch = action.type === "glitch";
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(action);
      }}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow",
        isDragging && "opacity-50 ring-2 ring-primary",
        isGlitch && "border-l-2 border-l-destructive"
      )}
    >
      <p className="text-sm font-medium leading-snug mb-2">{action.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge variant={isGlitch ? "danger" : "info"} className="text-[10px]">
            {isGlitch && <AlertCircle size={10} className="mr-0.5" />}
            {ACTION_TYPE_LABELS[action.type]}
          </Badge>
          <span className="text-[10px] text-muted-foreground capitalize">
            {action.priority}
          </span>
        </div>
        <AssigneeAvatar user={action.assignee} size="sm" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Draggable Kanban Card (inside columns)
// ─────────────────────────────────────────────
function DraggableKanbanCard({ action, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: action.id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <KanbanCard action={action} isDragging={isDragging} onClick={onClick} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Task Detail Dialog
// ─────────────────────────────────────────────
function TaskDetailDialog({ action, open, onClose, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  if (!action) return null;

  const startEdit = () => {
    setForm({
      title: action.title,
      description: action.description || "",
      priority: action.priority,
      assigneeId: action.assignee?.id || "",
      type: action.type,
    });
    setEditing(true);
  };

  const handleSave = () => {
    const assignee = form.assigneeId ? users.find((u) => u.id === form.assigneeId) : null;
    onSave(action.id, {
      title: form.title,
      description: form.description,
      priority: form.priority,
      type: form.type,
      assignee,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const isGlitch = action.type === "glitch";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left pr-8">
            {isGlitch ? (
              <Bug size={18} className="text-destructive shrink-0" />
            ) : (
              <CircleDot size={18} className="text-primary shrink-0" />
            )}
            <span className="truncate">{editing ? "Edit Task" : action.title}</span>
          </DialogTitle>
        </DialogHeader>

        {editing ? (
          /* ── Edit Mode ── */
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="task">Task</option>
                  <option value="glitch">Glitch</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <select
                value={form.assigneeId}
                onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          /* ── View Mode ── */
          <div className="space-y-4 py-2">
            {action.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {action.description}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Status
                </p>
                <Badge variant={action.status ? "default" : "secondary"}>
                  {action.status ? STATUS_LABELS[action.status] : "Backlog"}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Type
                </p>
                <Badge variant={isGlitch ? "danger" : "info"}>
                  {isGlitch && <AlertCircle size={10} className="mr-0.5" />}
                  {ACTION_TYPE_LABELS[action.type]}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Priority
                </p>
                <span className={cn(
                  "text-xs px-2 py-1 rounded font-medium capitalize",
                  action.priority === "high" && "bg-destructive/10 text-destructive",
                  action.priority === "medium" && "bg-status-queued/20 text-yellow-700 dark:text-yellow-300",
                  action.priority === "low" && "bg-muted text-muted-foreground"
                )}>
                  {action.priority}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Assignee
                </p>
                <div className="flex items-center gap-2">
                  <AssigneeAvatar user={action.assignee} size="sm" />
                  <span className="text-sm">
                    {action.assignee?.name || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X size={14} />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save size={14} />
                Save
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil size={14} />
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Tree Node (collapsible, with connector lines)
// ─────────────────────────────────────────────
function TreeNode({
  label,
  icon: Icon,
  count,
  children,
  depth = 0,
  defaultOpen = true,
  isLeaf = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (isLeaf) {
    return (
      <div className="overflow-hidden" style={{ paddingLeft: `${depth * 8 + 4}px` }}>
        {children}
      </div>
    );
  }

  return (
    <div>
      <button
        className={cn(
          "group flex items-center w-full text-left rounded-md transition-colors overflow-hidden",
          "hover:bg-accent/50",
          depth === 0 ? "py-1.5 px-1.5" : "py-1 px-1.5"
        )}
        style={{ paddingLeft: `${depth * 8 + 4}px` }}
        onClick={() => setOpen(!open)}
      >
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          <ChevronRight
            size={12}
            className={cn(
              "text-muted-foreground/50 transition-transform duration-200 ease-out",
              open && "rotate-90"
            )}
          />
        </span>
        {Icon && (
          <Icon
            size={depth === 0 ? 14 : 12}
            className={cn(
              "shrink-0 ml-0.5",
              depth === 0 ? "text-primary/70" : "text-muted-foreground/50"
            )}
          />
        )}
        <span
          className={cn(
            "ml-1.5 truncate",
            depth === 0
              ? "text-[13px] font-semibold text-foreground/90"
              : "text-xs text-foreground/70"
          )}
        >
          {label}
        </span>
        {count > 0 && (
          <span className="ml-auto text-[9px] text-muted-foreground/60 font-medium tabular-nums">
            {count}
          </span>
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div
          className="relative"
          style={{ marginLeft: `${depth * 8 + 12}px` }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60" />
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Collapsible Backlog Sidebar (drag source + drop target)
// ─────────────────────────────────────────────
function BacklogSidebar({ actions, blueprints, modules, onTaskClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: "unassigned" });

  const hierarchy = useMemo(() => {
    const bpIds = [
      ...new Set(
        actions
          .map((a) => {
            const mod = modules.find((m) => m.id === a.moduleId);
            return mod?.blueprintId;
          })
          .filter(Boolean)
      ),
    ];
    return bpIds.map((bpId) => {
      const bp = blueprints.find((b) => b.id === bpId);
      const bpModules = modules.filter((m) => m.blueprintId === bpId);
      return { blueprint: bp, modules: bpModules };
    });
  }, [actions, blueprints, modules]);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center w-[48px] shrink-0 bg-card border-r transition-all duration-300">
        <div className="flex items-center justify-center h-12 border-b w-full">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-3 pt-3">
          <div className="relative">
            <Inbox size={18} className="text-muted-foreground" />
            {actions.length > 0 && (
              <span className="absolute -top-1 -right-2 text-[8px] font-bold bg-primary text-primary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {actions.length}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[300px] shrink-0 bg-card border-r transition-all duration-300 overflow-hidden">
      <div className="flex items-center gap-2 h-12 px-3 border-b shrink-0">
        <Inbox size={15} className="text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Backlog
        </span>
        <span className="ml-auto text-[10px] font-medium text-muted-foreground/60 tabular-nums">
          {actions.length}
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-hidden transition-colors duration-150",
          isOver ? "bg-primary/10 ring-2 ring-primary/30 ring-inset" : ""
        )}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <div className="py-1 px-1">
            {hierarchy.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40">
                <Inbox size={28} className="mb-2 opacity-30" />
                <p className="text-xs font-medium">Backlog is empty</p>
              </div>
            ) : (
              hierarchy.map(({ blueprint, modules: bpModules }) => {
                const bpActionCount = actions.filter((a) => {
                  const mod = modules.find((m) => m.id === a.moduleId);
                  return mod?.blueprintId === blueprint.id;
                }).length;
                return (
                  <TreeNode
                    key={blueprint.id}
                    label={blueprint.name}
                    icon={BookOpen}
                    count={bpActionCount}
                    depth={0}
                    defaultOpen={true}
                  >
                    {bpModules.map((mod) => {
                      const modActions = actions.filter((a) => a.moduleId === mod.id);
                      if (modActions.length === 0) return null;
                      return (
                        <TreeNode
                          key={mod.id}
                          label={mod.name}
                          icon={Layers}
                          count={modActions.length}
                          depth={1}
                          defaultOpen={true}
                        >
                          {modActions.map((action) => (
                            <TreeNode
                              key={action.id}
                              label={action.title}
                              depth={2}
                              isLeaf
                            >
                              <DraggableTaskRow action={action} onClick={onTaskClick} />
                            </TreeNode>
                          ))}
                        </TreeNode>
                      );
                    })}
                  </TreeNode>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Kanban Column (droppable)
// ─────────────────────────────────────────────
function KanbanColumn({ column, actions, onTaskClick, groupByUser }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  // Group actions by assignee when groupByUser is on
  const grouped = useMemo(() => {
    if (!groupByUser) return null;
    const map = new Map();
    for (const action of actions) {
      const key = action.assignee?.id || "__unassigned__";
      if (!map.has(key)) map.set(key, { user: action.assignee, actions: [] });
      map.get(key).actions.push(action);
    }
    return Array.from(map.values());
  }, [actions, groupByUser]);

  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] flex-1 h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className="text-sm font-semibold">{column.label}</h3>
        <Badge variant="secondary" className="text-[10px]">
          {actions.length}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 p-2 rounded-lg overflow-y-auto transition-colors duration-150",
          isOver ? "bg-primary/10 ring-2 ring-primary/30" : "bg-muted/30"
        )}
      >
        {grouped
          ? grouped.map((group) => (
              <div key={group.user?.id || "none"} className="space-y-1.5">
                <div className="flex items-center gap-2 px-1 pt-1">
                  <AssigneeAvatar user={group.user} size="sm" />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {group.user?.name || "Unassigned"}
                  </span>
                  <span className="text-[9px] text-muted-foreground/50 ml-auto">
                    {group.actions.length}
                  </span>
                </div>
                <div className="space-y-1.5 pl-1 border-l-2 border-border/40 ml-2">
                  {group.actions.map((action) => (
                    <DraggableKanbanCard key={action.id} action={action} onClick={onTaskClick} />
                  ))}
                </div>
              </div>
            ))
          : actions.map((action) => (
              <DraggableKanbanCard key={action.id} action={action} onClick={onTaskClick} />
            ))}
        {actions.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const getBoard = useProjectStore((s) => s.getBoard);
  const getProject = useProjectStore((s) => s.getProject);
  const getIterationsForProject = useProjectStore((s) => s.getIterationsForProject);
  const getActionsForBoard = useProjectStore((s) => s.getActionsForBoard);
  const getBlueprintsForProject = useProjectStore((s) => s.getBlueprintsForProject);
  const updateActionStatus = useProjectStore((s) => s.updateActionStatus);
  const updateAction = useProjectStore((s) => s.updateAction);
  const createIteration = useProjectStore((s) => s.createIteration);
  const modules = useProjectStore((s) => s.modules);

  const [activeId, setActiveId] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [sprintForm, setSprintForm] = useState({ name: "", startDate: "", endDate: "" });
  const [groupByUser, setGroupByUser] = useState(false);
  const [filterUser, setFilterUser] = useState("all");

  const board = getBoard(boardId);
  const project = board ? getProject(board.projectId) : null;
  const iterations = board ? getIterationsForProject(board.projectId) : [];
  const blueprints = board ? getBlueprintsForProject(board.projectId) : [];

  // Auto-select first sprint when iterations load
  useEffect(() => {
    if (!selectedSprint && iterations.length > 0) {
      setSelectedSprint(iterations[0].id);
    }
  }, [iterations, selectedSprint]);

  // ALL actions for this board (no sprint filter)
  const allActions = board ? getActionsForBoard(board.id) : [];

  // Backlog: ALL unassigned tasks regardless of sprint
  const unassignedActions = allActions.filter((a) => a.status === null);

  // Kanban: assigned tasks filtered by sprint and optionally by user
  const assignedActions = allActions.filter((a) => {
    if (a.status === null) return false;
    if (selectedSprint && a.iterationId !== selectedSprint) return false;
    if (filterUser !== "all" && a.assignee?.id !== filterUser) return false;
    return true;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeAction = allActions.find((a) => a.id === activeId);

  if (!board || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium">Board not found</p>
        <Button variant="ghost" onClick={() => navigate("/boards")} className="mt-2">
          Back to Boards
        </Button>
      </div>
    );
  }

  const findContainer = (id) => {
    if (id === "unassigned") return "unassigned";
    if (KANBAN_COLUMNS.find((col) => col.id === id)) return id;
    const action = allActions.find((a) => a.id === id);
    if (action) return action.status || "unassigned";
    return null;
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const overContainer = findContainer(over.id);
    if (!overContainer) return;

    const activeContainer = findContainer(active.id);
    if (activeContainer === overContainer) return;

    const newStatus = overContainer === "unassigned" ? null : overContainer;
    updateActionStatus(active.id, newStatus);

    // When dropping into a column, assign to current sprint
    if (newStatus !== null && selectedSprint) {
      updateAction(active.id, { iterationId: selectedSprint });
    }

    // When dropping back to backlog, clear the sprint
    if (newStatus === null) {
      updateAction(active.id, { iterationId: null });
    }
  };

  const handleCreateSprint = () => {
    if (!sprintForm.name.trim() || !sprintForm.startDate || !sprintForm.endDate) return;
    createIteration({
      projectId: project.id,
      name: sprintForm.name.trim(),
      startDate: sprintForm.startDate,
      endDate: sprintForm.endDate,
    });
    setSprintForm({ name: "", startDate: "", endDate: "" });
    setSprintDialogOpen(false);
  };

  const handleTaskClick = (action) => setSelectedTask(action);
  const handleTaskSave = (actionId, updates) => {
    updateAction(actionId, updates);
    const updated = allActions.find((a) => a.id === actionId);
    if (updated) setSelectedTask({ ...updated, ...updates });
  };

  return (
    <div className="flex flex-col -m-6" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap px-6 py-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/boards")}>
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: project.color }}
            >
              <span className="font-bold text-sm">{board.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{board.name}</h2>
              <p className="text-sm text-muted-foreground">{project.name}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sprint Dropdown */}
          <select
            value={selectedSprint || ""}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {iterations.map((iter) => (
              <option key={iter.id} value={iter.id}>
                {iter.name}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => setSprintDialogOpen(true)}>
            <Plus size={14} />
            New Sprint
          </Button>

          <div className="w-px h-6 bg-border" />

          {/* User Filter */}
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Group by User Toggle */}
          <button
            onClick={() => setGroupByUser(!groupByUser)}
            className={cn(
              "h-9 px-3 rounded-md border text-sm font-medium transition-colors flex items-center gap-1.5",
              groupByUser
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-input hover:bg-accent"
            )}
          >
            <Users size={14} />
            Group
          </button>
        </div>
      </div>

      {/* Board Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Backlog — always shows ALL unassigned tasks */}
          <BacklogSidebar
            actions={unassignedActions}
            blueprints={blueprints}
            modules={modules}
            onTaskClick={handleTaskClick}
          />

          {/* Kanban — filtered by selected sprint */}
          <div className="flex-1 overflow-x-auto bg-background">
            <div className="flex gap-5 p-6 min-w-max h-full">
              {KANBAN_COLUMNS.map((column) => {
                const columnActions = assignedActions.filter((a) => a.status === column.id);
                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    actions={columnActions}
                    onTaskClick={handleTaskClick}
                    groupByUser={groupByUser}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeAction ? <KanbanCard action={activeAction} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        action={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleTaskSave}
      />

      {/* Create Sprint Dialog */}
      <Dialog open={sprintDialogOpen} onOpenChange={setSprintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sprint Name</label>
              <Input
                placeholder="e.g. Sprint 3"
                value={sprintForm.name}
                onChange={(e) => setSprintForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={sprintForm.startDate}
                  onChange={(e) => setSprintForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={sprintForm.endDate}
                  onChange={(e) => setSprintForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSprintDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSprint}
              disabled={!sprintForm.name.trim() || !sprintForm.startDate || !sprintForm.endDate}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
