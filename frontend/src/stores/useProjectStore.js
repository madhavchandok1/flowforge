import { create } from "zustand";
import {
  forges as mockForges,
  blueprints as mockBlueprints,
  modules as mockModules,
  actions as mockActions,
  boards as mockBoards,
  iterations as mockIterations,
} from "@/lib/mock-data";
import { STATUS } from "@/lib/constants";

export const useProjectStore = create((set, get) => ({
  forges: mockForges,
  blueprints: mockBlueprints,
  modules: mockModules,
  actions: mockActions,
  boards: mockBoards,
  iterations: mockIterations,

  // ── Forge getters ──
  getForge: (id) => get().forges.find((f) => f.id === id),

  getBlueprintsForForge: (forgeId) =>
    get().blueprints.filter((b) => b.forgeId === forgeId),

  getModulesForBlueprint: (blueprintId) =>
    get().modules.filter((m) => m.blueprintId === blueprintId),

  getActionsForModule: (moduleId) =>
    get().actions.filter((a) => a.moduleId === moduleId && !a.parentId),

  getSubtasksForAction: (actionId) =>
    get().actions.filter((a) => a.parentId === actionId),

  getActionsByStatus: (status) =>
    get().actions.filter((a) => a.status === status),

  getActionsForForge: (forgeId) => {
    const blueprintIds = get()
      .blueprints.filter((b) => b.forgeId === forgeId)
      .map((b) => b.id);
    const moduleIds = get()
      .modules.filter((m) => blueprintIds.includes(m.blueprintId))
      .map((m) => m.id);
    return get().actions.filter((a) => moduleIds.includes(a.moduleId));
  },

  // ── Board getters ──
  getBoard: (id) => get().boards.find((b) => b.id === id),

  getBoardsForForge: (forgeId) =>
    get().boards.filter((b) => b.forgeId === forgeId),

  // ── Iteration getters ──
  getIteration: (id) => get().iterations.find((i) => i.id === id),

  getIterationsForForge: (forgeId) =>
    get().iterations.filter((i) => i.forgeId === forgeId),

  // ── Board-scoped action getters ──
  getActionsForBoard: (boardId, iterationId) => {
    const board = get().getBoard(boardId);
    if (!board) return [];
    let actions = get().getActionsForForge(board.forgeId);
    if (iterationId) {
      actions = actions.filter((a) => a.iterationId === iterationId);
    }
    return actions;
  },

  getUnassignedActionsForBoard: (boardId, iterationId) => {
    return get()
      .getActionsForBoard(boardId, iterationId)
      .filter((a) => a.status === null || a.status === STATUS.DRAFTED);
  },

  // ── Mutations ──
  createForge: (forge) =>
    set((state) => ({
      forges: [...state.forges, { ...forge, id: `forge-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), members: [] }],
    })),

  updateForge: (forgeId, updates) =>
    set((state) => ({
      forges: state.forges.map((f) => (f.id === forgeId ? { ...f, ...updates } : f)),
    })),

  deleteForge: (forgeId) =>
    set((state) => ({
      forges: state.forges.filter((f) => f.id !== forgeId),
    })),

  updateActionStatus: (actionId, newStatus) =>
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === actionId ? { ...a, status: newStatus } : a
      ),
    })),

  updateAction: (actionId, updates) =>
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === actionId ? { ...a, ...updates } : a
      ),
    })),

  createBlueprint: (blueprint) =>
    set((state) => ({
      blueprints: [...state.blueprints, { ...blueprint, id: `bp-${Date.now()}` }],
    })),

  updateBlueprint: (blueprintId, updates) =>
    set((state) => ({
      blueprints: state.blueprints.map((b) =>
        b.id === blueprintId ? { ...b, ...updates } : b
      ),
    })),

  createModule: (mod) =>
    set((state) => ({
      modules: [...state.modules, { ...mod, id: `mod-${Date.now()}` }],
    })),

  updateModule: (moduleId, updates) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    })),

  createAction: (action) =>
    set((state) => ({
      actions: [...state.actions, {
        ...action,
        id: `act-${Date.now()}`,
        status: action.status || null,
        iterationId: action.iterationId || null,
        parentId: action.parentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
    })),

  deleteBlueprint: (blueprintId) =>
    set((state) => ({
      blueprints: state.blueprints.filter((b) => b.id !== blueprintId),
    })),

  deleteModule: (moduleId) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== moduleId),
    })),

  deleteAction: (actionId) =>
    set((state) => ({
      actions: state.actions.filter((a) => a.id !== actionId),
    })),

  createBoard: (board) =>
    set((state) => ({
      boards: [...state.boards, { ...board, id: `board-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] }],
    })),

  updateBoard: (boardId, updates) =>
    set((state) => ({
      boards: state.boards.map((b) => (b.id === boardId ? { ...b, ...updates } : b)),
    })),

  deleteBoard: (boardId) =>
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== boardId),
    })),

  createIteration: (iteration) =>
    set((state) => ({
      iterations: [...state.iterations, { ...iteration, id: `iter-${Date.now()}` }],
    })),

  deleteIteration: (iterationId) =>
    set((state) => ({
      iterations: state.iterations.filter((i) => i.id !== iterationId),
    })),

  // ── Stats ──
  getStats: () => {
    const allActions = get().actions;
    return {
      totalForges: get().forges.length,
      totalActions: allActions.length,
      completed: allActions.filter((a) => a.status === STATUS.CRAFTED).length,
      inProgress: allActions.filter((a) => a.status === STATUS.FORGING).length,
      queued: allActions.filter((a) => a.status === STATUS.QUEUED).length,
      blocked: allActions.filter((a) => a.status === STATUS.JAMMED).length,
    };
  },
}));
