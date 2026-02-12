/**
 * VeloxGrid Type Definitions v6.0
 * @description Core types for the VeloxGrid library
 * Phase 7: Selection Enhancement
 * Phase 8: Excel Export/Import
 * Phase 9: Keyboard Enhancement & Undo/Redo
 * Phase 13: Summary/Aggregation
 */

// ============================================
// Value Types
// ============================================

export type ValueType = 'text' | 'number' | 'boolean' | 'date' | 'datetime';

export type CellValue = string | number | boolean | Date | string[] | null | undefined;

export type RowData = Record<string, CellValue>;

// ============================================
// Validation Types (Phase 12.1)
// ============================================

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  message: string;
  validator?: (value: CellValue, row: RowData) => boolean | string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}

// ============================================
// Custom Editor Types (Phase 12.2)
// ============================================

export type EditorType = 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'custom';

export interface SelectOption {
  value: CellValue;
  label: string;
}

export interface EditorOptions {
  /** Editor type */
  type: EditorType;
  /** Options for select editor */
  options?: SelectOption[];
  /** Min value for number editor */
  min?: number;
  /** Max value for number editor */
  max?: number;
  /** Step for number editor */
  step?: number;
  /** Date format string (e.g., 'YYYY-MM-DD') */
  format?: string;
  /** Custom renderer function */
  renderer?: (cell: HTMLElement, value: CellValue, save: (v: CellValue) => void, cancel: () => void) => void;
  /** Allow multiple selection (for select editor) */
  multiple?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

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
  /** Validation rules (Phase 12.1) */
  validation?: ValidationRule[];
  /** Custom editor options (Phase 12.2) */
  editor?: EditorOptions;
  /** Cell tooltip (Phase 12.3) - boolean for auto tooltip, function for custom */
  tooltip?: boolean | ((value: CellValue, row: RowData) => string);
  /** Summary configuration (Phase 13) */
  summary?: SummaryConfig;
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
  /** Display order (lower number = more left) - Phase 14.1 */
  displayOrder?: number;
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
// Fixed Columns Options (Phase 14)
// ============================================

/**
 * Row numbers options
 * @description Options for displaying row numbers
 */
export interface RowNumbersOptions {
  /** Show row numbers */
  visible: boolean;
  /** Display order (lower number = more left) - Phase 14.1 */
  displayOrder?: number;
}

/**
 * Row drag options
 * @description Options for row drag and drop
 */
export interface RowDragOptions {
  /** Enable row drag and drop */
  enabled: boolean;
  /** Display order (lower number = more left) - Phase 14.1 */
  displayOrder?: number;
}

/**
 * Column fixed options (RealGrid style)
 * @description Options for fixing columns to left or right
 */
export interface FixedOptions {
  /**
   * Number of columns to fix from left
   * CheckBar, RowNumbers, DragHandle are counted separately
   * @default 0
   * @example
   * fixedOptions: { colCount: 2 }  // Fix first 2 data columns to left
   */
  colCount?: number;
  
  /**
   * Number of columns to fix from right
   * @default 0
   * @example
   * fixedOptions: { rightCount: 1 }  // Fix last 1 column to right
   */
  rightCount?: number;
}

// ============================================
// Data Source & Pagination Types (Phase 18)
// ============================================

/**
 * 서버 요청 시 전달되는 파라미터
 */
export interface DataRequestParams {
  /** 현재 페이지 (1-based) */
  page: number;
  /** 페이지당 행 수 */
  pageSize: number;
  /** 정렬 상태 */
  sort?: SortState[];
  /** 필터 상태 */
  filter?: FilterState | null;
}

/**
 * 서버 응답 결과
 */
export interface DataResponseResult {
  /** 행 데이터 */
  data: RowData[];
  /** 전체 행 수 (페이지네이션 계산용) */
  totalCount: number;
}

/**
 * 페이지네이션 상태
 */
export interface PaginationState {
  /** 현재 페이지 (1-based) */
  currentPage: number;
  /** 페이지당 행 수 */
  pageSize: number;
  /** 전체 행 수 */
  totalCount: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 로딩 중 여부 */
  loading: boolean;
}

/**
 * 페이지네이션 옵션
 */
export interface PaginationOptions {
  /** 페이지네이션 활성화 */
  enabled: boolean;
  /** 
   * 페이지네이션 모드
   * - 'page': 일반 페이지 네비게이션 (기본값)
   * - 'infinite': 스크롤 끝에 도달하면 다음 페이지 자동 로드
   */
  mode?: 'page' | 'infinite';
  /** 페이지당 행 수 (default: 20) */
  pageSize?: number;
  /** 페이지 크기 변경 옵션 목록 */
  pageSizeOptions?: number[];
  /** 표시할 페이지 버튼 수 (default: 5) */
  maxPageButtons?: number;
  /** 페이지 정보 표시 (default: true) */
  showInfo?: boolean;
  /** 페이지 크기 셀렉터 표시 (default: false) */
  showSizeChanger?: boolean;
  /** Infinite scroll: 다음 페이지 로드를 트리거하는 스크롤 바닥 여유 (px, default: 100) */
  infiniteScrollThreshold?: number;
}

/**
 * 데이터 소스 설정
 */
export interface DataSourceOptions {
  /** 
   * 데이터 소스 타입
   * - 'local': 클라이언트 측 데이터 (기본값, 기존 동작)
   * - 'remote': 서버에서 데이터를 가져옴
   */
  type: 'local' | 'remote';
  /**
   * 서버 데이터 요청 함수 (type: 'remote' 시 필수)
   * 정렬/필터/페이지 변경 시 자동 호출
   */
  fetch?: (params: DataRequestParams) => Promise<DataResponseResult>;
  /**
   * 초기 전체 행 수 (서버 측 페이지네이션 시 사용)
   * fetch 응답의 totalCount로 자동 업데이트됨
   */
  totalCount?: number;
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
  /** Show row numbers (boolean for backward compatibility, or RowNumbersOptions for advanced control) */
  showRowNumbers?: boolean | RowNumbersOptions;
  /** Enable row drag and drop to reorder (boolean for backward compatibility, or RowDragOptions for advanced control) */
  rowDraggable?: boolean | RowDragOptions;
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
  /** Footer summary options (Phase 13) */
  footerSummary?: FooterSummaryOptions;
  /** Group summary options (Phase 13) */
  groupSummary?: GroupSummaryOptions;
  /** Fixed columns options (Phase 14) */
  fixedOptions?: FixedOptions;
  /** Data source options (Phase 18) */
  dataSource?: DataSourceOptions;
  /** Pagination options (Phase 18) */
  pagination?: PaginationOptions;
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
  lastSelectedRow: number | null; // 마지막 선택된 행 (Shift+클릭용)
}

// ============================================
// CheckBar State (Phase 7)
// ============================================

export interface CheckBarState {
  checkedRows: Set<number>;
  checkableRows: Set<number>;
}

// ============================================
// Row State (Phase 15)
// ============================================

/**
 * Row State Type - CRUD tracking for each row
 * @description Tracks the modification state of each row
 * - none: No changes (original data)
 * - created: Newly added row
 * - updated: Modified row
 * - deleted: Deleted row (marked for deletion)
 * - createAndDeleted: Created then deleted (no server action needed)
 */
export type RowStateType = 'none' | 'created' | 'updated' | 'deleted' | 'createAndDeleted';

/**
 * Row State Management Interface
 * @description Manages the state map for all rows
 */
export interface RowStateManager {
  /** Map of row data to their state */
  rowStates: Map<RowData, RowStateType>;
}

/**
 * Changes Result Interface
 * @description Structure for getting all changes
 */
export interface ChangesResult {
  /** Newly created rows */
  created: RowData[];
  /** Modified rows */
  updated: RowData[];
  /** Deleted rows */
  deleted: RowData[];
}

// ============================================
// Summary/Aggregation Types (Phase 13)
// ============================================

/** Summary aggregation function type */
export type SummaryFunction = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';

/** Summary position */
export type SummaryPosition = 'footer' | 'group';

/** Summary configuration for a column */
export interface SummaryConfig {
  /** Aggregation function */
  function: SummaryFunction;
  /** Custom aggregation function */
  customFunction?: (values: CellValue[], data: RowData[]) => CellValue;
  /** Label text (for footer summary) */
  label?: string;
  /** Number format (e.g., '0,0.00' for decimal) */
  format?: string;
  /** Custom formatter */
  formatter?: (value: CellValue) => string;
  /** CSS class */
  className?: string;
  /** Align (default: column align) */
  align?: 'left' | 'center' | 'right';
}

/** Footer summary options */
export interface FooterSummaryOptions {
  /** Show footer summary row */
  visible: boolean;
  /** Height of footer row (default: rowHeight) */
  height?: number;
  /** Summary configuration for each column (field -> config) */
  columns?: Record<string, SummaryConfig>;
  /** CSS class for footer row */
  className?: string;
}

/** Group summary options */
export interface GroupSummaryOptions {
  /** Enable group summary */
  enabled: boolean;
  /** Group by field */
  groupBy: string;
  /** Show group header */
  showHeader?: boolean;
  /** Show group footer (summary row) */
  showFooter?: boolean;
  /** Summary configuration for each column */
  columns?: Record<string, SummaryConfig>;
  /** Custom group header renderer */
  headerRenderer?: (groupValue: CellValue, count: number) => string;
  /** Collapsed groups (groupValue -> collapsed) */
  collapsed?: Set<CellValue>;
}

/** Summary calculation result */
export interface SummaryResult {
  field: string;
  function: SummaryFunction;
  value: CellValue;
  formattedValue: string;
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

  // Validation events (Phase 12.1)
  onValidationError?: (event: { rowIndex: number; field: string; value: CellValue; errors: string[] }) => void;

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

  // Pagination events (Phase 18)
  onPageChange?: (page: number, pageSize: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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

  // Summary methods (Phase 13)
  getSummaryValue(field: string): CellValue;
  getSummaryValues(): Record<string, CellValue>;
  refreshSummary(): void;

  // Row State methods (Phase 15)
  getRowState(index: number): RowStateType;
  getRowStateByData(row: RowData): RowStateType;
  setRowState(index: number, state: RowStateType): void;
  getChanges(): ChangesResult;
  getCreatedRows(): RowData[];
  getUpdatedRows(): RowData[];
  getDeletedRows(): RowData[];
  clearRowStates(): void;
  commit(): void;

  // Options
  setOptions(options: Partial<GridOptions>): void;
  getOptions(): GridOptions;

  // Pagination methods (Phase 18)
  goToPage(page: number): void;
  setPageSize(pageSize: number): void;
  getPaginationState(): PaginationState;
  fetchData(): Promise<void>;
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
  rowStates: Map<RowData, RowStateType>; // Phase 15: Row state tracking
  sort: SortState[];
  filter: FilterState | null;
  edit: EditState;
  pagination: PaginationState; // Phase 18
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


// ============================================
// GridContext Interface (Phase 8 - Modularization)
// ============================================

/**
 * GridContext - VeloxGrid 내부 모듈들이 사용하는 컨텍스트 인터페이스
 * 
 * 모듈들이 VeloxGrid 클래스에 직접 의존하지 않고 이 인터페이스를 통해 접근
 * 순환 참조 방지 및 테스트 용이성 향상을 위한 설계
 */
export interface GridContext {
  // ============================================
  // DOM Elements (readonly)
  // ============================================
  readonly rootElement: HTMLElement;
  readonly headerElement: HTMLElement;
  readonly bodyElement: HTMLElement;
  readonly bodyInner: HTMLElement;
  readonly footerElement: HTMLElement | null;
  readonly fixedLeftContainer: HTMLElement | null;
  readonly fixedLeftHeader: HTMLElement | null;
  readonly fixedLeftBody: HTMLElement | null;
  readonly fixedLeftBodyInner: HTMLElement | null;
  readonly fixedLeftFooter: HTMLElement | null;
  readonly fixedRightContainer: HTMLElement | null;  // Phase 14
  readonly fixedRightHeader: HTMLElement | null;     // Phase 14
  readonly fixedRightBody: HTMLElement | null;       // Phase 14
  readonly fixedRightBodyInner: HTMLElement | null;  // Phase 14
  readonly fixedRightFooter: HTMLElement | null;     // Phase 14
  readonly loadingOverlay: HTMLElement | null;

  // ============================================
  // State Accessors
  // ============================================
  /** 그리드 옵션 반환 */
  getOptions(): GridOptions;
  /** 그리드 상태 반환 */
  getState(): GridState;
  /** 이벤트 핸들러 반환 */
  getEvents(): GridEvents;
  /** 그리드 고유 ID 반환 */
  getGridId(): string;
  /** 페이지네이션 상태 반환 (Phase 18) */
  getPaginationState(): PaginationState;
  /** Remote 데이터 소스 여부 (Phase 18) */
  isRemoteDataSource(): boolean;

  // ============================================
  // Column Methods
  // ============================================
  /** 모든 visible 컬럼 반환 (cached) */
  getVisibleColumns(): ColumnDefinition[];
  /** 왼쪽 고정 컬럼 반환 (Special columns + fixedOptions.colCount data columns - cached) Phase 14 */
  getFixedLeftColumns(): ColumnDefinition[];
  /** 오른쪽 고정 컬럼 반환 (based on fixedOptions.rightCount - cached) Phase 14 */
  getFixedRightColumns(): ColumnDefinition[];
  /** 스크롤 가능 컬럼 반환 (cached) */
  getScrollableColumns(): ColumnDefinition[];
  /** 컬럼 캐시 무효화 */
  invalidateColumnCache(): void;
  /** 왼쪽 고정 영역 존재 여부 */
  hasFixedLeft(): boolean;
  /** 오른쪽 고정 영역 존재 여부 Phase 14 */
  hasFixedRight(): boolean;

  // ============================================
  // Data Methods
  // ============================================
  /** 표시 데이터 반환 (정렬/필터 적용 후) */
  getDisplayData(): RowData[];
  /** 원본 데이터 반환 */
  getData(): RowData[];
  /** 데이터 변환 적용 (정렬/필터) */
  applyDataTransformations(): void;
  /** 데이터 인덱스 맵 재구성 */
  rebuildDataIndexMap(): void;
  /** 체크 가능 행 초기화 */
  initCheckableRows(): void;

  // ============================================
  // Virtual Scroll
  // ============================================
  /** 가상 스크롤 상태 */
  getVirtualState(): {
    startIndex: number;
    endIndex: number;
    visibleCount: number;
    totalHeight: number;
  };
  /** 가상 스크롤 상태 계산 */
  calculateVirtualState(): void;
  /** 현재 표시되는 행 목록 반환 */
  getVisibleRows(): { data: RowData; index: number }[];

  // ============================================
  // Rendering
  // ============================================
  /** 전체 렌더링 */
  render(): void;
  /** 바디만 렌더링 */
  renderBody(): void;
  /** 헤더만 렌더링 */
  renderHeader(): void;
  /** 로딩 상태 업데이트 */
  updateLoadingState(): void;

  // ============================================
  // Selection
  // ============================================
  /** 선택 상태 초기화 */
  clearSelectionState(): void;
  /** 선택된 셀 목록 반환 */
  getSelectedCells(): CellIndex[];
  /** 행 선택 */
  selectRow(index: number, selected: boolean): void;
  /** 셀 범위 선택 */
  selectCellRange(startRow: number, startField: string, endRow: number, endField: string): void;

  // ============================================
  // CheckBar
  // ============================================
  /** 체크 상태 변경 */
  checkItem(index: number, checked: boolean): void;
  /** 전체 체크/해제 */
  checkAll(checked: boolean): void;

  // ============================================
  // Edit
  // ============================================
  /** 편집 시작 */
  startEdit(rowIndex: number, field: string): void;
  /** 편집 종료 */
  endEdit(save?: boolean): void;
  /** 편집 취소 */
  cancelEdit(): void;
  /** 편집 셀 렌더링 */
  renderEditCell(rowIndex: number, field: string, value: CellValue): void;

  // ============================================
  // Sort & Filter
  // ============================================
  /** 정렬 처리 */
  handleSort(field: string): void;
  /** 컬럼 필터 적용 */
  applyColumnFilter(field: string, operator: FilterOperator, value: CellValue): void;
  /** 컬럼 필터 제거 */
  removeColumnFilter(field: string): void;

  // ============================================
  // Column Operations
  // ============================================
  /** 컬럼 고정 */
  fixColumn(field: string, position: 'left' | 'right' | false): void;
  /** 컬럼 순서 변경 */
  reorderColumn(sourceField: string, targetField: string): void;
  /** 컬럼 숨기기 */
  hideColumn(field: string): void;
  /** 컬럼 표시 */
  showColumn(field: string): void;
  /** 컬럼 너비 자동 조절 */
  autoFitColumn(field: string): void;

  // ============================================
  // Row Operations
  // ============================================
  /** 행 이동 */
  moveRow(fromIndex: number, toIndex: number): void;

  // ============================================
  // History (Undo/Redo)
  // ============================================
  /** Undo 스택에 액션 추가 */
  pushUndo(action: UndoAction): void;
  /** Undo 가능 여부 */
  canUndo(): boolean;
  /** Redo 가능 여부 */
  canRedo(): boolean;

  // ============================================
  // Events
  // ============================================
  /** 이벤트 발행 헬퍼 */
  emitEvent<K extends keyof GridEvents>(
    event: K, 
    ...args: Parameters<NonNullable<GridEvents[K]>>
  ): void;

  // ============================================
  // Internal Handlers (for modules)
  // ============================================
  /** Filter 팝업 표시 */
  showFilterPopup(column: ColumnDefinition, anchor: HTMLElement): void;
  /** Column 메뉴 표시 */
  showColumnMenu(column: ColumnDefinition, anchor: HTMLElement): void;
  /** Column 드래그 시작 */
  startColumnDrag(e: MouseEvent, column: ColumnDefinition): void;
  /** Row 드래그 시작 */
  startRowDrag(e: MouseEvent, rowIndex: number, rowElement: HTMLElement): void;
  /** Resize 시작 */
  startResize(e: MouseEvent, column: ColumnDefinition): void;
  /** Block selection 시작 */
  startBlockSelection(rowIndex: number, field: string): void;
  /** Block selection 업데이트 */
  updateBlockSelection(rowIndex: number, field: string): void;
  /** Block selection 상태 확인 */
  isBlockSelecting(): boolean;
  /** Row 클릭 핸들러 */
  handleRowClick(rowIndex: number, e: MouseEvent): void;
  /** Row 더블클릭 핸들러 */
  handleRowDoubleClick(rowIndex: number, e: MouseEvent): void;
  /** Cell 클릭 핸들러 */
  handleCellClick(rowIndex: number, field: string, value: CellValue, e: MouseEvent): void;
  /** Tooltip 표시 */
  showTooltip(cell: HTMLElement, value: CellValue, rowData: RowData, column: ColumnDefinition): void;
  /** Tooltip 숨기기 */
  hideTooltip(): void;

  // ============================================
  // Text Measurement (for auto-fit)
  // ============================================
  /** 텍스트 너비 측정 */
  measureTextWidth(text: string, font?: string): number;

  // ============================================
  // Summary (Phase 13)
  // ============================================
  /** Summary 값 조회 */
  getSummaryValue(field: string): CellValue;
  /** 모든 Summary 값 조회 */
  getSummaryValues(): Record<string, CellValue>;

  // ============================================
  // Fixed Columns (Phase 14)
  // ============================================
  /** Fixed options 설정 */
  setFixedOptions(options: FixedOptions): void;
  /** Fixed options 조회 */
  getFixedOptions(): FixedOptions;

  // ============================================
  // Pagination (Phase 18)
  // ============================================
  /** 특정 페이지로 이동 */
  goToPage(page: number): void;
  /** 페이지 크기 변경 */
  setPageSize(pageSize: number): void;
  /** 현재 페이지네이션 상태 조회 */
  getPaginationState(): PaginationState;
  /** 서버 데이터 수동 새로고침 */
  fetchData(): Promise<void>;
}
