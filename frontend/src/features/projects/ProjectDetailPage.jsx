import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useNavigate } from "react-router";
import { useProjectStore } from "@/stores/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_COLORS, ITEM_TYPE } from "@/lib/constants";
import {
  ArrowLeft,
  Layers,
  BookOpen,
  NotepadText,
  Bug,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreateItemDialog from "@/components/CreateItemDialog";

// ─────────────────────────────────────────────
// Confirm Delete Dialog
// ─────────────────────────────────────────────
function ConfirmDeleteDialog({ open, name, onConfirm, onCancel }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-sm mx-4 overflow-hidden"
          >
            <p className="text-sm font-medium mb-1 break-all">Delete "{name}"?</p>
            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={onConfirm}>
                Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─────────────────────────────────────────────
// Inline Add Button
// ─────────────────────────────────────────────
function InlineAdd({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1"
    >
      <Plus size={12} />
      {label}
    </button>
  );
}

export default function ForgeDetailPage() {
  const [expandedBlueprints, setExpandedBlueprints] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dialogState, setDialogState] = useState({ open: false, type: null, context: {}, breadcrumb: [], item: null });
  const { forgeId } = useParams();
  const navigate = useNavigate();
  const getForge = useProjectStore((s) => s.getForge);
  const getBlueprintsForForge = useProjectStore((s) => s.getBlueprintsForForge);
  const getModulesForBlueprint = useProjectStore((s) => s.getModulesForBlueprint);
  const getActionsForModule = useProjectStore((s) => s.getActionsForModule);
  const deleteBlueprint = useProjectStore((s) => s.deleteBlueprint);
  const deleteModule = useProjectStore((s) => s.deleteModule);
  const deleteAction = useProjectStore((s) => s.deleteAction);

  const forge = getForge(forgeId);
  if (!forge) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium">Forge not found</p>
        <Button variant="ghost" onClick={() => navigate("/forges")} className="mt-2">
          Back to Forges
        </Button>
      </div>
    );
  }

  const blueprints = getBlueprintsForForge(forgeId);

  const toggleBlueprint = (id) =>
    setExpandedBlueprints((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleModule = (id) =>
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));

  const openCreateDialog = (type, context, breadcrumb, item = null) => {
    setDialogState({ open: true, type, context, breadcrumb, item });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "blueprint") deleteBlueprint(deleteTarget.id);
    if (deleteTarget.type === "module") deleteModule(deleteTarget.id);
    if (deleteTarget.type === "action") deleteAction(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/forges")}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: forge.color }}
          >
            {forge.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{forge.name}</h2>
            <p className="text-muted-foreground text-sm">{forge.description}</p>
          </div>
        </div>
      </div>

      {/* Hierarchy */}
      <div className="space-y-4">
        {blueprints.map((blueprint) => {
          const modules = getModulesForBlueprint(blueprint.id);
          const isBPExpanded = expandedBlueprints[blueprint.id] ?? true;
          return (
            <Card key={blueprint.id} className="group/bp">
              <CardHeader
                className="pb-3 cursor-pointer select-none"
                onClick={() => toggleBlueprint(blueprint.id)}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight
                    size={16}
                    className={cn(
                      "text-muted-foreground transition-transform duration-200",
                      isBPExpanded && "rotate-90"
                    )}
                  />
                  <BookOpen size={15} className="text-primary" />
                  <CardTitle
                    className="text-sm hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateDialog(
                        ITEM_TYPE.BLUEPRINT,
                        { forgeId, forge },
                        [forge.name, blueprint.name],
                        { ...blueprint, type: ITEM_TYPE.BLUEPRINT }
                      );
                    }}
                  >
                    {blueprint.name}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {modules.length} module{modules.length !== 1 ? "s" : ""}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: "blueprint", id: blueprint.id, name: blueprint.name });
                    }}
                    className="p-1 rounded text-muted-foreground/40 opacity-0 group-hover/bp:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{blueprint.description}</p>
              </CardHeader>
              <AnimatePresence initial={false}>
                {isBPExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <CardContent>
                      <div className="space-y-3">
                        {modules.map((mod) => {
                          const modActions = getActionsForModule(mod.id);
                          const isModExpanded = expandedModules[mod.id] ?? true;
                          return (
                            <div key={mod.id} className="border rounded-lg group/mod">
                              <div
                                className={cn(
                                  "flex items-center gap-2 p-4 cursor-pointer select-none",
                                  isModExpanded ? "pb-0" : "pb-4"
                                )}
                                onClick={() => toggleModule(mod.id)}
                              >
                                <ChevronRight
                                  size={14}
                                  className={cn(
                                    "text-muted-foreground transition-transform duration-200",
                                    isModExpanded && "rotate-90"
                                  )}
                                />
                                <Layers size={13} className="text-muted-foreground" />
                                <span
                                  className="font-medium text-xs hover:underline cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCreateDialog(
                                      ITEM_TYPE.MODULE,
                                      { blueprintId: blueprint.id, forge },
                                      [forge.name, blueprint.name, mod.name],
                                      { ...mod, type: ITEM_TYPE.MODULE }
                                    );
                                  }}
                                >
                                  {mod.name}
                                </span>
                                <Badge variant="secondary" className="ml-auto text-[10px]">
                                  {modActions.length} action{modActions.length !== 1 ? "s" : ""}
                                </Badge>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget({ type: "module", id: mod.id, name: mod.name });
                                  }}
                                  className="p-1 rounded text-muted-foreground/40 opacity-0 group-hover/mod:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <AnimatePresence initial={false}>
                                {isModExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 pt-3 space-y-2">
                                      {modActions.map((action) => (
                                        <div
                                          key={action.id}
                                          className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted/50 group/act cursor-pointer hover:bg-muted/70 transition-colors"
                                          onClick={() =>
                                            openCreateDialog(
                                              action.type === "glitch" ? ITEM_TYPE.BUG : ITEM_TYPE.TASK,
                                              { moduleId: mod.id, forge },
                                              [forge.name, blueprint.name, mod.name, action.title],
                                              { ...action, type: action.type === "glitch" ? ITEM_TYPE.BUG : ITEM_TYPE.TASK }
                                            )
                                          }
                                        >
                                          {action.type === "glitch" ? (
                                            <Bug size={12} className="text-destructive shrink-0 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                                          ) : action.status === "crafted" ? (
                                            <NotepadText size={12} className="text-green-500 shrink-0 drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
                                          ) : (
                                            <NotepadText size={12} className="text-amber-500 shrink-0 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
                                          )}
                                          <span className="text-xs flex-1">{action.title}</span>
                                          {action.tags?.length > 0 && (
                                            <div className="flex items-center gap-1">
                                              {action.tags.map((tag) => (
                                                <span key={tag} className="rounded bg-primary/10 text-primary px-1 py-0.5 text-[9px] font-medium">
                                                  {tag}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          <Badge className={`text-[9px] ${STATUS_COLORS[action.status]}`}>
                                            {STATUS_LABELS[action.status]}
                                          </Badge>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteTarget({ type: "action", id: action.id, name: action.title });
                                            }}
                                            className="p-1 rounded text-muted-foreground/40 opacity-0 group-hover/act:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      ))}

                                      {/* Add action */}
                                      <InlineAdd
                                        label="Add action"
                                        onClick={() =>
                                          openCreateDialog(
                                            ITEM_TYPE.ACTION,
                                            { moduleId: mod.id, forge },
                                            [forge.name, blueprint.name, mod.name]
                                          )
                                        }
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}

                        {/* Add module */}
                        <InlineAdd
                          label="Add module"
                          onClick={() =>
                            openCreateDialog(
                              ITEM_TYPE.MODULE,
                              { blueprintId: blueprint.id, forge },
                              [forge.name, blueprint.name]
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}

        {/* Add blueprint */}
        <button
          onClick={() =>
            openCreateDialog(
              ITEM_TYPE.BLUEPRINT,
              { forgeId, forge },
              [forge.name]
            )
          }
          className="flex items-center gap-2 w-full py-3 px-4 rounded-lg border border-dashed border-muted-foreground/20 text-sm text-muted-foreground/60 hover:text-muted-foreground hover:border-muted-foreground/40 transition-colors"
        >
          <Plus size={16} />
          Add blueprint
        </button>
      </div>

      {/* Create / Edit Item Dialog */}
      <CreateItemDialog
        open={dialogState.open}
        onClose={() => setDialogState({ open: false, type: null, context: {}, breadcrumb: [], item: null })}
        type={dialogState.type}
        parentContext={dialogState.context}
        breadcrumb={dialogState.breadcrumb}
        item={dialogState.item}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        name={deleteTarget?.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
