import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router";
import { useProjectStore } from "@/stores/useProjectStore";
import { KANBAN_COLUMNS, ACTION_TYPE_LABELS, STATUS_LABELS, ITEM_TYPE } from "@/lib/constants";
import CreateItemDialog from "@/components/CreateItemDialog";
import { users } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
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
import {
  ArrowLeft,
  AlertCircle,
  Inbox,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  Bug,
  NotepadText,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

// ─── Animated Select Dropdown ────────────────
function AnimatedSelect({ value, onChange, options, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm flex items-center gap-2 hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className={cn(!selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 mt-1 min-w-full bg-popover border rounded-md shadow-md py-1"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  "flex items-center w-full px-2.5 py-1.5 text-sm text-left hover:bg-accent transition-colors",
                  value === opt.value && "bg-accent"
                )}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
   const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: action.id,
  });
  const isGlitch = action.type === "glitch";

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            layoutId={`item-${action.id}`}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={isDragging ? { opacity: 0.3 } : undefined}
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
              <Bug size={12} className="text-destructive shrink-0 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
            ) : action.status === "crafted" ? (
              <NotepadText size={12} className="text-green-500 shrink-0 drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
            ) : (
              <NotepadText size={12} className="text-amber-500 shrink-0 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
            )}
            <span className="text-xs text-foreground/80 truncate flex-1 leading-tight">
              {action.title}
            </span>
            <AssigneeAvatar user={action.assignee} size="sm" />
          </motion.div>
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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: action.id,
  });

  return (
    <motion.div
      layoutId={`item-${action.id}`}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={isDragging ? { opacity: 0.3 } : undefined}
      className="cursor-grab active:cursor-grabbing"
    >
      <KanbanCard action={action} isDragging={isDragging} onClick={onClick} />
    </motion.div>
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
          "overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
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
      <div className="flex flex-col items-center w-[48px] shrink-0 bg-card border-r transition-[width] duration-300">
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
    <div className="flex flex-col w-[300px] shrink-0 bg-card border-r transition-[width] duration-300 overflow-hidden">
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
          "flex-1 overflow-hidden",
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
    <div className="flex flex-col max-w-[300px] flex-1 h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className="text-sm font-semibold">{column.label}</h3>
        <Badge variant="secondary" className="text-[10px]">
          {actions.length}
        </Badge>
      </div>
      <motion.div
        layout
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 p-2 rounded-lg overflow-y-auto",
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
      </motion.div>
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
  const getForge = useProjectStore((s) => s.getForge);
  const getIterationsForForge = useProjectStore((s) => s.getIterationsForForge);
  const getActionsForBoard = useProjectStore((s) => s.getActionsForBoard);
  const getBlueprintsForForge = useProjectStore((s) => s.getBlueprintsForForge);
  const updateActionStatus = useProjectStore((s) => s.updateActionStatus);
  const updateAction = useProjectStore((s) => s.updateAction);
  const createIteration = useProjectStore((s) => s.createIteration);
  const modules = useProjectStore((s) => s.modules);

  const [activeId, setActiveId] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [sprintForm, setSprintForm] = useState({ name: "", startDate: "", endDate: "" });
  const [groupByUser, setGroupByUser] = useState(false);
  const [filterUser, setFilterUser] = useState("all");

  const board = getBoard(boardId);
  const forge = board ? getForge(board.forgeId) : null;
  const iterations = board ? getIterationsForForge(board.forgeId) : [];
  const blueprints = board ? getBlueprintsForForge(board.forgeId) : [];

  // Auto-select first sprint when iterations load
  useEffect(() => {
    if (!selectedSprint && iterations.length > 0) {
      setSelectedSprint(iterations[0].id);
    }
  }, [iterations, selectedSprint]);

  // ALL actions for this board (no sprint filter)
  const allActions = board ? getActionsForBoard(board.id) : [];

  // Backlog: ALL unassigned tasks regardless of sprint
  const unassignedActions = allActions.filter((a) => a.status === null || a.status === "drafted");

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

  if (!board || !forge) {
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

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

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
      forgeId: forge.id,
      name: sprintForm.name.trim(),
      startDate: sprintForm.startDate,
      endDate: sprintForm.endDate,
    });
    setSprintForm({ name: "", startDate: "", endDate: "" });
    setSprintDialogOpen(false);
  };

  const handleTaskClick = (action) => setEditingTask(action);

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
              style={{ backgroundColor: forge.color }}
            >
              <span className="font-bold text-sm">{board.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{board.name}</h2>
              <p className="text-sm text-muted-foreground">{forge.name}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sprint Dropdown */}
          <AnimatedSelect
            value={selectedSprint || ""}
            onChange={setSelectedSprint}
            options={iterations.map((iter) => ({ value: iter.id, label: iter.name }))}
            placeholder="Select sprint..."
          />
          <Button variant="outline" size="sm" onClick={() => setSprintDialogOpen(true)}>
            <Plus size={14} />
            New Sprint
          </Button>

          <div className="w-px h-6 bg-border" />

          {/* User Filter */}
          <AnimatedSelect
            value={filterUser}
            onChange={setFilterUser}
            options={[{ value: "all", label: "All Users" }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
            placeholder="Filter user..."
          />

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
        <LayoutGroup>
        <div className="flex flex-1 overflow-hidden">
          {/* Backlog — always shows ALL unassigned tasks */}
          <BacklogSidebar
            actions={unassignedActions}
            blueprints={blueprints}
            modules={modules}
            onTaskClick={handleTaskClick}
          />

          {/* Kanban — filtered by selected sprint */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden bg-background scrollbar-hide">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSprint}
                className="flex gap-5 p-6 h-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </LayoutGroup>

        <DragOverlay dropAnimation={null} usePortal={false}>
          {activeAction ? (
            <motion.div layoutId={`item-${activeAction.id}`}>
              <KanbanCard action={activeAction} />
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Task Dialog — reuses CreateItemDialog */}
      {(() => {
        const mod = editingTask ? modules.find((m) => m.id === editingTask.moduleId) : null;
        const bp = mod ? blueprints.find((b) => b.id === mod.blueprintId) : null;
        const breadcrumb = [forge.name, bp?.name, mod?.name].filter(Boolean);
        return (
          <CreateItemDialog
            open={!!editingTask}
            onClose={() => setEditingTask(null)}
            type={editingTask?.type === "glitch" ? ITEM_TYPE.BUG : ITEM_TYPE.TASK}
            item={editingTask}
            breadcrumb={editingTask ? breadcrumb : []}
            parentContext={{ forge }}
          />
        );
      })()}

      {/* Create Sprint Dialog */}
      <Modal open={sprintDialogOpen} onClose={() => setSprintDialogOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-1">Create Sprint</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Add a new sprint iteration to this board.
          </p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Sprint Name</label>
              <Input
                placeholder="e.g. Sprint 3"
                value={sprintForm.name}
                onChange={(e) => setSprintForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={sprintForm.startDate}
                  onChange={(e) => setSprintForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={sprintForm.endDate}
                  onChange={(e) => setSprintForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setSprintDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSprint}
              disabled={!sprintForm.name.trim() || !sprintForm.startDate || !sprintForm.endDate}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
