/**
 * GridEditor - Cell Editing Management for VeloxGrid
 * @description Handles inline cell editing
 */

import type {
  EditState,
  CellValue,
  ColumnDefinition,
  CellEditEvent,
  RowData,
} from '../types';
import { createElement, addClass } from '../utils/dom';

export interface EditorCallbacks {
  onEditStart?: (rowIndex: number, field: string, value: CellValue) => void;
  onEditEnd?: (event: CellEditEvent) => void;
  onEditCancel?: (rowIndex: number, field: string) => void;
  onValueChange?: (rowIndex: number, field: string, oldValue: CellValue, newValue: CellValue) => void;
}

export class GridEditor {
  private state: EditState;
  private callbacks: EditorCallbacks;
  private currentInput: HTMLInputElement | null = null;

  constructor(callbacks: EditorCallbacks = {}) {
    this.state = {
      editing: false,
      rowIndex: null,
      field: null,
      originalValue: null,
    };
    this.callbacks = callbacks;
  }

  // ============================================
  // State Access
  // ============================================

  getState(): EditState {
    return { ...this.state };
  }

  isEditing(): boolean {
    return this.state.editing;
  }

  getEditingCell(): { rowIndex: number; field: string } | null {
    if (this.state.editing && this.state.rowIndex !== null && this.state.field !== null) {
      return { rowIndex: this.state.rowIndex, field: this.state.field };
    }
    return null;
  }

  // ============================================
  // Edit Operations
  // ============================================

  /**
   * Start editing a cell
   */
  startEdit(
    rowIndex: number,
    field: string,
    value: CellValue,
    column: ColumnDefinition,
    cellElement: HTMLElement
  ): boolean {
    if (this.state.editing) {
      this.endEdit(true); // Save current edit first
    }

    if (column.editable === false) {
      return false;
    }

    this.state = {
      editing: true,
      rowIndex,
      field,
      originalValue: value,
    };

    this.callbacks.onEditStart?.(rowIndex, field, value);
    this.renderEditInput(cellElement, value, column);

    return true;
  }

  /**
   * End editing (save or cancel)
   */
  endEdit(save: boolean = true): CellEditEvent | null {
    if (!this.state.editing || this.state.rowIndex === null || this.state.field === null) {
      return null;
    }

    const { rowIndex, field, originalValue } = this.state;
    let event: CellEditEvent | null = null;

    if (save && this.currentInput) {
      const newValue = this.currentInput.value;
      const originalString = originalValue != null ? String(originalValue) : '';

      if (newValue !== originalString) {
        event = {
          rowIndex,
          field,
          oldValue: originalValue,
          newValue,
          row: {} as RowData, // Will be filled by caller
        };
        this.callbacks.onEditEnd?.(event);
        this.callbacks.onValueChange?.(rowIndex, field, originalValue, newValue);
      }
    } else {
      this.callbacks.onEditCancel?.(rowIndex, field);
    }

    this.clearEditState();
    return event;
  }

  /**
   * Cancel editing
   */
  cancelEdit(): void {
    if (!this.state.editing) return;

    const { rowIndex, field } = this.state;
    if (rowIndex !== null && field !== null) {
      this.callbacks.onEditCancel?.(rowIndex, field);
    }

    this.clearEditState();
  }

  // ============================================
  // Private Methods
  // ============================================

  private clearEditState(): void {
    this.state = {
      editing: false,
      rowIndex: null,
      field: null,
      originalValue: null,
    };
    this.currentInput = null;
  }

  private renderEditInput(
    cellElement: HTMLElement,
    value: CellValue,
    column: ColumnDefinition
  ): void {
    addClass(cellElement, 'velox-cell--editing');

    const input = createElement('input', 'velox-edit-input') as HTMLInputElement;
    input.type = column.type === 'number' ? 'number' : 'text';
    input.value = value != null ? String(value) : '';

    cellElement.innerHTML = '';
    cellElement.appendChild(input);

    this.currentInput = input;

    // Focus and select
    input.focus();
    input.select();

    // Event handlers
    input.addEventListener('blur', () => this.endEdit(true));
    input.addEventListener('keydown', (e) => this.handleInputKeydown(e));
  }

  private handleInputKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.endEdit(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.cancelEdit();
    } else if (e.key === 'Tab') {
      // Tab handling will be managed by parent component
      // to move to next/prev cell
    }
  }

  // ============================================
  // Utility
  // ============================================

  /**
   * Parse value based on column type
   */
  static parseValue(value: string, type?: string): CellValue {
    if (type === 'number') {
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    }
    if (type === 'boolean') {
      return value.toLowerCase() === 'true';
    }
    return value;
  }

  /**
   * Update callbacks
   */
  setCallbacks(callbacks: Partial<EditorCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}
