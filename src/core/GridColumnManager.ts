/**
 * GridColumnManager - Column Management for VeloxGrid
 * @description Handles column operations with caching
 */

import type { ColumnDefinition } from '../types';

export interface ColumnCache {
  visible: ColumnDefinition[] | null;
  fixedLeft: ColumnDefinition[] | null;
  scrollable: ColumnDefinition[] | null;
  dirty: boolean;
}

export class GridColumnManager {
  private columns: ColumnDefinition[];
  private cache: ColumnCache;

  constructor(columns: ColumnDefinition[] = []) {
    this.columns = columns.map(col => ({ ...col }));
    this.cache = {
      visible: null,
      fixedLeft: null,
      scrollable: null,
      dirty: true,
    };
  }

  // ============================================
  // Cache Management
  // ============================================

  invalidateCache(): void {
    this.cache.dirty = true;
    this.cache.visible = null;
    this.cache.fixedLeft = null;
    this.cache.scrollable = null;
  }

  // ============================================
  // Column Access (with caching)
  // ============================================

  getAll(): ColumnDefinition[] {
    return this.columns;
  }

  getVisible(): ColumnDefinition[] {
    if (this.cache.dirty || !this.cache.visible) {
      this.cache.visible = this.columns.filter(col => col.visible !== false);
    }
    return this.cache.visible;
  }

  getFixedLeft(): ColumnDefinition[] {
    if (this.cache.dirty || !this.cache.fixedLeft) {
      this.cache.fixedLeft = this.columns.filter(
        col => col.fixed === 'left' && col.visible !== false
      );
    }
    return this.cache.fixedLeft;
  }

  getScrollable(): ColumnDefinition[] {
    if (this.cache.dirty || !this.cache.scrollable) {
      this.cache.scrollable = this.columns.filter(
        col => col.fixed !== 'left' && col.visible !== false
      );
      this.cache.dirty = false; // Mark as clean after all queries
    }
    return this.cache.scrollable;
  }

  getByField(field: string): ColumnDefinition | null {
    return this.columns.find(c => c.field === field) || null;
  }

  getIndex(field: string): number {
    return this.getVisible().findIndex(c => c.field === field);
  }

  hasFixedLeft(showCheckbox: boolean, showRowNumbers: boolean, checkBarVisible: boolean): boolean {
    return this.getFixedLeft().length > 0 || checkBarVisible || showCheckbox || showRowNumbers;
  }

  // ============================================
  // Column Operations
  // ============================================

  setAll(columns: ColumnDefinition[]): void {
    this.columns = columns.map(col => ({ ...col }));
    this.invalidateCache();
  }

  update(field: string, updates: Partial<ColumnDefinition>): boolean {
    const column = this.columns.find(c => c.field === field);
    if (column) {
      Object.assign(column, updates);
      this.invalidateCache();
      return true;
    }
    return false;
  }

  setWidth(field: string, width: number): boolean {
    return this.update(field, { width });
  }

  show(field: string): boolean {
    return this.update(field, { visible: true });
  }

  hide(field: string): boolean {
    return this.update(field, { visible: false });
  }

  fix(field: string, position: 'left' | 'right' | false): boolean {
    return this.update(field, { fixed: position });
  }

  // ============================================
  // Column Reorder
  // ============================================

  reorder(sourceField: string, targetField: string): { sourceIndex: number; targetIndex: number } | null {
    const sourceIndex = this.columns.findIndex(c => c.field === sourceField);
    const targetIndex = this.columns.findIndex(c => c.field === targetField);

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
      return null;
    }

    const [removed] = this.columns.splice(sourceIndex, 1);
    this.columns.splice(targetIndex, 0, removed);

    this.invalidateCache();

    return { sourceIndex, targetIndex };
  }

  // ============================================
  // Auto-fit Width
  // ============================================

  /**
   * Calculate optimal width for a column based on content
   */
  calculateOptimalWidth(
    field: string,
    data: Record<string, unknown>[],
    measureText: (text: string) => number,
    formatter?: (value: unknown) => string
  ): number {
    const column = this.getByField(field);
    if (!column) return 100;

    let maxWidth = 100;

    // Header width
    const headerWidth = measureText(column.header || '') + 40;
    maxWidth = Math.max(maxWidth, headerWidth);

    // Data width
    data.forEach(row => {
      const value = row[field];
      const text = formatter ? formatter(value) : String(value ?? '');
      const width = measureText(text) + 20;
      maxWidth = Math.max(maxWidth, width);
    });

    // Cap at reasonable maximum
    return Math.min(maxWidth, 500);
  }

  // ============================================
  // Utility
  // ============================================

  /**
   * Get column types mapping
   */
  getColumnTypes(): Record<string, string> {
    const types: Record<string, string> = {};
    this.columns.forEach(col => {
      types[col.field] = col.type || 'text';
    });
    return types;
  }

  /**
   * Get editable columns
   */
  getEditable(): ColumnDefinition[] {
    return this.getVisible().filter(col => col.editable !== false);
  }

  /**
   * Check if column is editable
   */
  isEditable(field: string): boolean {
    const column = this.getByField(field);
    return column !== null && column.editable !== false;
  }
}
