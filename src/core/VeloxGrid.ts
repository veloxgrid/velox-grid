/**
 * VeloxGrid - Core Grid Class
 * A fast, lightweight, and framework-agnostic data grid
 */

import type {
  GridOptions,
  GridState,
  RowData,
  ColumnDefinition,
  SortState,
  SortDirection,
  FilterState,
  FilterCondition,
  CellValue,
  VeloxGridInstance,
  GridEvents,
  ValueType,
} from '../types';
import { createElement, addClass, removeClass, throttle } from '../utils/dom';
import { deepClone, formatValue, sortData, filterData, generateId } from '../utils/data';

// Default options
const DEFAULT_OPTIONS: Partial<GridOptions> = {
  rowHeight: 40,
  headerHeight: 44,
  showRowNumbers: false,
  selectable: true,
  selectionMode: 'multiple',
  showCheckbox: false,
  sortable: true,
  filterable: false,
  editable: false,
  resizable: true,
  virtualScroll: false,
  bufferSize: 5,
  theme: 'default',
  locale: 'ko-KR',
  emptyMessage: '데이터가 없습니다.',
  loadingMessage: '로딩 중...',
};

export class VeloxGrid implements VeloxGridInstance {
  // Private properties
  private container: HTMLElement;
  private options: GridOptions;
  private state: GridState;
  private events: GridEvents;
  private gridId: string;

  // DOM Elements
  private rootElement!: HTMLElement;
  private headerElement!: HTMLElement;
  private bodyElement!: HTMLElement;
  private bodyInner!: HTMLElement;

  // Resize tracking
  private resizing: { field: string; startX: number; startWidth: number } | null = null;

  constructor(
    container: HTMLElement | string,
    options: GridOptions,
    events: GridEvents = {}
  ) {
    // Get container element
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      if (!el) throw new Error(`Container not found: ${container}`);
      this.container = el as HTMLElement;
    } else {
      this.container = container;
    }

    // Merge options with defaults
    this.options = { ...DEFAULT_OPTIONS, ...options } as GridOptions;
    this.events = events;
    this.gridId = generateId('velox-grid');

    // Initialize state
    this.state = {
      data: [],
      displayData: [],
      columns: this.options.columns.map(col => ({ ...col })),
      selection: {
        selectedRows: new Set(),
        selectedCells: new Set(),
        focusedCell: null,
      },
      sort: [],
      filter: null,
      edit: {
        editing: false,
        rowIndex: null,
        field: null,
        originalValue: null,
      },
      scroll: { top: 0, left: 0 },
    };

    // Set initial data
    if (this.options.data) {
      this.state.data = deepClone(this.options.data);
      this.state.displayData = [...this.state.data];
    }

    // Build and render
    this.build();
    this.render();
    this.attachEvents();

    // Fire ready event
    this.events.onReady?.(this);
  }

  // ============================================
  // Build DOM Structure
  // ============================================

  private build(): void {
    // Create root element
    this.rootElement = createElement('div', 'velox-grid');
    this.rootElement.id = this.gridId;
    
    if (this.options.className) {
      addClass(this.rootElement, this.options.className);
    }

    // Set dimensions
    if (this.options.width) {
      this.rootElement.style.width = typeof this.options.width === 'number' 
        ? `${this.options.width}px` 
        : this.options.width;
    }
    if (this.options.height) {
      this.rootElement.style.height = typeof this.options.height === 'number'
        ? `${this.options.height}px`
        : this.options.height;
    }

    // Create header
    this.headerElement = createElement('div', 'velox-header');
    this.rootElement.appendChild(this.headerElement);

    // Create body
    this.bodyElement = createElement('div', 'velox-body');
    this.bodyInner = createElement('div', 'velox-body-inner');
    this.bodyElement.appendChild(this.bodyInner);
    this.rootElement.appendChild(this.bodyElement);

    // Append to container
    this.container.innerHTML = '';
    this.container.appendChild(this.rootElement);
  }

  // ============================================
  // Render Methods
  // ============================================

  private render(): void {
    this.renderHeader();
    this.renderBody();
  }

  private renderHeader(): void {
    const headerRow = createElement('div', 'velox-header-row');

    // Checkbox column
    if (this.options.showCheckbox) {
      const checkboxCell = this.createHeaderCheckboxCell();
      headerRow.appendChild(checkboxCell);
    }

    // Row number column
    if (this.options.showRowNumbers) {
      const rowNumCell = createElement('div', 'velox-header-cell velox-rownumber-cell');
      rowNumCell.textContent = '#';
      headerRow.appendChild(rowNumCell);
    }

    // Data columns
    this.state.columns.forEach((column) => {
      if (column.visible === false) return;
      const cell = this.createHeaderCell(column);
      headerRow.appendChild(cell);
    });

    this.headerElement.innerHTML = '';
    this.headerElement.appendChild(headerRow);
  }

  private createHeaderCheckboxCell(): HTMLElement {
    const cell = createElement('div', 'velox-header-cell velox-checkbox-cell');
    const checkbox = createElement('input', 'velox-checkbox') as HTMLInputElement;
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', 'Select all rows');
    
    // Set checkbox state
    const allSelected = this.state.displayData.length > 0 &&
      this.state.selection.selectedRows.size === this.state.displayData.length;
    const someSelected = this.state.selection.selectedRows.size > 0 && !allSelected;
    
    checkbox.checked = allSelected;
    checkbox.indeterminate = someSelected;

    checkbox.addEventListener('change', () => {
      this.selectAll(checkbox.checked);
    });

    cell.appendChild(checkbox);
    return cell;
  }

  private createHeaderCell(column: ColumnDefinition): HTMLElement {
    const cell = createElement('div', 'velox-header-cell');
    
    // Alignment
    const align = column.headerAlign || column.align || 'left';
    addClass(cell, `velox-header-cell--align-${align}`);

    // Width
    if (column.width) {
      cell.style.width = `${column.width}px`;
      cell.style.minWidth = `${column.minWidth || column.width}px`;
    } else {
      cell.style.flex = '1';
      cell.style.minWidth = `${column.minWidth || 100}px`;
    }

    // Header class
    if (column.headerClass) {
      addClass(cell, column.headerClass);
    }

    // Sortable
    if (this.options.sortable && column.sortable !== false) {
      addClass(cell, 'velox-header-cell--sortable');
      cell.addEventListener('click', () => this.handleSort(column.field));
      
      // Check if sorted
      const sortState = this.state.sort.find(s => s.field === column.field);
      if (sortState?.direction) {
        addClass(cell, 'velox-header-cell--sorted');
      }
    }

    // Header text
    const text = createElement('span', 'velox-header-text');
    text.textContent = column.header;
    cell.appendChild(text);

    // Sort icon
    if (this.options.sortable && column.sortable !== false) {
      const sortIcon = createElement('span', 'velox-sort-icon');
      const sortState = this.state.sort.find(s => s.field === column.field);
      if (sortState?.direction) {
        addClass(sortIcon, `velox-sort-icon--${sortState.direction}`);
      }
      cell.appendChild(sortIcon);
    }

    // Resize handle
    if (this.options.resizable && column.resizable !== false) {
      const handle = createElement('div', 'velox-resize-handle');
      handle.addEventListener('mousedown', (e) => this.startResize(e, column));
      cell.appendChild(handle);
    }

    return cell;
  }

  private renderBody(): void {
    this.bodyInner.innerHTML = '';

    // Empty state
    if (this.state.displayData.length === 0) {
      const emptyDiv = createElement('div', 'velox-empty');
      emptyDiv.textContent = this.options.emptyMessage || '데이터가 없습니다.';
      this.bodyInner.appendChild(emptyDiv);
      return;
    }

    // Render rows
    this.state.displayData.forEach((row, index) => {
      const rowElement = this.createRow(row, index);
      this.bodyInner.appendChild(rowElement);
    });
  }

  private createRow(rowData: RowData, rowIndex: number): HTMLElement {
    const row = createElement('div', 'velox-row');
    row.dataset.rowIndex = String(rowIndex);

    // Alternate row style
    if (rowIndex % 2 === 1) {
      addClass(row, 'velox-row--alt');
    }

    // Selected state
    if (this.state.selection.selectedRows.has(rowIndex)) {
      addClass(row, 'velox-row--selected');
    }

    // Row click event
    row.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.velox-checkbox-cell')) return;
      this.handleRowClick(rowIndex, e);
    });

    row.addEventListener('dblclick', (e) => {
      this.handleRowDoubleClick(rowIndex, e);
    });

    // Checkbox cell
    if (this.options.showCheckbox) {
      const checkboxCell = this.createCheckboxCell(rowIndex);
      row.appendChild(checkboxCell);
    }

    // Row number cell
    if (this.options.showRowNumbers) {
      const rowNumCell = createElement('div', 'velox-cell velox-rownumber-cell');
      rowNumCell.textContent = String(rowIndex + 1);
      row.appendChild(rowNumCell);
    }

    // Data cells
    this.state.columns.forEach((column) => {
      if (column.visible === false) return;
      const cell = this.createCell(rowData, rowIndex, column);
      row.appendChild(cell);
    });

    return row;
  }

  private createCheckboxCell(rowIndex: number): HTMLElement {
    const cell = createElement('div', 'velox-cell velox-checkbox-cell');
    const checkbox = createElement('input', 'velox-checkbox') as HTMLInputElement;
    checkbox.type = 'checkbox';
    checkbox.checked = this.state.selection.selectedRows.has(rowIndex);
    checkbox.setAttribute('aria-label', `Select row ${rowIndex + 1}`);

    checkbox.addEventListener('change', () => {
      this.selectRow(rowIndex, checkbox.checked);
    });

    cell.appendChild(checkbox);
    return cell;
  }

  private createCell(rowData: RowData, rowIndex: number, column: ColumnDefinition): HTMLElement {
    const cell = createElement('div', 'velox-cell');
    cell.dataset.field = column.field;

    // Alignment
    const align = column.align || 'left';
    addClass(cell, `velox-cell--align-${align}`);

    // Width (match header)
    if (column.width) {
      cell.style.width = `${column.width}px`;
      cell.style.minWidth = `${column.minWidth || column.width}px`;
    } else {
      cell.style.flex = '1';
      cell.style.minWidth = `${column.minWidth || 100}px`;
    }

    // Cell class
    if (column.cellClass) {
      const className = typeof column.cellClass === 'function'
        ? column.cellClass(rowData[column.field], rowData)
        : column.cellClass;
      if (className) addClass(cell, className);
    }

    // Editable
    if (this.options.editable && column.editable !== false) {
      addClass(cell, 'velox-cell--editable');
      cell.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.startEdit(rowIndex, column.field);
      });
    }

    // Cell content
    const value = rowData[column.field];
    const content = createElement('span', 'velox-cell-content');

    if (column.renderer) {
      content.innerHTML = column.renderer(value, rowData, column);
    } else if (column.formatter) {
      content.textContent = column.formatter(value, rowData, column);
    } else {
      content.textContent = formatValue(value, column.type);
    }

    cell.appendChild(content);

    // Cell click event
    cell.addEventListener('click', () => {
      this.events.onCellClick?.(rowIndex, column.field, value);
    });

    return cell;
  }

  // ============================================
  // Event Handlers
  // ============================================

  private attachEvents(): void {
    // Scroll event
    this.bodyElement.addEventListener('scroll', throttle(() => {
      this.state.scroll.top = this.bodyElement.scrollTop;
      this.state.scroll.left = this.bodyElement.scrollLeft;
      this.events.onScroll?.(this.state.scroll.top, this.state.scroll.left);
    }, 16));

    // Global mouse events for resize
    document.addEventListener('mousemove', this.handleResizeMove.bind(this));
    document.addEventListener('mouseup', this.handleResizeEnd.bind(this));

    // Keyboard events
    this.rootElement.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleSort(field: string): void {
    const existingIndex = this.state.sort.findIndex(s => s.field === field);
    let newDirection: SortDirection = 'asc';

    if (existingIndex >= 0) {
      const current = this.state.sort[existingIndex].direction;
      if (current === 'asc') newDirection = 'desc';
      else if (current === 'desc') newDirection = null;
    }

    // Single column sort (can be extended to multi-column)
    if (newDirection) {
      this.state.sort = [{ field, direction: newDirection }];
    } else {
      this.state.sort = [];
    }

    this.applyDataTransformations();
    this.render();
    this.events.onSort?.(this.state.sort);
  }

  private handleRowClick(rowIndex: number, e: MouseEvent): void {
    if (this.options.selectable) {
      if (this.options.selectionMode === 'multiple' && e.ctrlKey) {
        // Toggle selection
        this.selectRow(rowIndex, !this.state.selection.selectedRows.has(rowIndex));
      } else if (this.options.selectionMode === 'multiple' && e.shiftKey) {
        // Range selection (simplified)
        this.selectRow(rowIndex, true);
      } else {
        // Single selection
        this.clearSelection();
        this.selectRow(rowIndex, true);
      }
    }
    this.events.onRowClick?.(rowIndex, this.state.displayData[rowIndex]);
  }

  private handleRowDoubleClick(rowIndex: number, _e: MouseEvent): void {
    this.events.onRowDoubleClick?.(rowIndex, this.state.displayData[rowIndex]);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.state.edit.editing) {
      if (e.key === 'Escape') {
        this.cancelEdit();
      } else if (e.key === 'Enter') {
        this.endEdit(true);
      }
    }
  }

  // ============================================
  // Resize Methods
  // ============================================

  private startResize(e: MouseEvent, column: ColumnDefinition): void {
    e.preventDefault();
    e.stopPropagation();
    
    this.resizing = {
      field: column.field,
      startX: e.clientX,
      startWidth: column.width || 100,
    };

    addClass(document.body, 'velox-no-select');
  }

  private handleResizeMove(e: MouseEvent): void {
    if (!this.resizing) return;

    const diff = e.clientX - this.resizing.startX;
    const newWidth = Math.max(50, this.resizing.startWidth + diff);

    const column = this.state.columns.find(c => c.field === this.resizing!.field);
    if (column) {
      column.width = newWidth;
      this.render();
    }
  }

  private handleResizeEnd(): void {
    if (this.resizing) {
      const column = this.state.columns.find(c => c.field === this.resizing!.field);
      if (column) {
        this.events.onColumnResize?.(this.resizing.field, column.width || 100);
      }
      this.resizing = null;
      removeClass(document.body, 'velox-no-select');
    }
  }

  // ============================================
  // Data Transformation
  // ============================================

  private applyDataTransformations(): void {
    let data = [...this.state.data];

    // Apply filter
    if (this.state.filter) {
      data = filterData(data, this.state.filter);
    }

    // Apply sort
    if (this.state.sort.length > 0) {
      const columnTypes: Record<string, ValueType> = {};
      this.state.columns.forEach(col => {
        columnTypes[col.field] = col.type || 'text';
      });
      data = sortData(data, this.state.sort, columnTypes);
    }

    this.state.displayData = data;
  }

  // ============================================
  // Public API - Data Methods
  // ============================================

  getData(): RowData[] {
    return deepClone(this.state.data);
  }

  setData(data: RowData[]): void {
    this.state.data = deepClone(data);
    this.state.selection.selectedRows.clear();
    this.applyDataTransformations();
    this.render();
    this.events.onDataChange?.(this.state.data);
  }

  getRow(index: number): RowData | null {
    return this.state.data[index] ? deepClone(this.state.data[index]) : null;
  }

  addRow(row: RowData, index?: number): void {
    const insertIndex = index ?? this.state.data.length;
    this.state.data.splice(insertIndex, 0, deepClone(row));
    this.applyDataTransformations();
    this.render();
    this.events.onRowAdd?.(row, insertIndex);
    this.events.onDataChange?.(this.state.data);
  }

  updateRow(index: number, data: Partial<RowData>): void {
    if (this.state.data[index]) {
      const oldRow = this.state.data[index];
      this.state.data[index] = { ...oldRow, ...data };
      this.applyDataTransformations();
      this.render();
      this.events.onRowUpdate?.(this.state.data[index], index, data);
      this.events.onDataChange?.(this.state.data);
    }
  }

  removeRow(index: number): void {
    if (this.state.data[index]) {
      const removed = this.state.data.splice(index, 1)[0];
      this.state.selection.selectedRows.delete(index);
      this.applyDataTransformations();
      this.render();
      this.events.onRowRemove?.(removed, index);
      this.events.onDataChange?.(this.state.data);
    }
  }

  clearData(): void {
    this.state.data = [];
    this.state.displayData = [];
    this.state.selection.selectedRows.clear();
    this.render();
    this.events.onDataChange?.([]);
  }

  // ============================================
  // Public API - Selection Methods
  // ============================================

  getSelectedRows(): number[] {
    return Array.from(this.state.selection.selectedRows);
  }

  getSelectedData(): RowData[] {
    return this.getSelectedRows().map(i => deepClone(this.state.displayData[i]));
  }

  selectRow(index: number, selected = true): void {
    if (selected) {
      if (this.options.selectionMode === 'single') {
        this.state.selection.selectedRows.clear();
      }
      this.state.selection.selectedRows.add(index);
    } else {
      this.state.selection.selectedRows.delete(index);
    }
    this.render();
    this.events.onRowSelect?.(index, selected);
    this.events.onSelectionChange?.(this.getSelectedRows());
  }

  selectAll(selected = true): void {
    if (selected) {
      this.state.displayData.forEach((_, i) => {
        this.state.selection.selectedRows.add(i);
      });
    } else {
      this.state.selection.selectedRows.clear();
    }
    this.render();
    this.events.onAllSelect?.(selected);
    this.events.onSelectionChange?.(this.getSelectedRows());
  }

  clearSelection(): void {
    this.state.selection.selectedRows.clear();
    this.render();
    this.events.onSelectionChange?.([]);
  }

  isRowSelected(index: number): boolean {
    return this.state.selection.selectedRows.has(index);
  }

  // Check methods (alias)
  checkRow(index: number, checked = true): void {
    this.selectRow(index, checked);
  }

  checkAll(checked = true): void {
    this.selectAll(checked);
  }

  getCheckedRows(): number[] {
    return this.getSelectedRows();
  }

  getCheckedData(): RowData[] {
    return this.getSelectedData();
  }

  // ============================================
  // Public API - Sort Methods
  // ============================================

  sort(field: string, direction: SortDirection = 'asc'): void {
    if (direction) {
      this.state.sort = [{ field, direction }];
    } else {
      this.state.sort = [];
    }
    this.applyDataTransformations();
    this.render();
    this.events.onSort?.(this.state.sort);
  }

  clearSort(): void {
    this.state.sort = [];
    this.applyDataTransformations();
    this.render();
    this.events.onSort?.([]);
  }

  getSortState(): SortState[] {
    return [...this.state.sort];
  }

  // ============================================
  // Public API - Filter Methods
  // ============================================

  filter(conditions: FilterCondition | FilterCondition[]): void {
    const conditionArray = Array.isArray(conditions) ? conditions : [conditions];
    this.state.filter = {
      conditions: conditionArray,
      logic: 'and',
    };
    this.applyDataTransformations();
    this.render();
    this.events.onFilter?.(this.state.filter);
  }

  clearFilter(): void {
    this.state.filter = null;
    this.applyDataTransformations();
    this.render();
    this.events.onFilter?.(this.state.filter!);
  }

  getFilterState(): FilterState | null {
    return this.state.filter ? { ...this.state.filter } : null;
  }

  // ============================================
  // Public API - Edit Methods
  // ============================================

  startEdit(rowIndex: number, field: string): void {
    if (!this.options.editable) return;

    const column = this.state.columns.find(c => c.field === field);
    if (!column || column.editable === false) return;

    // End any current edit
    if (this.state.edit.editing) {
      this.endEdit(true);
    }

    const value = this.state.displayData[rowIndex]?.[field];
    this.state.edit = {
      editing: true,
      rowIndex,
      field,
      originalValue: value,
    };

    this.events.onCellEditStart?.(rowIndex, field, value);
    this.renderEditCell(rowIndex, field, value);
  }

  private renderEditCell(rowIndex: number, field: string, value: CellValue): void {
    const row = this.bodyInner.querySelector(`[data-row-index="${rowIndex}"]`);
    const cell = row?.querySelector(`[data-field="${field}"]`);
    if (!cell) return;

    const column = this.state.columns.find(c => c.field === field);
    addClass(cell as HTMLElement, 'velox-cell--editing');

    const input = createElement('input', 'velox-edit-input') as HTMLInputElement;
    input.type = column?.type === 'number' ? 'number' : 'text';
    input.value = value != null ? String(value) : '';
    
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();

    input.addEventListener('blur', () => {
      this.endEdit(true);
    });
  }

  endEdit(save = true): void {
    if (!this.state.edit.editing) return;

    const { rowIndex, field, originalValue } = this.state.edit;
    if (rowIndex === null || field === null) return;

    const row = this.bodyInner.querySelector(`[data-row-index="${rowIndex}"]`);
    const cell = row?.querySelector(`[data-field="${field}"]`);
    const input = cell?.querySelector('.velox-edit-input') as HTMLInputElement;

    if (save && input) {
      const newValue = input.value;
      if (newValue !== String(originalValue ?? '')) {
        // Update data
        const column = this.state.columns.find(c => c.field === field);
        const dataIndex = this.state.data.indexOf(this.state.displayData[rowIndex]);
        if (dataIndex >= 0) {
          this.state.data[dataIndex][field] = column?.type === 'number' 
            ? parseFloat(newValue) 
            : newValue;
        }

        this.events.onCellEditEnd?.({
          rowIndex,
          field,
          oldValue: originalValue,
          newValue,
          row: this.state.displayData[rowIndex],
        });
      }
    } else {
      this.events.onCellEditCancel?.(rowIndex, field);
    }

    this.state.edit = {
      editing: false,
      rowIndex: null,
      field: null,
      originalValue: null,
    };

    this.applyDataTransformations();
    this.render();
  }

  cancelEdit(): void {
    this.endEdit(false);
  }

  isEditing(): boolean {
    return this.state.edit.editing;
  }

  // ============================================
  // Public API - Column Methods
  // ============================================

  getColumn(field: string): ColumnDefinition | null {
    return this.state.columns.find(c => c.field === field) || null;
  }

  setColumnWidth(field: string, width: number): void {
    const column = this.state.columns.find(c => c.field === field);
    if (column) {
      column.width = width;
      this.render();
      this.events.onColumnResize?.(field, width);
    }
  }

  showColumn(field: string): void {
    const column = this.state.columns.find(c => c.field === field);
    if (column) {
      column.visible = true;
      this.render();
    }
  }

  hideColumn(field: string): void {
    const column = this.state.columns.find(c => c.field === field);
    if (column) {
      column.visible = false;
      this.render();
    }
  }

  setColumns(columns: ColumnDefinition[]): void {
    this.state.columns = columns.map(col => ({ ...col }));
    this.render();
  }

  // ============================================
  // Public API - Scroll Methods
  // ============================================

  scrollToRow(index: number): void {
    const rowHeight = this.options.rowHeight || 40;
    this.bodyElement.scrollTop = index * rowHeight;
  }

  scrollToTop(): void {
    this.bodyElement.scrollTop = 0;
  }

  scrollToBottom(): void {
    this.bodyElement.scrollTop = this.bodyElement.scrollHeight;
  }

  // ============================================
  // Public API - Utility Methods
  // ============================================

  getRowCount(): number {
    return this.state.data.length;
  }

  getVisibleRowCount(): number {
    return this.state.displayData.length;
  }

  getCellValue(rowIndex: number, field: string): CellValue {
    return this.state.displayData[rowIndex]?.[field];
  }

  setCellValue(rowIndex: number, field: string, value: CellValue): void {
    const dataIndex = this.state.data.indexOf(this.state.displayData[rowIndex]);
    if (dataIndex >= 0) {
      this.state.data[dataIndex][field] = value;
      this.applyDataTransformations();
      this.render();
      this.events.onDataChange?.(this.state.data);
    }
  }

  setOptions(options: Partial<GridOptions>): void {
    this.options = { ...this.options, ...options };
    if (options.columns) {
      this.state.columns = options.columns.map(col => ({ ...col }));
    }
    this.render();
  }

  getOptions(): GridOptions {
    return { ...this.options };
  }

  // ============================================
  // Lifecycle Methods
  // ============================================

  refresh(): void {
    this.applyDataTransformations();
    this.render();
  }

  destroy(): void {
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleResizeMove.bind(this));
    document.removeEventListener('mouseup', this.handleResizeEnd.bind(this));

    // Clear DOM
    this.container.innerHTML = '';

    // Fire destroy event
    this.events.onDestroy?.();
  }
}
