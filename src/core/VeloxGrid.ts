/**
 * VeloxGrid - Core Grid Class v2.2
 * Fixed: Row add/remove, Selection, Data reference
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
  FilterOperator,
} from '../types';
import { createElement, addClass, removeClass, throttle } from '../utils/dom';
import { formatValue, sortData, filterData, generateId } from '../utils/data';

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
  private container: HTMLElement;
  private options: GridOptions;
  private state: GridState;
  private events: GridEvents;
  private gridId: string;

  private rootElement!: HTMLElement;
  private headerElement!: HTMLElement;
  private bodyElement!: HTMLElement;
  private bodyInner!: HTMLElement;
  private filterPopup: HTMLElement | null = null;

  private fixedLeftContainer: HTMLElement | null = null;
  private fixedLeftHeader: HTMLElement | null = null;
  private fixedLeftBody: HTMLElement | null = null;
  private fixedLeftBodyInner: HTMLElement | null = null;

  private resizing: { field: string; startX: number; startWidth: number } | null = null;

  private virtualState = {
    startIndex: 0,
    endIndex: 0,
    visibleCount: 0,
    totalHeight: 0,
  };

  // 원본 데이터 인덱스를 추적하기 위한 맵
  private dataIndexMap: Map<RowData, number> = new Map();

  constructor(
    container: HTMLElement | string,
    options: GridOptions,
    events: GridEvents = {}
  ) {
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      if (!el) throw new Error(`Container not found: ${container}`);
      this.container = el as HTMLElement;
    } else {
      this.container = container;
    }

    this.options = { ...DEFAULT_OPTIONS, ...options } as GridOptions;
    this.events = events;
    this.gridId = generateId('velox-grid');

    this.state = {
      data: [],
      displayData: [],
      columns: this.options.columns.map(col => ({ ...col })),
      selection: {
        selectedRows: new Set<number>(),
        selectedCells: new Set<string>(),
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

    if (this.options.data) {
      this.state.data = this.options.data.map(row => ({ ...row }));
      this.rebuildDataIndexMap();
      this.state.displayData = [...this.state.data];
    }

    this.build();
    this.render();
    this.attachEvents();
    this.events.onReady?.(this);
  }

  // 데이터 인덱스 맵 재구성
  private rebuildDataIndexMap(): void {
    this.dataIndexMap.clear();
    this.state.data.forEach((row, index) => {
      this.dataIndexMap.set(row, index);
    });
  }

  private getFixedLeftColumns(): ColumnDefinition[] {
    return this.state.columns.filter(col => col.fixed === 'left' && col.visible !== false);
  }

  private getScrollableColumns(): ColumnDefinition[] {
    return this.state.columns.filter(col => col.fixed !== 'left' && col.visible !== false);
  }

  private hasFixedLeft(): boolean {
    return this.getFixedLeftColumns().length > 0 || 
           this.options.showCheckbox === true || 
           this.options.showRowNumbers === true;
  }

  private build(): void {
    this.rootElement = createElement('div', 'velox-grid');
    this.rootElement.id = this.gridId;
    
    if (this.options.className) addClass(this.rootElement, this.options.className);

    if (this.options.width) {
      this.rootElement.style.width = typeof this.options.width === 'number' 
        ? `${this.options.width}px` : this.options.width;
    }
    if (this.options.height) {
      this.rootElement.style.height = typeof this.options.height === 'number'
        ? `${this.options.height}px` : this.options.height;
    }

    const wrapper = createElement('div', 'velox-wrapper');

    if (this.hasFixedLeft()) {
      this.fixedLeftContainer = createElement('div', 'velox-fixed-left');
      this.fixedLeftHeader = createElement('div', 'velox-header velox-header--fixed');
      this.fixedLeftBody = createElement('div', 'velox-body velox-body--fixed');
      this.fixedLeftBodyInner = createElement('div', 'velox-body-inner');
      this.fixedLeftBody.appendChild(this.fixedLeftBodyInner);
      this.fixedLeftContainer.appendChild(this.fixedLeftHeader);
      this.fixedLeftContainer.appendChild(this.fixedLeftBody);
      wrapper.appendChild(this.fixedLeftContainer);
    }

    const mainSection = createElement('div', 'velox-main');
    this.headerElement = createElement('div', 'velox-header');
    this.bodyElement = createElement('div', 'velox-body');
    this.bodyInner = createElement('div', 'velox-body-inner');
    this.bodyElement.appendChild(this.bodyInner);
    mainSection.appendChild(this.headerElement);
    mainSection.appendChild(this.bodyElement);
    wrapper.appendChild(mainSection);

    this.rootElement.appendChild(wrapper);
    this.container.innerHTML = '';
    this.container.appendChild(this.rootElement);
  }

  private calculateVirtualState(): void {
    if (!this.options.virtualScroll) return;

    const rowHeight = this.options.rowHeight || 40;
    const containerHeight = this.bodyElement.clientHeight;
    const scrollTop = this.bodyElement.scrollTop;
    const bufferSize = this.options.bufferSize || 5;

    this.virtualState.visibleCount = Math.ceil(containerHeight / rowHeight);
    this.virtualState.startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferSize);
    this.virtualState.endIndex = Math.min(
      this.state.displayData.length,
      this.virtualState.startIndex + this.virtualState.visibleCount + bufferSize * 2
    );
    this.virtualState.totalHeight = this.state.displayData.length * rowHeight;
  }

  private getVisibleRows(): { data: RowData; index: number }[] {
    if (!this.options.virtualScroll) {
      return this.state.displayData.map((data, index) => ({ data, index }));
    }
    this.calculateVirtualState();
    const rows: { data: RowData; index: number }[] = [];
    for (let i = this.virtualState.startIndex; i < this.virtualState.endIndex; i++) {
      if (this.state.displayData[i]) rows.push({ data: this.state.displayData[i], index: i });
    }
    return rows;
  }

  private render(): void {
    this.renderHeader();
    this.renderBody();
  }

  private renderHeader(): void {
    if (this.fixedLeftHeader) {
      this.fixedLeftHeader.innerHTML = '';
      const headerRow = createElement('div', 'velox-header-row');
      if (this.options.showCheckbox) headerRow.appendChild(this.createHeaderCheckboxCell());
      if (this.options.showRowNumbers) {
        const rowNumCell = createElement('div', 'velox-header-cell velox-rownumber-cell');
        rowNumCell.textContent = '#';
        headerRow.appendChild(rowNumCell);
      }
      this.getFixedLeftColumns().forEach(col => headerRow.appendChild(this.createHeaderCell(col)));
      this.fixedLeftHeader.appendChild(headerRow);
    }

    const headerRow = createElement('div', 'velox-header-row');
    this.getScrollableColumns().forEach(col => headerRow.appendChild(this.createHeaderCell(col)));
    this.headerElement.innerHTML = '';
    this.headerElement.appendChild(headerRow);
  }

  private createHeaderCheckboxCell(): HTMLElement {
    const cell = createElement('div', 'velox-header-cell velox-checkbox-cell');
    const checkbox = createElement('input', 'velox-checkbox') as HTMLInputElement;
    checkbox.type = 'checkbox';
    
    const allSelected = this.state.displayData.length > 0 &&
      this.state.selection.selectedRows.size === this.state.displayData.length;
    const someSelected = this.state.selection.selectedRows.size > 0 && !allSelected;
    
    checkbox.checked = allSelected;
    checkbox.indeterminate = someSelected;
    checkbox.addEventListener('change', () => this.selectAll(checkbox.checked));
    cell.appendChild(checkbox);
    return cell;
  }

  private createHeaderCell(column: ColumnDefinition): HTMLElement {
    const cell = createElement('div', 'velox-header-cell');
    cell.dataset.field = column.field;
    
    const align = column.headerAlign || column.align || 'left';
    addClass(cell, `velox-header-cell--align-${align}`);

    if (column.width) {
      cell.style.width = `${column.width}px`;
      cell.style.minWidth = `${column.minWidth || column.width}px`;
    } else {
      cell.style.flex = '1';
      cell.style.minWidth = `${column.minWidth || 100}px`;
    }

    if (column.headerClass) addClass(cell, column.headerClass);
    if (this.options.sortable && column.sortable !== false) {
      addClass(cell, 'velox-header-cell--sortable');
      const sortState = this.state.sort.find(s => s.field === column.field);
      if (sortState?.direction) addClass(cell, 'velox-header-cell--sorted');
    }

    const contentWrapper = createElement('div', 'velox-header-content');
    const text = createElement('span', 'velox-header-text');
    text.textContent = column.header;
    contentWrapper.appendChild(text);

    if (this.options.sortable && column.sortable !== false) {
      const sortIcon = createElement('span', 'velox-sort-icon');
      const sortState = this.state.sort.find(s => s.field === column.field);
      if (sortState?.direction) addClass(sortIcon, `velox-sort-icon--${sortState.direction}`);
      contentWrapper.appendChild(sortIcon);
      contentWrapper.addEventListener('click', (e) => { e.stopPropagation(); this.handleSort(column.field); });
    }

    cell.appendChild(contentWrapper);

    if (this.options.filterable && column.filterable !== false) {
      const filterBtn = createElement('button', 'velox-filter-btn');
      filterBtn.innerHTML = '▼';
      const hasFilter = this.state.filter?.conditions.some(c => c.field === column.field);
      if (hasFilter) addClass(filterBtn, 'velox-filter-btn--active');
      filterBtn.addEventListener('click', (e) => { e.stopPropagation(); this.showFilterPopup(column, filterBtn); });
      cell.appendChild(filterBtn);
    }

    if (this.options.resizable && column.resizable !== false) {
      const handle = createElement('div', 'velox-resize-handle');
      handle.addEventListener('mousedown', (e) => this.startResize(e, column));
      cell.appendChild(handle);
    }

    return cell;
  }

  private renderBody(): void {
    const visibleRows = this.getVisibleRows();
    const rowHeight = this.options.rowHeight || 40;

    if (this.fixedLeftBodyInner) {
      this.fixedLeftBodyInner.innerHTML = '';
      if (this.options.virtualScroll) {
        this.fixedLeftBodyInner.style.height = `${this.virtualState.totalHeight}px`;
        this.fixedLeftBodyInner.style.position = 'relative';
      } else {
        this.fixedLeftBodyInner.style.height = '';
        this.fixedLeftBodyInner.style.position = '';
      }

      visibleRows.forEach(({ data, index }) => {
        const row = this.createFixedLeftRow(data, index);
        if (this.options.virtualScroll) {
          row.style.position = 'absolute';
          row.style.top = `${index * rowHeight}px`;
          row.style.left = '0';
          row.style.right = '0';
        }
        this.fixedLeftBodyInner!.appendChild(row);
      });
    }

    this.bodyInner.innerHTML = '';
    if (this.options.virtualScroll) {
      this.bodyInner.style.height = `${this.virtualState.totalHeight}px`;
      this.bodyInner.style.position = 'relative';
    } else {
      this.bodyInner.style.height = '';
      this.bodyInner.style.position = '';
    }

    if (visibleRows.length === 0) {
      const emptyDiv = createElement('div', 'velox-empty');
      emptyDiv.textContent = this.options.emptyMessage || '데이터가 없습니다.';
      this.bodyInner.appendChild(emptyDiv);
      return;
    }

    visibleRows.forEach(({ data, index }) => {
      const row = this.createRow(data, index);
      if (this.options.virtualScroll) {
        row.style.position = 'absolute';
        row.style.top = `${index * rowHeight}px`;
        row.style.left = '0';
        row.style.right = '0';
      }
      this.bodyInner.appendChild(row);
    });
  }

  private createFixedLeftRow(rowData: RowData, rowIndex: number): HTMLElement {
    const row = createElement('div', 'velox-row');
    row.dataset.rowIndex = String(rowIndex);

    if (rowIndex % 2 === 1) addClass(row, 'velox-row--alt');
    if (this.state.selection.selectedRows.has(rowIndex)) addClass(row, 'velox-row--selected');

    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('velox-checkbox')) return;
      this.handleRowClick(rowIndex, e);
    });

    if (this.options.showCheckbox) row.appendChild(this.createCheckboxCell(rowIndex));
    if (this.options.showRowNumbers) {
      const rowNumCell = createElement('div', 'velox-cell velox-rownumber-cell');
      rowNumCell.textContent = String(rowIndex + 1);
      row.appendChild(rowNumCell);
    }
    this.getFixedLeftColumns().forEach(col => row.appendChild(this.createCell(rowData, rowIndex, col)));

    return row;
  }

  private createRow(rowData: RowData, rowIndex: number): HTMLElement {
    const row = createElement('div', 'velox-row');
    row.dataset.rowIndex = String(rowIndex);

    if (rowIndex % 2 === 1) addClass(row, 'velox-row--alt');
    if (this.state.selection.selectedRows.has(rowIndex)) addClass(row, 'velox-row--selected');

    row.addEventListener('click', (e) => this.handleRowClick(rowIndex, e));
    row.addEventListener('dblclick', (e) => this.handleRowDoubleClick(rowIndex, e));

    this.getScrollableColumns().forEach(col => row.appendChild(this.createCell(rowData, rowIndex, col)));
    return row;
  }

  private createCheckboxCell(rowIndex: number): HTMLElement {
    const cell = createElement('div', 'velox-cell velox-checkbox-cell');
    const checkbox = createElement('input', 'velox-checkbox') as HTMLInputElement;
    checkbox.type = 'checkbox';
    checkbox.checked = this.state.selection.selectedRows.has(rowIndex);
    checkbox.addEventListener('click', (e) => e.stopPropagation());
    checkbox.addEventListener('change', () => this.selectRow(rowIndex, checkbox.checked));
    cell.appendChild(checkbox);
    return cell;
  }

  private createCell(rowData: RowData, rowIndex: number, column: ColumnDefinition): HTMLElement {
    const cell = createElement('div', 'velox-cell');
    cell.dataset.field = column.field;

    const align = column.align || 'left';
    addClass(cell, `velox-cell--align-${align}`);

    if (column.width) {
      cell.style.width = `${column.width}px`;
      cell.style.minWidth = `${column.minWidth || column.width}px`;
    } else {
      cell.style.flex = '1';
      cell.style.minWidth = `${column.minWidth || 100}px`;
    }

    if (column.cellClass) {
      const className = typeof column.cellClass === 'function'
        ? column.cellClass(rowData[column.field], rowData) : column.cellClass;
      if (className) addClass(cell, className);
    }

    if (this.options.editable && column.editable !== false) {
      addClass(cell, 'velox-cell--editable');
      cell.addEventListener('dblclick', (e) => { e.stopPropagation(); this.startEdit(rowIndex, column.field); });
    }

    const value = rowData[column.field];
    const content = createElement('span', 'velox-cell-content');

    if (column.renderer) content.innerHTML = column.renderer(value, rowData, column);
    else if (column.formatter) content.textContent = column.formatter(value, rowData, column);
    else content.textContent = formatValue(value, column.type);

    cell.appendChild(content);
    cell.addEventListener('click', () => this.events.onCellClick?.(rowIndex, column.field, value));

    return cell;
  }

  private showFilterPopup(column: ColumnDefinition, anchor: HTMLElement): void {
    this.closeFilterPopup();

    const popup = createElement('div', 'velox-filter-popup');
    const rect = anchor.getBoundingClientRect();
    const gridRect = this.rootElement.getBoundingClientRect();

    popup.style.top = `${rect.bottom - gridRect.top + 5}px`;
    popup.style.left = `${Math.max(0, rect.left - gridRect.left - 100)}px`;

    const uniqueValues = [...new Set(this.state.data.map(row => row[column.field]))]
      .filter(v => v !== null && v !== undefined).sort();

    const currentFilter = this.state.filter?.conditions.find(c => c.field === column.field);

    const operatorSelect = createElement('select', 'velox-filter-operator') as HTMLSelectElement;
    const operators: { value: FilterOperator; label: string }[] = [
      { value: 'contains', label: '포함' }, { value: 'equals', label: '같음' },
      { value: 'notEquals', label: '같지 않음' }, { value: 'startsWith', label: '시작' },
      { value: 'endsWith', label: '끝' }, { value: 'greaterThan', label: '>' },
      { value: 'lessThan', label: '<' }, { value: 'greaterThanOrEqual', label: '>=' },
      { value: 'lessThanOrEqual', label: '<=' }, { value: 'isEmpty', label: '비어있음' },
      { value: 'isNotEmpty', label: '비어있지 않음' },
    ];

    operators.forEach(op => {
      const option = createElement('option') as HTMLOptionElement;
      option.value = op.value;
      option.textContent = op.label;
      if (currentFilter?.operator === op.value) option.selected = true;
      operatorSelect.appendChild(option);
    });
    popup.appendChild(operatorSelect);

    const valueInput = createElement('input', 'velox-filter-input') as HTMLInputElement;
    valueInput.type = column.type === 'number' ? 'number' : 'text';
    valueInput.placeholder = '값 입력...';
    if (currentFilter?.value !== undefined) valueInput.value = String(currentFilter.value);
    popup.appendChild(valueInput);

    if (uniqueValues.length > 0 && uniqueValues.length <= 15) {
      const listContainer = createElement('div', 'velox-filter-list');
      const listLabel = createElement('div', 'velox-filter-list-label');
      listLabel.textContent = '빠른 선택:';
      listContainer.appendChild(listLabel);

      uniqueValues.slice(0, 10).forEach(value => {
        const item = createElement('div', 'velox-filter-list-item');
        item.textContent = formatValue(value, column.type);
        item.addEventListener('click', () => { this.applyColumnFilter(column.field, 'equals', value); this.closeFilterPopup(); });
        listContainer.appendChild(item);
      });
      popup.appendChild(listContainer);
    }

    const btnContainer = createElement('div', 'velox-filter-buttons');
    const applyBtn = createElement('button', 'velox-filter-apply');
    applyBtn.textContent = '적용';
    applyBtn.addEventListener('click', () => {
      const operator = operatorSelect.value as FilterOperator;
      const value = column.type === 'number' ? parseFloat(valueInput.value) : valueInput.value;
      this.applyColumnFilter(column.field, operator, value);
      this.closeFilterPopup();
    });
    btnContainer.appendChild(applyBtn);

    const clearBtn = createElement('button', 'velox-filter-clear');
    clearBtn.textContent = '해제';
    clearBtn.addEventListener('click', () => { this.removeColumnFilter(column.field); this.closeFilterPopup(); });
    btnContainer.appendChild(clearBtn);

    popup.appendChild(btnContainer);
    this.filterPopup = popup;
    this.rootElement.appendChild(popup);

    setTimeout(() => document.addEventListener('click', this.handleOutsideClick), 0);
    valueInput.focus();
  }

  private handleOutsideClick = (e: MouseEvent): void => {
    if (this.filterPopup && !this.filterPopup.contains(e.target as Node)) this.closeFilterPopup();
  };

  private closeFilterPopup(): void {
    if (this.filterPopup) {
      this.filterPopup.remove();
      this.filterPopup = null;
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  private applyColumnFilter(field: string, operator: FilterOperator, value: CellValue): void {
    const newCondition: FilterCondition = { field, operator, value };
    if (this.state.filter) {
      const conditions = this.state.filter.conditions.filter(c => c.field !== field);
      conditions.push(newCondition);
      this.state.filter = { conditions, logic: 'and' };
    } else {
      this.state.filter = { conditions: [newCondition], logic: 'and' };
    }
    this.state.selection.selectedRows.clear();
    this.applyDataTransformations();
    this.render();
    this.events.onFilter?.(this.state.filter);
  }

  private removeColumnFilter(field: string): void {
    if (this.state.filter) {
      const conditions = this.state.filter.conditions.filter(c => c.field !== field);
      this.state.filter = conditions.length === 0 ? null : { conditions, logic: 'and' };
      this.state.selection.selectedRows.clear();
      this.applyDataTransformations();
      this.render();
      if (this.state.filter) this.events.onFilter?.(this.state.filter);
    }
  }

  private attachEvents(): void {
    const handleScroll = throttle(() => {
      const scrollTop = this.bodyElement.scrollTop;
      this.state.scroll.top = scrollTop;
      this.state.scroll.left = this.bodyElement.scrollLeft;
      if (this.fixedLeftBody) this.fixedLeftBody.scrollTop = scrollTop;
      if (this.options.virtualScroll) this.renderBody();
      this.events.onScroll?.(this.state.scroll.top, this.state.scroll.left);
    }, 16);

    this.bodyElement.addEventListener('scroll', handleScroll);
    document.addEventListener('mousemove', this.handleResizeMove.bind(this));
    document.addEventListener('mouseup', this.handleResizeEnd.bind(this));
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
    this.state.sort = newDirection ? [{ field, direction: newDirection }] : [];
    this.state.selection.selectedRows.clear();
    this.applyDataTransformations();
    this.render();
    this.events.onSort?.(this.state.sort);
  }

  private handleRowClick(rowIndex: number, e: MouseEvent): void {
    if (!this.options.selectable) return;

    if (this.options.selectionMode === 'multiple' && (e.ctrlKey || e.metaKey)) {
      const isSelected = this.state.selection.selectedRows.has(rowIndex);
      this.selectRow(rowIndex, !isSelected);
    } else if (this.options.selectionMode === 'multiple' && e.shiftKey) {
      const selectedArray = Array.from(this.state.selection.selectedRows);
      if (selectedArray.length > 0) {
        const lastSelected = selectedArray[selectedArray.length - 1];
        const start = Math.min(lastSelected, rowIndex);
        const end = Math.max(lastSelected, rowIndex);
        for (let i = start; i <= end; i++) this.state.selection.selectedRows.add(i);
        this.render();
        this.events.onSelectionChange?.(this.getSelectedRows());
      } else {
        this.selectRow(rowIndex, true);
      }
    } else {
      this.state.selection.selectedRows.clear();
      this.selectRow(rowIndex, true);
    }
    this.events.onRowClick?.(rowIndex, this.state.displayData[rowIndex]);
  }

  private handleRowDoubleClick(rowIndex: number, _e: MouseEvent): void {
    this.events.onRowDoubleClick?.(rowIndex, this.state.displayData[rowIndex]);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.state.edit.editing) {
      if (e.key === 'Escape') this.cancelEdit();
      else if (e.key === 'Enter') this.endEdit(true);
    }
  }

  private startResize(e: MouseEvent, column: ColumnDefinition): void {
    e.preventDefault();
    e.stopPropagation();
    this.resizing = { field: column.field, startX: e.clientX, startWidth: column.width || 100 };
    addClass(document.body, 'velox-no-select');
  }

  private handleResizeMove(e: MouseEvent): void {
    if (!this.resizing) return;
    const diff = e.clientX - this.resizing.startX;
    const newWidth = Math.max(50, this.resizing.startWidth + diff);
    const column = this.state.columns.find(c => c.field === this.resizing!.field);
    if (column) { column.width = newWidth; this.render(); }
  }

  private handleResizeEnd(): void {
    if (this.resizing) {
      const column = this.state.columns.find(c => c.field === this.resizing!.field);
      if (column) this.events.onColumnResize?.(this.resizing.field, column.width || 100);
      this.resizing = null;
      removeClass(document.body, 'velox-no-select');
    }
  }

  private applyDataTransformations(): void {
    let data = [...this.state.data];
    if (this.state.filter) data = filterData(data, this.state.filter);
    if (this.state.sort.length > 0) {
      const columnTypes: Record<string, ValueType> = {};
      this.state.columns.forEach(col => { columnTypes[col.field] = col.type || 'text'; });
      data = sortData(data, this.state.sort, columnTypes);
    }
    this.state.displayData = data;
  }

  // ============================================
  // Public API - Data Methods
  // ============================================

  getData(): RowData[] {
    return this.state.data.map(row => ({ ...row }));
  }
  
  setData(data: RowData[]): void {
    this.state.data = data.map(row => ({ ...row }));
    this.rebuildDataIndexMap();
    this.state.selection.selectedRows.clear();
    this.applyDataTransformations();
    this.render();
    this.events.onDataChange?.(this.state.data);
  }

  getRow(index: number): RowData | null {
    return this.state.displayData[index] ? { ...this.state.displayData[index] } : null;
  }

  getRowCount(): number {
    return this.state.data.length;
  }

  getVisibleRowCount(): number {
    return this.state.displayData.length;
  }

  addRow(row: RowData, index?: number): void {
    const newRow = { ...row };
    const insertIndex = index !== undefined ? index : this.state.data.length;
    this.state.data.splice(insertIndex, 0, newRow);
    this.rebuildDataIndexMap();
    this.applyDataTransformations();
    this.render();
    this.events.onRowAdd?.(newRow, insertIndex);
    this.events.onDataChange?.(this.state.data);
  }

  updateRow(index: number, data: Partial<RowData>): void {
    const displayRow = this.state.displayData[index];
    if (!displayRow) return;
    
    // displayData의 행이 data 배열의 어느 위치인지 찾기
    const dataIndex = this.state.data.indexOf(displayRow);
    if (dataIndex >= 0) {
      Object.assign(this.state.data[dataIndex], data);
      this.applyDataTransformations();
      this.render();
      this.events.onRowUpdate?.(this.state.data[dataIndex], index, data);
      this.events.onDataChange?.(this.state.data);
    }
  }

  removeRow(index: number): void {
    const displayRow = this.state.displayData[index];
    if (!displayRow) return;
    
    // displayData의 행이 data 배열의 어느 위치인지 찾기
    const dataIndex = this.state.data.indexOf(displayRow);
    if (dataIndex >= 0) {
      const removed = this.state.data.splice(dataIndex, 1)[0];
      this.rebuildDataIndexMap();
      
      // Selection 업데이트
      this.state.selection.selectedRows.delete(index);
      const newSelection = new Set<number>();
      this.state.selection.selectedRows.forEach(i => {
        if (i > index) newSelection.add(i - 1);
        else if (i < index) newSelection.add(i);
      });
      this.state.selection.selectedRows = newSelection;

      this.applyDataTransformations();
      this.render();
      this.events.onRowRemove?.(removed, index);
      this.events.onDataChange?.(this.state.data);
    }
  }

  clearData(): void {
    this.state.data = [];
    this.state.displayData = [];
    this.dataIndexMap.clear();
    this.state.selection.selectedRows.clear();
    this.render();
    this.events.onDataChange?.([]);
  }

  // ============================================
  // Public API - Selection Methods
  // ============================================

  getSelectedRows(): number[] {
    return Array.from(this.state.selection.selectedRows).sort((a, b) => a - b);
  }

  getSelectedData(): RowData[] {
    return this.getSelectedRows()
      .map(i => this.state.displayData[i])
      .filter(Boolean)
      .map(row => ({ ...row }));
  }

  selectRow(index: number, selected = true): void {
    if (selected) {
      if (this.options.selectionMode === 'single') this.state.selection.selectedRows.clear();
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
      for (let i = 0; i < this.state.displayData.length; i++) {
        this.state.selection.selectedRows.add(i);
      }
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

  // Checkbox aliases
  checkRow(index: number, checked = true): void { this.selectRow(index, checked); }
  checkAll(checked = true): void { this.selectAll(checked); }
  getCheckedRows(): number[] { return this.getSelectedRows(); }
  getCheckedData(): RowData[] { return this.getSelectedData(); }

  // ============================================
  // Public API - Sort Methods
  // ============================================

  sort(field: string, direction: SortDirection = 'asc'): void {
    this.state.sort = direction ? [{ field, direction }] : [];
    this.state.selection.selectedRows.clear();
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
    this.state.filter = { conditions: conditionArray, logic: 'and' };
    this.state.selection.selectedRows.clear();
    this.applyDataTransformations();
    this.render();
    this.events.onFilter?.(this.state.filter);
  }

  clearFilter(): void {
    this.state.filter = null;
    this.state.selection.selectedRows.clear();
    this.applyDataTransformations();
    this.render();
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
    if (this.state.edit.editing) this.endEdit(true);
    const value = this.state.displayData[rowIndex]?.[field];
    this.state.edit = { editing: true, rowIndex, field, originalValue: value };
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
    input.addEventListener('blur', () => this.endEdit(true));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.endEdit(true); }
      else if (e.key === 'Escape') { e.preventDefault(); this.cancelEdit(); }
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
        const column = this.state.columns.find(c => c.field === field);
        const displayRow = this.state.displayData[rowIndex];
        const dataIndex = this.state.data.indexOf(displayRow);
        if (dataIndex >= 0) {
          this.state.data[dataIndex][field] = column?.type === 'number' ? parseFloat(newValue) : newValue;
        }
        this.events.onCellEditEnd?.({
          rowIndex,
          field,
          oldValue: originalValue,
          newValue: column?.type === 'number' ? parseFloat(newValue) : newValue,
          row: this.state.displayData[rowIndex]
        });
      }
    } else {
      this.events.onCellEditCancel?.(rowIndex, field);
    }
    this.state.edit = { editing: false, rowIndex: null, field: null, originalValue: null };
    this.applyDataTransformations();
    this.render();
  }

  cancelEdit(): void { this.endEdit(false); }
  isEditing(): boolean { return this.state.edit.editing; }

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
    if (column) { column.visible = true; this.render(); }
  }

  hideColumn(field: string): void {
    const column = this.state.columns.find(c => c.field === field);
    if (column) { column.visible = false; this.render(); }
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
    if (this.fixedLeftBody) this.fixedLeftBody.scrollTop = index * rowHeight;
  }

  scrollToTop(): void {
    this.bodyElement.scrollTop = 0;
    if (this.fixedLeftBody) this.fixedLeftBody.scrollTop = 0;
  }

  scrollToBottom(): void {
    this.bodyElement.scrollTop = this.bodyElement.scrollHeight;
    if (this.fixedLeftBody) this.fixedLeftBody.scrollTop = this.fixedLeftBody.scrollHeight;
  }

  // ============================================
  // Public API - Utility Methods
  // ============================================

  getCellValue(rowIndex: number, field: string): CellValue {
    return this.state.displayData[rowIndex]?.[field];
  }

  setCellValue(rowIndex: number, field: string, value: CellValue): void {
    const displayRow = this.state.displayData[rowIndex];
    if (!displayRow) return;
    const dataIndex = this.state.data.indexOf(displayRow);
    if (dataIndex >= 0) {
      this.state.data[dataIndex][field] = value;
      this.applyDataTransformations();
      this.render();
      this.events.onDataChange?.(this.state.data);
    }
  }

  setOptions(options: Partial<GridOptions>): void {
    this.options = { ...this.options, ...options };
    if (options.columns) this.state.columns = options.columns.map(col => ({ ...col }));
    this.render();
  }

  getOptions(): GridOptions { return { ...this.options }; }

  refresh(): void {
    this.applyDataTransformations();
    this.render();
  }

  destroy(): void {
    document.removeEventListener('mousemove', this.handleResizeMove.bind(this));
    document.removeEventListener('mouseup', this.handleResizeEnd.bind(this));
    document.removeEventListener('click', this.handleOutsideClick);
    this.container.innerHTML = '';
    this.events.onDestroy?.();
  }
}
