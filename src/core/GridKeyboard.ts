/**
 * GridKeyboard - Keyboard Navigation Handler for VeloxGrid
 * @description Handles keyboard events and navigation
 */

import type { CellIndex, ColumnDefinition } from '../types';

export type NavigationDirection = 'up' | 'down' | 'left' | 'right';
export type NavigationTarget = 'cell' | 'page' | 'home' | 'end';

export interface KeyboardAction {
  type: 'navigate' | 'edit' | 'select' | 'clipboard' | 'delete' | 'undo' | 'redo' | 'check' | 'selectAll';
  direction?: NavigationDirection;
  target?: NavigationTarget;
  withShift?: boolean;
  withCtrl?: boolean;
}

export interface NavigationResult {
  rowIndex: number;
  colIndex: number;
  field: string;
}

export class GridKeyboard {
  /**
   * Parse keyboard event and return action
   */
  static parseEvent(e: KeyboardEvent): KeyboardAction | null {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

    // Undo/Redo
    if (isCtrl && e.key === 'z') {
      return { type: 'undo' };
    }
    if (isCtrl && e.key === 'y') {
      return { type: 'redo' };
    }

    // Clipboard
    if (isCtrl && e.key === 'c') {
      return { type: 'clipboard', direction: undefined };
    }
    if (isCtrl && e.key === 'v') {
      return { type: 'clipboard', direction: undefined };
    }
    if (isCtrl && e.key === 'x') {
      return { type: 'clipboard', direction: undefined };
    }

    // Select All
    if (isCtrl && (e.key === 'a' || e.key === 'A')) {
      return { type: 'selectAll' };
    }

    // Delete
    if (e.key === 'Delete' || e.key === 'Backspace') {
      return { type: 'delete' };
    }

    // Navigation
    switch (e.key) {
      case 'ArrowUp':
        return { type: 'navigate', direction: 'up', target: 'cell', withShift: isShift };
      case 'ArrowDown':
        return { type: 'navigate', direction: 'down', target: 'cell', withShift: isShift };
      case 'ArrowLeft':
        return { type: 'navigate', direction: 'left', target: 'cell', withShift: isShift };
      case 'ArrowRight':
        return { type: 'navigate', direction: 'right', target: 'cell', withShift: isShift };
      case 'Home':
        return { type: 'navigate', direction: 'left', target: isCtrl ? 'home' : 'cell', withShift: isShift, withCtrl: isCtrl };
      case 'End':
        return { type: 'navigate', direction: 'right', target: isCtrl ? 'end' : 'cell', withShift: isShift, withCtrl: isCtrl };
      case 'PageUp':
        return { type: 'navigate', direction: 'up', target: 'page', withShift: isShift };
      case 'PageDown':
        return { type: 'navigate', direction: 'down', target: 'page', withShift: isShift };
    }

    // Edit
    if (e.key === 'Enter' || e.key === 'F2') {
      return { type: 'edit' };
    }

    // Check (Space)
    if (e.key === ' ') {
      return { type: 'check' };
    }

    return null;
  }

  /**
   * Calculate new cell position based on navigation
   */
  static navigate(
    current: CellIndex,
    action: KeyboardAction,
    columns: ColumnDefinition[],
    rowCount: number,
    pageSize: number
  ): NavigationResult | null {
    const currentColIndex = columns.findIndex(c => c.field === current.field);
    if (currentColIndex === -1) return null;

    let newRowIndex = current.rowIndex;
    let newColIndex = currentColIndex;

    // Handle target-based navigation
    if (action.target === 'home') {
      newRowIndex = 0;
      newColIndex = 0;
    } else if (action.target === 'end') {
      newRowIndex = rowCount - 1;
      newColIndex = columns.length - 1;
    } else if (action.target === 'page') {
      // Page navigation
      if (action.direction === 'up') {
        newRowIndex = Math.max(0, newRowIndex - pageSize);
      } else if (action.direction === 'down') {
        newRowIndex = Math.min(rowCount - 1, newRowIndex + pageSize);
      }
    } else {
      // Cell-by-cell navigation
      switch (action.direction) {
        case 'up':
          if (newRowIndex > 0) newRowIndex--;
          break;
        case 'down':
          if (newRowIndex < rowCount - 1) newRowIndex++;
          break;
        case 'left':
          if (action.withCtrl) {
            newColIndex = 0;
          } else if (newColIndex > 0) {
            newColIndex--;
          }
          break;
        case 'right':
          if (action.withCtrl) {
            newColIndex = columns.length - 1;
          } else if (newColIndex < columns.length - 1) {
            newColIndex++;
          }
          break;
      }
    }

    // Validate bounds
    newRowIndex = Math.max(0, Math.min(rowCount - 1, newRowIndex));
    newColIndex = Math.max(0, Math.min(columns.length - 1, newColIndex));

    const newField = columns[newColIndex]?.field;
    if (!newField) return null;

    // Check if position actually changed
    if (newRowIndex === current.rowIndex && newField === current.field) {
      return null;
    }

    return {
      rowIndex: newRowIndex,
      colIndex: newColIndex,
      field: newField,
    };
  }

  /**
   * Calculate next cell after edit (Enter/Tab movement)
   */
  static getNextEditCell(
    current: { rowIndex: number; field: string },
    direction: 'up' | 'down' | 'left' | 'right',
    columns: ColumnDefinition[],
    rowCount: number
  ): NavigationResult | null {
    const currentColIndex = columns.findIndex(c => c.field === current.field);
    if (currentColIndex === -1) return null;

    let newRowIndex = current.rowIndex;
    let newColIndex = currentColIndex;

    switch (direction) {
      case 'up':
        if (newRowIndex > 0) newRowIndex--;
        break;
      case 'down':
        if (newRowIndex < rowCount - 1) newRowIndex++;
        break;
      case 'left':
        if (newColIndex > 0) {
          newColIndex--;
        } else if (newRowIndex > 0) {
          // Wrap to previous row, last column
          newRowIndex--;
          newColIndex = columns.length - 1;
        }
        break;
      case 'right':
        if (newColIndex < columns.length - 1) {
          newColIndex++;
        } else if (newRowIndex < rowCount - 1) {
          // Wrap to next row, first column
          newRowIndex++;
          newColIndex = 0;
        }
        break;
    }

    const newField = columns[newColIndex]?.field;
    if (!newField) return null;

    return {
      rowIndex: newRowIndex,
      colIndex: newColIndex,
      field: newField,
    };
  }

  /**
   * Check if key event should be handled by editor
   */
  static isEditorKey(e: KeyboardEvent): boolean {
    return e.key === 'Escape' || e.key === 'Enter' || e.key === 'Tab';
  }

  /**
   * Get edit action from key event
   */
  static getEditAction(e: KeyboardEvent): 'save' | 'cancel' | 'tab' | 'shift-tab' | null {
    if (e.key === 'Escape') return 'cancel';
    if (e.key === 'Enter') return 'save';
    if (e.key === 'Tab') return e.shiftKey ? 'shift-tab' : 'tab';
    return null;
  }
}
