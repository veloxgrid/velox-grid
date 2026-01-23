/**
 * VeloxGrid Type Definitions
 * @description Core types for the VeloxGrid library
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
  /** Selection mode */
  selectionMode?: 'single' | 'multiple';
  /** Show checkbox column */
  showCheckbox?: boolean;
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
  selectedCells: Set<string>; // "rowIndex:colIndex" format
  focusedCell: { row: number; col: number } | null;
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

  // Sort & Filter events
  onSort?: (sortState: SortState[]) => void;
  onFilter?: (filterState: FilterState) => void;

  // Edit events
  onCellEditStart?: (rowIndex: number, field: string, value: CellValue) => void;
  onCellEditEnd?: (event: CellEditEvent) => void;
  onCellEditCancel?: (rowIndex: number, field: string) => void;

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

  // Selection methods
  getSelectedRows(): number[];
  getSelectedData(): RowData[];
  selectRow(index: number, selected?: boolean): void;
  selectAll(selected?: boolean): void;
  clearSelection(): void;
  isRowSelected(index: number): boolean;

  // Check methods (alias for selection with checkbox)
  checkRow(index: number, checked?: boolean): void;
  checkAll(checked?: boolean): void;
  getCheckedRows(): number[];
  getCheckedData(): RowData[];

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

  // Scroll methods
  scrollToRow(index: number): void;
  scrollToTop(): void;
  scrollToBottom(): void;

  // Utility methods
  getRowCount(): number;
  getVisibleRowCount(): number;
  getCellValue(rowIndex: number, field: string): CellValue;
  setCellValue(rowIndex: number, field: string, value: CellValue): void;

  // Options
  setOptions(options: Partial<GridOptions>): void;
  getOptions(): GridOptions;

  // Export (future)
  // exportToCSV(): string;
  // exportToJSON(): string;
}

// ============================================
// Internal Types
// ============================================

export interface GridState {
  data: RowData[];
  displayData: RowData[]; // After sort/filter
  columns: ColumnDefinition[];
  selection: SelectionState;
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
