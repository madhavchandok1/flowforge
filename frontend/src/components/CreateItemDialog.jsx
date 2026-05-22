import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useProjectStore } from "@/stores/useProjectStore";
import { currentUser, users } from "@/lib/mock-data";
import { ITEM_TYPE, ITEM_TYPE_LABELS, STATUS, STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  X,
  ChevronRight,
  BookOpen,
  Layers,
  NotepadText,
  Bug,
  ChevronDown,
  Check,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

// ─────────────────────────────────────────────
// Simple select dropdown
// ─────────────────────────────────────────────
function SimpleSelect({ value, onChange, options, placeholder, className, disabled }) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 pr-7 text-xs leading-none shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ─────────────────────────────────────────────
// User selector
// ─────────────────────────────────────────────
function UserSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = users.find((u) => u.id === value);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring leading-none"
      >
        {selected ? (
          <>
            <img src={selected.avatar} alt="" className="w-4 h-4 rounded-full" />
            <span className="flex-1 text-left truncate">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-muted-foreground">Unassigned</span>
        )}
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md py-1"
          >
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs hover:bg-accent text-muted-foreground"
            >
              Unassigned
            </button>
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onChange(u.id); setOpen(false); }}
                className={cn(
                  "flex items-center gap-2 w-full px-2.5 py-1.5 text-xs hover:bg-accent",
                  value === u.id && "bg-accent"
                )}
              >
                <img src={u.avatar} alt="" className="w-4 h-4 rounded-full" />
                <span className="flex-1 text-left">{u.name}</span>
                {value === u.id && <Check size={12} className="text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Type icon
// ─────────────────────────────────────────────
function TypeIcon({ type, size = 14, className }) {
  switch (type) {
    case ITEM_TYPE.BLUEPRINT:
      return <BookOpen size={size} className={cn("text-primary", className)} />;
    case ITEM_TYPE.MODULE:
      return <Layers size={size} className={cn("text-muted-foreground", className)} />;
    case ITEM_TYPE.TASK:
      return <NotepadText size={size} className={cn("text-amber-500", className)} />;
    case ITEM_TYPE.BUG:
      return <Bug size={size} className={cn("text-destructive", className)} />;
    default:
      return <NotepadText size={size} className={cn("text-muted-foreground", className)} />;
  }
}

// ─────────────────────────────────────────────
// Main Dialog — Create & Edit
// ─────────────────────────────────────────────
export default function CreateItemDialog({
  open,
  onClose,
  type: initialType,
  parentContext,
  breadcrumb = [],
  item = null, // null = create mode, object = edit mode
}) {
  const createBlueprint = useProjectStore((s) => s.createBlueprint);
  const updateBlueprint = useProjectStore((s) => s.updateBlueprint);
  const createModule = useProjectStore((s) => s.createModule);
  const updateModule = useProjectStore((s) => s.updateModule);
  const createAction = useProjectStore((s) => s.createAction);
  const updateAction = useProjectStore((s) => s.updateAction);

  const isEditing = !!item;

  const [title, setTitle] = useState("");
  const [type, setType] = useState(initialType || ITEM_TYPE.TASK);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(STATUS.DRAFTED);
  const [assignee, setAssignee] = useState(null);
  const [sprintId, setSprintId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [effort, setEffort] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const titleRef = useRef(null);
  const tagInputRef = useRef(null);

  // Manage open/close animation lifecycle
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      closingRef.current = false;
      // Allow mount, then trigger enter animation next frame
      requestAnimationFrame(() => setIsVisible(true));
    } else if (shouldRender && !closingRef.current) {
      // Start exit animation
      closingRef.current = true;
      setIsVisible(false);
    }
  }, [open]);

  // Populate fields when dialog opens
  useEffect(() => {
    if (open) {
      if (item) {
        // Edit mode — populate from existing item
        setType(initialType || ITEM_TYPE.TASK);
        setTitle(item.name || item.title || "");
        setDescription(item.description || "");
        setStatus(item.status || STATUS.DRAFTED);
        setAssignee(item.assignee?.id || null);
        setSprintId(item.iterationId || "");
        setDueDate(item.dueDate || "");
        setEffort(item.effort != null ? String(item.effort) : "");
        setTags(item.tags || []);
      } else {
        // Create mode — defaults
        setType(initialType || ITEM_TYPE.TASK);
        setTitle("");
        setDescription("");
        setStatus(STATUS.DRAFTED);
        setAssignee(null);
        setSprintId("");
        setDueDate("");
        setEffort("");
        setTags([]);
      }
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, initialType, item]);

  const iterations = useProjectStore((s) => s.iterations);
  const forge = parentContext?.forge;
  const availableIterations = useMemo(
    () => (forge ? iterations.filter((i) => i.forgeId === forge.id) : iterations),
    [forge, iterations]
  );

  const isBlueprintOrModule = type === ITEM_TYPE.BLUEPRINT || type === ITEM_TYPE.MODULE;
  const isDrafted = status === STATUS.DRAFTED;

  // Auto-clear sprint when drafted; auto-select first sprint when active
  useEffect(() => {
    if (isDrafted) {
      setSprintId("");
    } else if (!sprintId && availableIterations.length) {
      setSprintId(availableIterations[0].id);
    }
  }, [isDrafted, sprintId, availableIterations]);

  const typeOptions = Object.entries(ITEM_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const sprintOptions = availableIterations.map((i) => ({
    value: i.id,
    label: i.name,
  }));

  const canSubmit = title.trim().length > 0;

  // Tag management
  const addTag = (raw) => {
    const t = raw.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
  };
  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));
  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      // Support comma-separated pasting: "tag1, tag2, tag3"
      tagInput.split(",").forEach(addTag);
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };
  const handleTagPaste = (e) => {
    const text = e.clipboardData.getData("text");
    if (text.includes(",")) {
      e.preventDefault();
      text.split(",").forEach(addTag);
      setTagInput("");
    }
  };

  const handleSave = () => {
    if (!canSubmit) return;
    const now = new Date().toISOString();

    if (isEditing) {
      // ── Edit mode — update existing item, keep same ID ──
      if (type === ITEM_TYPE.BLUEPRINT) {
        updateBlueprint(item.id, {
          name: title.trim(),
          description: description.trim(),
        });
      } else if (type === ITEM_TYPE.MODULE) {
        updateModule(item.id, {
          name: title.trim(),
          description: description.trim(),
        });
      } else {
        updateAction(item.id, {
          title: title.trim(),
          description: description.trim(),
          type: type === ITEM_TYPE.BUG ? "glitch" : "task",
          status,
          assignee: assignee ? users.find((u) => u.id === assignee) : null,
          iterationId: isDrafted ? null : (sprintId || null),
          dueDate: dueDate || null,
          effort: effort ? Number(effort) : null,
          tags,
          updatedAt: now,
        });
      }
    } else {
      // ── Create mode — new item with new ID ──
      if (type === ITEM_TYPE.BLUEPRINT) {
        createBlueprint({
          forgeId: parentContext.forgeId,
          name: title.trim(),
          description: description.trim(),
        });
      } else if (type === ITEM_TYPE.MODULE) {
        createModule({
          blueprintId: parentContext.blueprintId,
          name: title.trim(),
          description: description.trim(),
        });
      } else {
        createAction({
          moduleId: parentContext.moduleId,
          title: title.trim(),
          description: description.trim(),
          type: type === ITEM_TYPE.BUG ? "glitch" : "task",
          status,
          assignee: assignee ? users.find((u) => u.id === assignee) : null,
          iterationId: isDrafted ? null : (sprintId || null),
          dueDate: dueDate || null,
          effort: effort ? Number(effort) : null,
          tags,
          priority: "medium",
        });
      }
    }
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleClose();
    if (e.key === "Enter" && !e.shiftKey && e.target === titleRef.current) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleAnimationComplete = (_, info) => {
    // Only clean up on exit (opacity going to 0)
    if (!isVisible && shouldRender) {
      setShouldRender(false);
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[6vh] overflow-y-auto"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          onAnimationComplete={handleAnimationComplete}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background border rounded-xl shadow-2xl w-full max-w-3xl mx-4 mb-8 overflow-hidden"
          >
            {/* Breadcrumb */}
            {breadcrumb.length > 0 && (
              <div className="flex items-center gap-1 px-5 pt-4 pb-0 text-[11px] text-muted-foreground overflow-hidden">
                {breadcrumb.map((item, i) => (
                  <span key={i} className="flex items-center gap-1 min-w-0 shrink">
                    {i > 0 && <ChevronRight size={10} className="text-muted-foreground/50 shrink-0" />}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={cn(
                            "truncate",
                            i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""
                          )}>
                            {item}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          sideOffset={6}
                          className="max-w-[250px] bg-popover text-popover-foreground border shadow-md"
                        >
                          <span className="text-xs break-words">{item}</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                ))}
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-0 overflow-hidden">
              <TypeIcon type={type} size={18} className="shrink-0" />
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${ITEM_TYPE_LABELS[type] || "Item"} title...`}
                className="flex-1 min-w-0 text-base font-semibold bg-transparent focus:outline-none placeholder:text-muted-foreground/40 overflow-hidden text-ellipsis"
              />
              <button
                onClick={handleClose}
                className="p-1 rounded hover:bg-accent text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 pt-4 pb-2 space-y-4">
              {/* Row 1: Type + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="h-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-4">Type</label>
                  <SimpleSelect
                    value={type}
                    onChange={setType}
                    options={typeOptions}
                  />
                </div>
                {!isBlueprintOrModule && (
                  <div className="flex flex-col gap-1">
                    <label className="h-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-4">Status</label>
                    <SimpleSelect
                      value={status}
                      onChange={setStatus}
                      options={statusOptions}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={7}
                  className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Row 2: Assignee + Sprint + Due Date + Effort */}
              {!isBlueprintOrModule && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="h-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-4">Assigned To</label>
                    <UserSelector value={assignee} onChange={setAssignee} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="h-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-4">Sprint</label>
                    <SimpleSelect
                      value={sprintId}
                      onChange={setSprintId}
                      options={sprintOptions}
                      placeholder={isDrafted ? "Drafted — no sprint" : undefined}
                      disabled={isDrafted}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="h-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-4">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-xs leading-none shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="h-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-4 flex items-center gap-1">
                      <Clock size={10} className="shrink-0" />
                      Effort (hrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={effort}
                      onChange={(e) => setEffort(e.target.value)}
                      placeholder="0"
                      className="h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-xs leading-none shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              {!isBlueprintOrModule && (
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tags</label>
                  <div
                    className="flex flex-wrap items-center gap-1 min-h-8 rounded-md border border-input bg-transparent px-2 py-1 shadow-sm focus-within:ring-1 focus-within:ring-ring cursor-text"
                    onClick={() => tagInputRef.current?.focus()}
                  >
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                          className="ml-0.5 rounded hover:bg-primary/20 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <input
                      ref={tagInputRef}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onPaste={handleTagPaste}
                      placeholder={tags.length ? "" : "Add tags..."}
                      className="flex-1 min-w-[60px] bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground/50">Press Enter or comma to add</p>
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-3 mt-3 border-t">
                <div className="flex items-center gap-1.5">
                  <img src={currentUser.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                  <span>Created by <span className="text-foreground font-medium">{currentUser.name}</span></span>
                </div>
                {isEditing && item?.createdAt && (
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/30 rounded-b-xl">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[9px] font-mono">Esc</kbd>
                <span>to close</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleClose} className="text-xs h-8">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!canSubmit}
                  className="text-xs h-8"
                >
                  {isEditing ? "Save Changes" : `Create ${ITEM_TYPE_LABELS[type]}`}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
