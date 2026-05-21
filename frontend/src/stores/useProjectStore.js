import { create } from "zustand";
import {
  projects as mockProjects,
  blueprints as mockBlueprints,
  modules as mockModules,
  actions as mockActions,
  boards as mockBoards,
  iterations as mockIterations,
} from "@/lib/mock-data";
import { STATUS } from "@/lib/constants";

export const useProjectStore = create((set, get) => ({
  projects: mockProjects,
  blueprints: mockBlueprints,
  modules: mockModules,
  actions: mockActions,
  boards: mockBoards,
  iterations: mockIterations,

  // ── Project getters ──
  getProject: (id) => get().projects.find((p) => p.id === id),

  getBlueprintsForProject: (projectId) =>
    get().blueprints.filter((b) => b.projectId === projectId),

  getModulesForBlueprint: (blueprintId) =>
    get().modules.filter((m) => m.blueprintId === blueprintId),

  getActionsForModule: (moduleId) =>
    get().actions.filter((a) => a.moduleId === moduleId),

  getActionsByStatus: (status) =>
    get().actions.filter((a) => a.status === status),

  getActionsForProject: (projectId) => {
    const blueprintIds = get()
      .blueprints.filter((b) => b.projectId === projectId)
      .map((b) => b.id);
    const moduleIds = get()
      .modules.filter((m) => blueprintIds.includes(m.blueprintId))
      .map((m) => m.id);
    return get().actions.filter((a) => moduleIds.includes(a.moduleId));
  },

  // ── Board getters ──
  getBoard: (id) => get().boards.find((b) => b.id === id),

  getBoardsForProject: (projectId) =>
    get().boards.filter((b) => b.projectId === projectId),

  // ── Iteration getters ──
  getIteration: (id) => get().iterations.find((i) => i.id === id),

  getIterationsForProject: (projectId) =>
    get().iterations.filter((i) => i.projectId === projectId),

  // ── Board-scoped action getters ──
  getActionsForBoard: (boardId, iterationId) => {
    const board = get().getBoard(boardId);
    if (!board) return [];
    let actions = get().getActionsForProject(board.projectId);
    if (iterationId) {
      actions = actions.filter((a) => a.iterationId === iterationId);
    }
    return actions;
  },

  getUnassignedActionsForBoard: (boardId, iterationId) => {
    return get()
      .getActionsForBoard(boardId, iterationId)
      .filter((a) => a.status === null);
  },

  // ── Mutations ──
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

  createBoard: (board) =>
    set((state) => ({
      boards: [...state.boards, { ...board, id: `board-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] }],
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
      totalProjects: get().projects.length,
      totalTasks: allActions.length,
      completed: allActions.filter((a) => a.status === STATUS.CRAFTED).length,
      inProgress: allActions.filter((a) => a.status === STATUS.FORGING).length,
      queued: allActions.filter((a) => a.status === STATUS.QUEUED).length,
      blocked: allActions.filter((a) => a.status === STATUS.JAMMED).length,
    };
  },
}));
