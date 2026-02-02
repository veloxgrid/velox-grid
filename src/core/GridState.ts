/**
 * GridState - State Management for VeloxGrid
 * @description Centralized state management with column caching
 */

import type {
  GridState as IGridState,
  RowData,
  ColumnDefinition,
  SelectionState,
  CheckBarState,
  SortState,
  FilterState,
  EditState,
  CellIndex,
  ValueType,
  CheckBarOptions,
} from '../types';
import { sortData, filterData } from '../utils/data';

export interface ColumnCache {
  visible: ColumnDefinition[] | null;
  fixedLeft: ColumnDefinition[] | null;
  scrollable: ColumnDefinition[] | null;
  dirty: boolean;
}

export class GridState {
  // Core data
  data: RowData[] = [];
  displayData: RowData[] = [];
  columns: ColumnDefinition[] = [];

  // Selection state
  selection: SelectionState = {
    selectedRows: new Set<number>(),
    selectedCells: new Set<string>(),
    focusedCell: null,
    selections: [],
    lastSelectedRow: null,
  };

  // CheckBar state
  checkBar: CheckBarState = {
    checkedRows: new Set<number>(),
    checkableRows: new Set<number>(),
  };

  // Sort & Filter
  sort: SortState[] = [];
  filter: FilterState | null = null;

  // Edit state
  edit: EditState = {
    editing: false,
    rowIndex: null,
    field: null,
    originalValue: null,
  };

  // Scroll position
  scroll = { top: 0, left: 0 };

  // Data index mapping for quick lookup
  private dataIndexMap: Map<RowData, number> = new Map();

  // Column cache for performance
  private columnCache: ColumnCache = {
    visible: null,
    fixedLeft: null,
    scrollable: null,
    dirty: true,
  };

  constructor(columns: ColumnDefinition[] = [], data: RowData[] = []) {
    this.columns = columns.map(col => ({ ...col }));
    if (data.length > 0) {
      this.setData(data);
    }
  }

  // ============================================
  // Data Management
  // ============================================

  /**
   * Set grid data
   */
  setData(data: RowData[]): void {
    this.data = data.map(row => ({ ...row }));
    this.rebuildDataIndexMap();
    this.displayData = [...this.data];
  }

  /**
   * Get data copy
   */
  getData(): RowData[] {
    return this.data.map(row => ({ ...row }));
  }

  /**
   * Get row at display index
   */
  getRow(displayIndex: number): RowData | null {
    return this.displayData[displayIndex] || null;
  }

  /**
   * Get original data index for a display row
   */
  getDataIndex(displayRow: RowData): number {
    return this.dataIndexMap.get(displayRow) ?? -1;
  }

  /**
   * Find original data index for a display index
   */
  getOriginalIndex(displayIndex: number): number {
    const row = this.displayData[displayIndex];
    return row ? this.data.indexOf(row) : -1;
  }

  /**
   * Rebuild data index map
   */
  rebuildDataIndexMap(): void {
    this.dataIndexMap.clear();
    this.data.forEach((row, index) => {
      this.dataIndexMap.set(row, index);
    });
  }

  // ============================================
  // Column Cache Management
  // ============================================

  /**
   * Invalidate column cache (call when columns change)
   */
  invalidateColumnCache(): void {
    this.columnCache.dirty = true;
    this.columnCache.visible = null;
    this.columnCache.fixedLeft = null;
    this.columnCache.scrollable = null;
  }

  /**
   * Get visible columns (cached)
   */
  getVisibleColumns(): ColumnDefinition[] {
    if (this.columnCache.dirty || !this.columnCache.visible) {
      this.columnCache.visible = this.columns.filter(col => col.visible !== false);
    }
    return this.columnCache.visible;
  }

  /**
   * Get fixed left columns (cached)
   */
  getFixedLeftColumns(): ColumnDefinition[] {
    if (this.columnCache.dirty || !this.columnCache.fixedLeft) {
      this.columnCache.fixedLeft = this.columns.filter(
        col => col.fixed === 'left' && col.visible !== false
      );
    }
    return this.columnCache.fixedLeft;
  }

  /**
   * Get scrollable columns (cached)
   */
  getScrollableColumns(): ColumnDefinition[] {
    if (this.columnCache.dirty || !this.columnCache.scrollable) {
      this.columnCache.scrollable = this.columns.filter(
        col => col.fixed !== 'left' && col.visible !== false
      );
      // Mark cache as clean after all queries
      this.columnCache.dirty = false;
    }
    return this.columnCache.scrollable;
  }

  /**
   * Check if grid has fixed left content
   */
  hasFixedLeft(showCheckbox: boolean, showRowNumbers: boolean, checkBarVisible: boolean): boolean {
    return this.getFixedLeftColumns().length > 0 || 
           checkBarVisible || 
           showCheckbox || 
           showRowNumbers;
  }

  /**
   * Get column by field name
   */
  getColumn(field: string): ColumnDefinition | null {
    return this.columns.find(c => c.field === field) || null;
  }

  /**
   * Get column index by field name
   */
  getColumnIndex(field: string): number {
    return this.getVisibleColumns().findIndex(c => c.field === field);
  }

  /**
   * Set columns and invalidate cache
   */
  setColumns(columns: ColumnDefinition[]): void {
    this.columns = columns.map(col => ({ ...col }));
    this.invalidateColumnCache();
  }

  /**
   * Update single column
   */
  updateColumn(field: string, updates: Partial<ColumnDefinition>): boolean {
    const column = this.columns.find(c => c.field === field);
    if (column) {
      Object.assign(column, updates);
      this.invalidateColumnCache();
      return true;
    }
    return false;
  }

  // ============================================
  // Selection Management
  // ============================================

  /**
   * Clear all selection state
   */
  clearSelection(): void {
    this.selection.selectedRows.clear();
    this.selection.selectedCells.clear();
    this.selection.focusedCell = null;
    this.selection.selections = [];
  }

  /**
   * Select a row
   */
  selectRow(index: number, selected: boolean, mode: 'single' | 'multiple'): void {
    if (selected) {
      if (mode === 'single') {
        this.selection.selectedRows.clear();
      }
      this.selection.selectedRows.add(index);
    } else {
      this.selection.selectedRows.delete(index);
    }
  }

  /**
   * Select a cell
   */
  selectCell(rowIndex: number, field: string, selected: boolean): void {
    const key = `${rowIndex}:${field}`;
    if (selected) {
      this.selection.selectedCells.add(key);
    } else {
      this.selection.selectedCells.delete(key);
    }
  }

  /**
   * Set focused cell
   */
  setFocusedCell(rowIndex: number, field: string): void {
    this.selection.focusedCell = { rowIndex, field };
  }

  /**
   * Get selected rows as array
   */
  getSelectedRows(): number[] {
    return Array.from(this.selection.selectedRows).sort((a, b) => a - b);
  }

  /**
   * Get selected cells as array
   */
  getSelectedCells(): CellIndex[] {
    return Array.from(this.selection.selectedCells).map(key => {
      const [rowIndex, field] = key.split(':');
      return { rowIndex: parseInt(rowIndex, 10), field };
    });
  }

  /**
   * Check if row is selected
   */
  isRowSelected(index: number): boolean {
    return this.selection.selectedRows.has(index);
  }

  /**
   * Check if cell is selected
   */
  isCellSelected(rowIndex: number, field: string): boolean {
    return this.selection.selectedCells.has(`${rowIndex}:${field}`);
  }

  /**
   * Check if cell is focused
   */
  isCellFocused(rowIndex: number, field: string): boolean {
    const focused = this.selection.focusedCell;
    return focused !== null && focused.rowIndex === rowIndex && focused.field === field;
  }

  // ============================================
  // CheckBar Management
  // ============================================

  /**
   * Initialize checkable rows based on callback
   */
  initCheckableRows(checkBar: CheckBarOptions | undefined): void {
    this.checkBar.checkableRows.clear();
    
    this.displayData.forEach((row, index) => {
      if (checkBar?.checkableCallback) {
        if (checkBar.checkableCallback(row, index)) {
          this.checkBar.checkableRows.add(index);
        }
      } else {
        this.checkBar.checkableRows.add(index);
      }
    });
  }

  /**
   * Check/uncheck an item
   */
  checkItem(index: number, checked: boolean, exclusive: boolean): boolean {
    if (!this.checkBar.checkableRows.has(index)) {
      return false;
    }

    if (exclusive && checked) {
      this.checkBar.checkedRows.clear();
    }

    if (checked) {
      this.checkBar.checkedRows.add(index);
    } else {
      this.checkBar.checkedRows.delete(index);
    }
    
    return true;
  }

  /**
   * Check/uncheck all items
   */
  checkAll(checked: boolean): void {
    if (checked) {
      this.checkBar.checkableRows.forEach(index => {
        this.checkBar.checkedRows.add(index);
      });
    } else {
      this.checkBar.checkedRows.clear();
    }
  }

  /**
   * Get checked items as array
   */
  getCheckedItems(): number[] {
    return Array.from(this.checkBar.checkedRows).sort((a, b) => a - b);
  }

  /**
   * Check if item is checked
   */
  isItemChecked(index: number): boolean {
    return this.checkBar.checkedRows.has(index);
  }

  /**
   * Check if item is checkable
   */
  isItemCheckable(index: number): boolean {
    return this.checkBar.checkableRows.has(index);
  }

  // ============================================
  // Data Transformations
  // ============================================

  /**
   * Apply sort and filter transformations
   */
  applyTransformations(): void {
    let data = [...this.data];
    
    // Apply filter
    if (this.filter) {
      data = filterData(data, this.filter);
    }
    
    // Apply sort
    if (this.sort.length > 0) {
      const columnTypes: Record<string, ValueType> = {};
      this.columns.forEach(col => {
        columnTypes[col.field] = col.type || 'text';
      });
      data = sortData(data, this.sort, columnTypes);
    }
    
    this.displayData = data;
  }

  // ============================================
  // Edit State
  // ============================================

  /**
   * Start editing a cell
   */
  startEdit(rowIndex: number, field: string, value: unknown): void {
    this.edit = {
      editing: true,
      rowIndex,
      field,
      originalValue: value as any,
    };
  }

  /**
   * End editing
   */
  endEdit(): void {
    this.edit = {
      editing: false,
      rowIndex: null,
      field: null,
      originalValue: null,
    };
  }

  /**
   * Check if currently editing
   */
  isEditing(): boolean {
    return this.edit.editing;
  }

  // ============================================
  // Serialization
  // ============================================

  /**
   * Export state to plain object (for IGridState interface)
   */
  toObject(): IGridState {
    return {
      data: this.data,
      displayData: this.displayData,
      columns: this.columns,
      selection: this.selection,
      checkBar: this.checkBar,
      sort: this.sort,
      filter: this.filter,
      edit: this.edit,
      scroll: this.scroll,
    };
  }
}
