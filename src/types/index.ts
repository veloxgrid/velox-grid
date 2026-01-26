/**
 * VeloxGrid Type Definitions v5.0
 * @description Core types for the VeloxGrid library
 * Phase 7: Selection Enhancement
 * Phase 8: Excel Export/Import
 * Phase 9: Keyboard Enhancement & Undo/Redo
 */

// ============================================
// Value Types
// ============================================

export type ValueType = 'text' | 'number' | 'boolean' | 'date' | 'datetime';

export type CellValue = string | number | boolean | Date | null | undefined;

export type RowData = Record<string, CellValue>;

// ============================================
// Column Definition
// ============================================

export interface ColumnDefinition {
  /** Unique identifier for the column */
  field: string;
  /** Display name in header */
  header: string;
  /** Data type */
  type?: ValueType;
  /** Column width in pixels */
  width?: number;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Allow resize */
  resizable?: boolean;
  /** Allow sorting */
  sortable?: boolean;
  /** Allow filtering */
  filterable?: boolean;
  /** Allow editing */
  editable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Header alignment */
  headerAlign?: 'left' | 'center' | 'right';
  /** Custom formatter */
  formatter?: (value: CellValue, row: RowData, column: ColumnDefinition) => string;
  /** Custom renderer (returns HTML string) */
  renderer?: (value: CellValue, row: RowData, column: ColumnDefinition) => string;
  /** CSS class for cells */
  cellClass?: string | ((value: CellValue, row: RowData) => string);
  /** CSS class for header */
  headerClass?: string;
  /** Visible state */
  visible?: boolean;
  /** Fixed position */
  fixed?: 'left' | 'right' | false;
}

// ============================================
// Selection Types (Phase 7)
// ============================================

export type SelectionMode = 'none' | 'single' | 'multiple' | 'extended';
export type SelectionStyle = 'row' | 'cell' | 'block' | 'none';

export interface CellIndex {
  rowIndex: number;
  field: string;
}

export interface Selection {
  style: SelectionStyle;
  startRow: number;
  endRow: number;
  startColumn?: string;
  endColumn?: string;
}

export interface CheckBarOptions {
  /** Show checkbar */
  visible: boolean;
  /** Radio button style (single check only) */
  exclusive?: boolean;
  /** Show select all checkbox in header */
  showAll?: boolean;
  /** Callback to determine if row is checkable */
  checkableCallback?: (rowData: RowData, rowIndex: number) => boolean;
}

// ============================================
// Export/Import Options (Phase 8)
// ============================================

export interface ExportOptions {
  /** Filename without extension */
  filename?: string;
  /** Include header row */
  includeHeader?: boolean;
  /** Export only selected rows */
  selectedOnly?: boolean;
  /** Export only filtered/visible rows */
  filteredOnly?: boolean;
  /** Specific columns to export */
  columns?: string[];
  /** Sheet name for Excel */
  sheetName?: string;
}

export interface ImportResult {
  /** Imported data */
  data: RowData[];
  /** Column headers from imported file */
  headers: string[];
  /** Any errors during import */
  errors: string[];
}

// ============================================
// Undo/Redo Types (Phase 9)
// ============================================

export type UndoActionType = 
  | 'cell_edit'
  | 'row_add'
  | 'row_remove'
  | 'row_update'
  | 'paste'
  | 'cut'
  | 'delete'
  | 'bulk_edit';

export interface UndoAction {
  type: UndoActionType;
  timestamp: number;
  data: unknown;
}

export interface CellEditUndoData {
  rowIndex: number;
  field: string;
  oldValue: CellValue;
  newValue: CellValue;
}

export interface RowAddUndoData {
  row: RowData;
  index: number;
}

export interface RowRemoveUndoData {
  row: RowData;
  index: number;
}

export interface BulkEditUndoData {
  changes: Array<{
    rowIndex: number;
    field: string;
    oldValue: CellValue;
    newValue: CellValue;
  }>;
}

// ============================================
// Context Menu Types (Phase 10)
// ============================================

/** Context menu item type */
export type ContextMenuItemType = 'item' | 'separator' | 'submenu';

/** Context menu target type */
export type ContextMenuTarget = 'cell' | 'row' | 'header' | 'column';

/** Context for menu item callbacks */
export interface ContextMenuContext {
  /** Row index (for cell/row context) */
  rowIndex?: number;
  /** Column field (for cell/header context) */
  field?: string;
  /** Row data (for cell/row context) */
  rowData?: RowData;
  /** Column definition (for cell/header context) */
  column?: ColumnDefinition;
  /** Selected rows */
  selectedRows: number[];
  /** Selected cells */
  selectedCells: CellIndex[];
  /** Grid instance */
  grid: VeloxGridInstance;
}

/** Context menu item definition */
export interface ContextMenuItem {
  /** Item type */
  type?: ContextMenuItemType;
  /** Unique identifier */
  id?: string;
  /** Display label */
  label?: string;
  /** Icon (emoji, HTML, or class name) */
  icon?: string;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Disabled state or callback */
  disabled?: boolean | ((context: ContextMenuContext) => boolean);
  /** Visible state or callback */
  visible?: boolean | ((context: ContextMenuContext) => boolean);
  /** Click handler */
  action?: (context: ContextMenuContext) => void;
  /** Sub-menu items (for type: 'submenu') */
  items?: ContextMenuItem[];
  /** CSS class for the item */
  className?: string;
}

/** Context menu configuration */
export interface ContextMenuOptions {
  /** Enable context menu */
  enabled?: boolean;
  /** Cell/Row context menu items */
  items?: ContextMenuItem[];
  /** Header/Column context menu items */
  headerItems?: ContextMenuItem[];
  /** Show default menu items */
  showDefaultItems?: boolean;
  /** Custom class for menu container */
  className?: string;
}

// ============================================
// Grid Options
// ============================================

export interface GridOptions {
  /** Column definitions */
  columns: ColumnDefinition[];
  /** Initial data */
  data?: RowData[];
  /** Grid width */
  width?: number | string;
  /** Grid height */
  height?: number | string;
  /** Row height in pixels */
  rowHeight?: number;
  /** Header height in pixels */
  headerHeight?: number;
  /** Show row numbers */
  showRowNumbers?: boolean;
  /** Enable row selection */
  selectable?: boolean;
  /** Selection mode (Phase 7) */
  selectionMode?: SelectionMode;
  /** Selection style (Phase 7) */
  selectionStyle?: SelectionStyle;
  /** Show checkbox column (deprecated: use checkBar) */
  showCheckbox?: boolean;
  /** CheckBar options (Phase 7) */
  checkBar?: CheckBarOptions;
  /** Enable sorting */
  sortable?: boolean;
  /** Enable filtering */
  filterable?: boolean;
  /** Enable editing */
  editable?: boolean;
  /** Enable column resize */
  resizable?: boolean;
  /** Enable virtual scrolling */
  virtualScroll?: boolean;
  /** Virtual scroll buffer size */
  bufferSize?: number;
  /** Theme name */
  theme?: 'default' | 'dark' | string;
  /** Locale */
  locale?: string;
  /** Empty data message */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Custom CSS class */
  className?: string;
  /** Enable Undo/Redo (Phase 9) */
  undoable?: boolean;
  /** Max undo stack size (Phase 9) */
  undoStackSize?: number;
  /** Context menu options (Phase 10) */
  contextMenu?: ContextMenuOptions;
}

// ============================================
// Sort & Filter
// ============================================

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  field: string;
  direction: SortDirection;
}

export type FilterOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'contains' 
  | 'notContains'
  | 'startsWith' 
  | 'endsWith'
  | 'greaterThan' 
  | 'lessThan'
  | 'greaterThanOrEqual' 
  | 'lessThanOrEqual'
  | 'between'
  | 'isEmpty'
  | 'isNotEmpty';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: CellValue;
  value2?: CellValue; // For 'between' operator
}

export interface FilterState {
  conditions: FilterCondition[];
  logic: 'and' | 'or';
}

// ============================================
// Selection
// ============================================

export interface SelectionState {
  selectedRows: Set<number>;
  selectedCells: Set<string>; // "rowIndex:field" format
  focusedCell: CellIndex | null;
  selections: Selection[]; // Multiple selection areas (Phase 7)
}

// ============================================
// CheckBar State (Phase 7)
// ============================================

export interface CheckBarState {
  checkedRows: Set<number>;
  checkableRows: Set<number>;
}

// ============================================
// Edit
// ============================================

export interface EditState {
  editing: boolean;
  rowIndex: number | null;
  field: string | null;
  originalValue: CellValue;
}

export interface CellEditEvent {
  rowIndex: number;
  field: string;
  oldValue: CellValue;
  newValue: CellValue;
  row: RowData;
}

// ============================================
// Events
// ============================================

export interface GridEvents {
  // Data events
  onDataChange?: (data: RowData[]) => void;
  onRowAdd?: (row: RowData, index: number) => void;
  onRowRemove?: (row: RowData, index: number) => void;
  onRowUpdate?: (row: RowData, index: number, changes: Partial<RowData>) => void;

  // Selection events
  onSelectionChange?: (selectedRows: number[]) => void;
  onRowSelect?: (rowIndex: number, selected: boolean) => void;
  onAllSelect?: (selected: boolean) => void;
  onCellClick?: (rowIndex: number, field: string, value: CellValue) => void;
  onCellDoubleClick?: (rowIndex: number, field: string, value: CellValue) => void;
  onRowClick?: (rowIndex: number, row: RowData) => void;
  onRowDoubleClick?: (rowIndex: number, row: RowData) => void;

  // Cell Selection events (Phase 7)
  onCellSelect?: (cell: CellIndex, selected: boolean) => void;
  onCellSelectionChange?: (cells: CellIndex[]) => void;

  // CheckBar events (Phase 7)
  onCheckChange?: (rowIndex: number, checked: boolean) => void;
  onCheckAllChange?: (checked: boolean) => void;

  // Sort & Filter events
  onSort?: (sortState: SortState[]) => void;
  onFilter?: (filterState: FilterState) => void;

  // Edit events
  onCellEditStart?: (rowIndex: number, field: string, value: CellValue) => void;
  onCellEditEnd?: (event: CellEditEvent) => void;
  onCellEditCancel?: (rowIndex: number, field: string) => void;

  // Clipboard events (Phase 9)
  onCopy?: (data: string[][]) => void;
  onPaste?: (data: string[][], startCell: CellIndex) => void;
  onCut?: (data: string[][]) => void;

  // Keyboard events (Phase 9)
  onKeyDown?: (event: KeyboardEvent, cell: CellIndex | null) => void;
  
  // Undo/Redo events (Phase 9)
  onUndo?: (action: UndoAction) => void;
  onRedo?: (action: UndoAction) => void;

  // Scroll events
  onScroll?: (scrollTop: number, scrollLeft: number) => void;

  // Column events
  onColumnResize?: (field: string, width: number) => void;
  onColumnReorder?: (field: string, fromIndex: number, toIndex: number) => void;

  // Lifecycle events
  onReady?: (grid: VeloxGridInstance) => void;
  onDestroy?: () => void;
}

// ============================================
// Grid Instance (Public API)
// ============================================

export interface VeloxGridInstance {
  // Lifecycle
  destroy(): void;
  refresh(): void;

  // Data methods
  getData(): RowData[];
  setData(data: RowData[]): void;
  getRow(index: number): RowData | null;
  addRow(row: RowData, index?: number): void;
  updateRow(index: number, data: Partial<RowData>): void;
  removeRow(index: number): void;
  clearData(): void;

  // Row Selection methods
  getSelectedRows(): number[];
  getSelectedData(): RowData[];
  selectRow(index: number, selected?: boolean): void;
  selectAll(selected?: boolean): void;
  clearSelection(): void;
  isRowSelected(index: number): boolean;

  // Cell Selection methods (Phase 7)
  selectCell(rowIndex: number, field: string, selected?: boolean): void;
  getSelectedCells(): CellIndex[];
  setFocusedCell(rowIndex: number, field: string): void;
  getFocusedCell(): CellIndex | null;
  setSelection(selection: Selection): void;
  getSelection(): Selection | null;
  getSelectionData(): CellValue[][];

  // CheckBar methods (Phase 7)
  checkItem(index: number, checked?: boolean): void;
  checkItems(indices: number[], checked?: boolean): void;
  checkAll(checked?: boolean): void;
  uncheckAll(): void;
  getCheckedItems(): number[];
  getCheckedData(): RowData[];
  isItemChecked(index: number): boolean;
  isItemCheckable(index: number): boolean;

  // Legacy checkbox aliases (deprecated)
  checkRow(index: number, checked?: boolean): void;
  getCheckedRows(): number[];

  // Sort methods
  sort(field: string, direction?: SortDirection): void;
  clearSort(): void;
  getSortState(): SortState[];

  // Filter methods
  filter(conditions: FilterCondition | FilterCondition[]): void;
  clearFilter(): void;
  getFilterState(): FilterState | null;

  // Edit methods
  startEdit(rowIndex: number, field: string): void;
  endEdit(save?: boolean): void;
  cancelEdit(): void;
  isEditing(): boolean;

  // Column methods
  getColumn(field: string): ColumnDefinition | null;
  setColumnWidth(field: string, width: number): void;
  showColumn(field: string): void;
  hideColumn(field: string): void;
  setColumns(columns: ColumnDefinition[]): void;
  autoFitColumn(field: string): void;
  autoFitAllColumns(): void;

  // Scroll methods
  scrollToRow(index: number): void;
  scrollToTop(): void;
  scrollToBottom(): void;
  scrollToCell(rowIndex: number, field: string): void;

  // Clipboard methods (Phase 9)
  copy(): void;
  paste(): void;
  cut(): void;
  
  // Undo/Redo methods (Phase 9)
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;
  clearHistory(): void;
  
  // Delete methods (Phase 9)
  deleteSelectedCells(): void;
  deleteSelectedRows(): void;

  // Export methods (Phase 8)
  exportToExcel(options?: ExportOptions): void;
  exportToCSV(options?: ExportOptions): string;
  downloadCSV(options?: ExportOptions): void;
  exportToJSON(options?: ExportOptions): string;
  downloadJSON(options?: ExportOptions): void;
  
  // Import methods (Phase 8)
  importFromCSV(csvString: string, hasHeader?: boolean): ImportResult;
  importFromExcel(file: File, sheetIndex?: number): Promise<ImportResult>;

  // Utility methods
  getRowCount(): number;
  getVisibleRowCount(): number;
  getCellValue(rowIndex: number, field: string): CellValue;
  setCellValue(rowIndex: number, field: string, value: CellValue): void;

  // Options
  setOptions(options: Partial<GridOptions>): void;
  getOptions(): GridOptions;
}

// ============================================
// Internal Types
// ============================================

export interface GridState {
  data: RowData[];
  displayData: RowData[]; // After sort/filter
  columns: ColumnDefinition[];
  selection: SelectionState;
  checkBar: CheckBarState; // Phase 7
  sort: SortState[];
  filter: FilterState | null;
  edit: EditState;
  scroll: {
    top: number;
    left: number;
  };
}

export interface RenderContext {
  startIndex: number;
  endIndex: number;
  visibleColumns: ColumnDefinition[];
  rowHeight: number;
  headerHeight: number;
  totalHeight: number;
  totalWidth: number;
}
