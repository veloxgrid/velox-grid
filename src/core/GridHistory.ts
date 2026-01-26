/**
 * GridHistory - Undo/Redo History Manager
 * @description Manages undo/redo stacks for grid operations
 */

import type {
  UndoAction,
  CellEditUndoData,
  BulkEditUndoData,
  RowAddUndoData,
  RowRemoveUndoData,
  CellValue,
  RowData,
} from '../types';

export interface HistoryOptions {
  /** Enable history tracking */
  enabled: boolean;
  /** Maximum stack size */
  maxSize: number;
}

const DEFAULT_OPTIONS: HistoryOptions = {
  enabled: true,
  maxSize: 50,
};

export class GridHistory {
  private undoStack: UndoAction[] = [];
  private redoStack: UndoAction[] = [];
  private options: HistoryOptions;

  constructor(options: Partial<HistoryOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Check if history tracking is enabled
   */
  isEnabled(): boolean {
    return this.options.enabled;
  }

  /**
   * Set enabled state
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
  }

  /**
   * Set maximum stack size
   */
  setMaxSize(size: number): void {
    this.options.maxSize = size;
    this.trimStack();
  }

  /**
   * Push an action to the undo stack
   */
  push(action: UndoAction): void {
    if (!this.options.enabled) return;

    this.undoStack.push(action);
    this.trimStack();
    
    // Clear redo stack when new action is performed
    this.redoStack = [];
  }

  /**
   * Create and push a cell edit action
   */
  pushCellEdit(rowIndex: number, field: string, oldValue: CellValue, newValue: CellValue): void {
    this.push({
      type: 'cell_edit',
      timestamp: Date.now(),
      data: { rowIndex, field, oldValue, newValue } as CellEditUndoData,
    });
  }

  /**
   * Create and push a bulk edit action (paste, cut, delete)
   */
  pushBulkEdit(
    type: 'paste' | 'cut' | 'delete' | 'bulk_edit',
    changes: BulkEditUndoData['changes']
  ): void {
    if (changes.length === 0) return;
    
    this.push({
      type,
      timestamp: Date.now(),
      data: { changes } as BulkEditUndoData,
    });
  }

  /**
   * Create and push a row add action
   */
  pushRowAdd(row: RowData, index: number): void {
    this.push({
      type: 'row_add',
      timestamp: Date.now(),
      data: { row: { ...row }, index } as RowAddUndoData,
    });
  }

  /**
   * Create and push a row remove action
   */
  pushRowRemove(row: RowData, index: number): void {
    this.push({
      type: 'row_remove',
      timestamp: Date.now(),
      data: { row: { ...row }, index } as RowRemoveUndoData,
    });
  }

  /**
   * Pop from undo stack and push to redo stack
   * Returns the action to be undone
   */
  popUndo(): UndoAction | null {
    if (!this.options.enabled || this.undoStack.length === 0) {
      return null;
    }

    const action = this.undoStack.pop()!;
    this.redoStack.push(action);
    return action;
  }

  /**
   * Pop from redo stack and push to undo stack
   * Returns the action to be redone
   */
  popRedo(): UndoAction | null {
    if (!this.options.enabled || this.redoStack.length === 0) {
      return null;
    }

    const action = this.redoStack.pop()!;
    this.undoStack.push(action);
    return action;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.options.enabled && this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.options.enabled && this.redoStack.length > 0;
  }

  /**
   * Get undo stack size
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get redo stack size
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Trim undo stack to max size
   */
  private trimStack(): void {
    while (this.undoStack.length > this.options.maxSize) {
      this.undoStack.shift();
    }
  }
}
