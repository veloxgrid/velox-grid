/**
 * VeloxGrid - Core Grid Class v5.0
 * 
 * Phase 7: Selection Enhancement
 * Phase 8: Excel Export/Import
 * Phase 9: Keyboard & Undo/Redo
 * Phase 10: Column Reorder & Column Menu
 * Phase 11: Row Drag & Drop
 * 
 * Refactored with:
 * - GridHistory for Undo/Redo management
 * - Column caching for performance
 * - Unified row creation (createRowBase)
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
  CellIndex,
  Selection,
  CheckBarOptions,
  ExportOptions,
  UndoAction,
  CellEditUndoData,
  BulkEditUndoData,
  RowAddUndoData,
  RowRemoveUndoData,
  ContextMenuItem,
  ContextMenuContext,
} from '../types';
import { createElement, addClass, removeClass, throttle } from '../utils/dom';
import { formatValue, sortData, filterData, generateId } from '../utils/data';
import {
  exportToExcel as exportToExcelUtil,
  exportToCSV as exportToCSVUtil,
  exportToJSON as exportToJSONUtil,
  downloadCSV,
  downloadJSON,
  parseCSV,
  importFromExcel,
  isSheetJSAvailable,
  type ExportContext,
  type ImportResult,
} from '../utils/export';
import { GridHistory } from './GridHistory';
import { GridValidator } from './GridValidator';
import { GridEditorFactory } from './GridEditorFactory';
import { GridTooltip } from './GridTooltip';

const DEFAULT_OPTIONS: Partial<GridOptions> = {
  rowHeight: 40,
  headerHeight: 44,
  showRowNumbers: false,
  selectable: true,
  selectionMode: 'multiple',
  selectionStyle: 'row',
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
  loading: false,
  loadingMessage: '로딩 중...',
  undoable: true,
  undoStackSize: 50,
};

const DEFAULT_CHECKBAR: CheckBarOptions = {
  visible: false,
  exclusive: false,
  showAll: true,
};

// Column cache interface for performance optimization
interface ColumnCache {
  visible: ColumnDefinition[] | null;
  fixedLeft: ColumnDefinition[] | null;
  scrollable: ColumnDefinition[] | null;
  dirty: boolean;
}

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
  private loadingOverlay: HTMLElement | null = null;

  private fixedLeftContainer: HTMLElement | null = null;
  private fixedLeftHeader: HTMLElement | null = null;
  private fixedLeftBody: HTMLElement | null = null;
  private fixedLeftBodyInner: HTMLElement | null = null;

  private resizing: { field: string; startX: number; startWidth: number } | null = null;
  private blockSelecting: { startRow: number; startField: string } | null = null;

  // Cached canvas for text measurement (performance optimization)
  private measureCanvas: HTMLCanvasElement | null = null;
  private measureContext: CanvasRenderingContext2D | null = null;

  // Bound event handlers (avoid creating new functions on each call)
  private boundHandleResizeMove: (e: MouseEvent) => void;
  private boundHandleResizeEnd: (e: MouseEvent) => void;
  private boundHandleBlockSelectionEnd: () => void;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;

  private virtualState = {
    startIndex: 0,
    endIndex: 0,
    visibleCount: 0,
    totalHeight: 0,
  };

  private dataIndexMap: Map<RowData, number> = new Map();

  // Column cache for performance optimization
  private columnCache: ColumnCache = {
    visible: null,
    fixedLeft: null,
    scrollable: null,
    dirty: true,
  };

  // Phase 10: Column reorder state
  private columnDragging: { field: string; startX: number; element: HTMLElement | null } | null = null;
  
  // Phase 11: Row drag state
  private rowDragging: { index: number; startY: number; element: HTMLElement | null } | null = null;
  
  // Column menu popup
  private columnMenuPopup: HTMLElement | null = null;
  
  // Bound event handlers for Phase 10-11
  private boundHandleColumnDragMove: (e: MouseEvent) => void;
  private boundHandleColumnDragEnd: (e: MouseEvent) => void;
  private boundHandleRowDragMove: (e: MouseEvent) => void;
  private boundHandleRowDragEnd: (e: MouseEvent) => void;

  // Undo/Redo - using GridHistory (refactored)
  private history: GridHistory;
  private tooltip: GridTooltip | null = null;

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
    
    if (this.options.checkBar) {
      this.options.checkBar = { ...DEFAULT_CHECKBAR, ...this.options.checkBar };
    } else if (this.options.showCheckbox) {
      this.options.checkBar = { ...DEFAULT_CHECKBAR, visible: true };
    }

    this.events = events;
    this.gridId = generateId('velox-grid');

    // Bind event handlers once in constructor (performance optimization)
    this.boundHandleResizeMove = this.handleResizeMove.bind(this);
    this.boundHandleResizeEnd = this.handleResizeEnd.bind(this);
    this.boundHandleBlockSelectionEnd = this.handleBlockSelectionEnd.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleColumnDragMove = this.handleColumnDragMove.bind(this);
    this.boundHandleColumnDragEnd = this.handleColumnDragEnd.bind(this);
    this.boundHandleRowDragMove = this.handleRowDragMove.bind(this);
    this.boundHandleRowDragEnd = this.handleRowDragEnd.bind(this);

    // Initialize history manager (refactored from inline stacks)
    this.history = new GridHistory({
      enabled: this.options.undoable ?? true,
      maxSize: this.options.undoStackSize ?? 50,
    });

    this.state = {
      data: [],
      displayData: [],
      columns: this.options.columns.map(col => ({ ...col })),
      selection: {
        selectedRows: new Set<number>(),
        selectedCells: new Set<string>(),
        focusedCell: null,
        selections: [],
      },
      checkBar: {
        checkedRows: new Set<number>(),
        checkableRows: new Set<number>(),
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
      this.initCheckableRows();
    }

    this.build();
    // Phase 12.3: Initialize tooltip
    this.tooltip = new GridTooltip(this.rootElement);
    this.render();
    this.attachEvents();
    this.events.onReady?.(this);
  }

  private rebuildDataIndexMap(): void {
    this.dataIndexMap.clear();
    this.state.data.forEach((row, index) => {
      this.dataIndexMap.set(row, index);
    });
  }

  private initCheckableRows(): void {
    this.state.checkBar.checkableRows.clear();
    const checkBar = this.options.checkBar;
    
    this.state.displayData.forEach((row, index) => {
      if (checkBar?.checkableCallback) {
        if (checkBar.checkableCallback(row, index)) {
          this.state.checkBar.checkableRows.add(index);
        }
      } else {
        this.state.checkBar.checkableRows.add(index);
      }
    });
  }

  private invalidateColumnCache(): void {
    this.columnCache.dirty = true;
    this.columnCache.visible = null;
    this.columnCache.fixedLeft = null;
    this.columnCache.scrollable = null;
  }

  private getFixedLeftColumns(): ColumnDefinition[] {
    if (this.columnCache.dirty || !this.columnCache.fixedLeft) {
      this.columnCache.fixedLeft = this.state.columns.filter(
        col => col.fixed === 'left' && col.visible !== false
      );
    }
    return this.columnCache.fixedLeft;
  }

  private getScrollableColumns(): ColumnDefinition[] {
    if (this.columnCache.dirty || !this.columnCache.scrollable) {
      this.columnCache.scrollable = this.state.columns.filter(
        col => col.fixed !== 'left' && col.visible !== false
      );
      this.columnCache.dirty = false; // Mark as clean after all queries
    }
    return this.columnCache.scrollable;
  }

  private getVisibleColumns(): ColumnDefinition[] {
    if (this.columnCache.dirty || !this.columnCache.visible) {
      this.columnCache.visible = this.state.columns.filter(col => col.visible !== false);
    }
    return this.columnCache.visible;
  }

  private hasFixedLeft(): boolean {
    return this.getFixedLeftColumns().length > 0 || 
           this.options.checkBar?.visible === true || 
           this.options.showCheckbox === true || 
           this.options.showRowNumbers === true;
  }

  private build(): void {
    this.rootElement = createElement('div', 'velox-grid');
    this.rootElement.id = this.gridId;
    this.rootElement.tabIndex = 0;
    
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

    this.buildLoadingOverlay();
  }

  private buildLoadingOverlay(): void {
    this.loadingOverlay = createElement('div', 'velox-loading-overlay');
    this.loadingOverlay.style.display = 'none';
    
    const spinner = createElement('div', 'velox-loading-spinner');
    const message = createElement('div', 'velox-loading-message');
    message.textContent = this.options.loadingMessage || '로딩 중...';
    
    this.loadingOverlay.appendChild(spinner);
    this.loadingOverlay.appendChild(message);
    this.rootElement.appendChild(this.loadingOverlay);
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
    this.updateLoadingState();
  }

  private renderHeader(): void {
    if (this.fixedLeftHeader) {
      this.fixedLeftHeader.innerHTML = '';
      const headerRow = createElement('div', 'velox-header-row');
      
      if (this.options.checkBar?.visible) {
        headerRow.appendChild(this.createHeaderCheckbarCell());
      }
      
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

  private createHeaderCheckbarCell(): HTMLElement {
    const cell = createElement('div', 'velox-header-cell velox-checkbox-cell');
    const checkBar = this.options.checkBar!;
    
    if (checkBar.showAll && !checkBar.exclusive) {
      const checkbox = createElement('input', 'velox-checkbox') as HTMLInputElement;
      checkbox.type = 'checkbox';
      
      const checkableCount = this.state.checkBar.checkableRows.size;
      const checkedCount = this.state.checkBar.checkedRows.size;
      const allChecked = checkableCount > 0 && checkedCount === checkableCount;
      const someChecked = checkedCount > 0 && !allChecked;
      
      checkbox.checked = allChecked;
      checkbox.indeterminate = someChecked;
      checkbox.addEventListener('change', () => this.checkAll(checkbox.checked));
      cell.appendChild(checkbox);
    } else if (checkBar.exclusive) {
      const label = createElement('span', 'velox-checkbox-label');
      label.textContent = '선택';
      cell.appendChild(label);
    }
    
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
    
    // Phase 10: Column drag handle
    const dragHandle = createElement('span', 'velox-column-drag-handle');
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.title = '드래그하여 컬럼 순서 변경';
    dragHandle.addEventListener('mousedown', (e) => this.startColumnDrag(e, column));
    contentWrapper.appendChild(dragHandle);
    
    const text = createElement('span', 'velox-header-text');
    text.textContent = column.header;
    contentWrapper.appendChild(text);

    if (this.options.sortable && column.sortable !== false) {
      const sortIcon = createElement('span', 'velox-sort-icon');
      const sortState = this.state.sort.find(s => s.field === column.field);
      
      // Heroicons: bars-arrow-up / bars-arrow-down
      if (sortState?.direction === 'asc') {
        addClass(sortIcon, 'velox-sort-icon--asc');
        sortIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>`;
      } else if (sortState?.direction === 'desc') {
        addClass(sortIcon, 'velox-sort-icon--desc');
        sortIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>`;
      } else {
        // 정렬 안된 상태: 위아래 화살표 (기본)
        sortIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>`;
      }
      
      contentWrapper.appendChild(sortIcon);
      contentWrapper.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        if (!this.columnDragging) this.handleSort(column.field); 
      });
    }

    cell.appendChild(contentWrapper);

    if (this.options.filterable && column.filterable !== false) {
      const filterBtn = createElement('button', 'velox-filter-btn');
      // Heroicons: funnel (outline)
      filterBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>`;
      const hasFilter = this.state.filter?.conditions.some(c => c.field === column.field);
      if (hasFilter) addClass(filterBtn, 'velox-filter-btn--active');
      filterBtn.addEventListener('click', (e) => { e.stopPropagation(); this.showFilterPopup(column, filterBtn); });
      cell.appendChild(filterBtn);
    }
    
    // Phase 10: Column menu button
    const menuBtn = createElement('button', 'velox-column-menu-btn');
    menuBtn.innerHTML = '⋯';
    menuBtn.title = '컬럼 메뉴';
    menuBtn.addEventListener('click', (e) => { e.stopPropagation(); this.showColumnMenu(column, menuBtn); });
    cell.appendChild(menuBtn);

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

  /**
   * Unified row creation method (refactored: createRowBase)
   * Replaces both createFixedLeftRow and createRow
   */
  private createRowBase(rowData: RowData, rowIndex: number, isFixedLeft: boolean): HTMLElement {
    const row = createElement('div', 'velox-row');
    row.dataset.rowIndex = String(rowIndex);

    // Alternating row style
    if (rowIndex % 2 === 1) addClass(row, 'velox-row--alt');
    
    // Selection state
    if (this.options.selectionStyle === 'row' && this.state.selection.selectedRows.has(rowIndex)) {
      addClass(row, 'velox-row--selected');
    }
    
    // CheckBar state (for fixed left)
    if (isFixedLeft && this.state.checkBar.checkedRows.has(rowIndex)) {
      addClass(row, 'velox-row--checked');
    }

    // Row click handler
    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('velox-checkbox')) return;
      if (target.classList.contains('velox-row-drag-handle')) return;
      this.handleRowClick(rowIndex, e);
    });

    // Double click (only for scrollable rows)
    if (!isFixedLeft) {
      row.addEventListener('dblclick', (e) => this.handleRowDoubleClick(rowIndex, e));
    }

    // Fixed left specific content
    if (isFixedLeft) {
      // Phase 11: Row drag handle
      const dragHandle = createElement('div', 'velox-row-drag-handle');
      dragHandle.innerHTML = '☰';
      dragHandle.title = '드래그하여 행 순서 변경';
      dragHandle.addEventListener('mousedown', (e) => this.startRowDrag(e, rowIndex, row));
      row.appendChild(dragHandle);
      
      if (this.options.checkBar?.visible) {
        row.appendChild(this.createCheckbarCell(rowIndex));
      }
      
      if (this.options.showRowNumbers) {
        const rowNumCell = createElement('div', 'velox-cell velox-rownumber-cell');
        rowNumCell.textContent = String(rowIndex + 1);
        row.appendChild(rowNumCell);
      }
      
      // Fixed left columns
      this.getFixedLeftColumns().forEach(col => row.appendChild(this.createCell(rowData, rowIndex, col)));
    } else {
      // Scrollable columns
      this.getScrollableColumns().forEach(col => row.appendChild(this.createCell(rowData, rowIndex, col)));
    }

    return row;
  }

  private createFixedLeftRow(rowData: RowData, rowIndex: number): HTMLElement {
    return this.createRowBase(rowData, rowIndex, true);
  }

  private createRow(rowData: RowData, rowIndex: number): HTMLElement {
    return this.createRowBase(rowData, rowIndex, false);
  }

  private createCheckbarCell(rowIndex: number): HTMLElement {
    const cell = createElement('div', 'velox-cell velox-checkbox-cell');
    const checkBar = this.options.checkBar!;
    const isCheckable = this.state.checkBar.checkableRows.has(rowIndex);
    const isChecked = this.state.checkBar.checkedRows.has(rowIndex);
    
    const input = createElement('input', 'velox-checkbox') as HTMLInputElement;
    input.type = checkBar.exclusive ? 'radio' : 'checkbox';
    input.name = checkBar.exclusive ? `${this.gridId}-check` : '';
    input.checked = isChecked;
    input.disabled = !isCheckable;
    
    if (!isCheckable) {
      addClass(cell, 'velox-checkbox-cell--disabled');
    }
    
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('change', () => {
      if (checkBar.exclusive) {
        this.state.checkBar.checkedRows.clear();
        if (input.checked) {
          this.state.checkBar.checkedRows.add(rowIndex);
        }
        this.render();
        this.events.onCheckChange?.(rowIndex, input.checked);
      } else {
        this.checkItem(rowIndex, input.checked);
      }
    });
    
    cell.appendChild(input);
    return cell;
  }

  private createCell(rowData: RowData, rowIndex: number, column: ColumnDefinition): HTMLElement {
    const cell = createElement('div', 'velox-cell');
    cell.dataset.field = column.field;
    cell.dataset.rowIndex = String(rowIndex);

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

    const cellKey = `${rowIndex}:${column.field}`;
    if (this.state.selection.selectedCells.has(cellKey)) {
      addClass(cell, 'velox-cell--selected');
    }
    
    const focusedCell = this.state.selection.focusedCell;
    if (focusedCell && focusedCell.rowIndex === rowIndex && focusedCell.field === column.field) {
      addClass(cell, 'velox-cell--focused');
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
    
    cell.addEventListener('click', (e) => {
      this.handleCellClick(rowIndex, column.field, value, e);
    });
    
    cell.addEventListener('mousedown', (e) => {
      if (this.options.selectionStyle === 'block' && e.button === 0) {
        this.startBlockSelection(rowIndex, column.field);
      }
    });
    
    cell.addEventListener('mouseenter', () => {
      if (this.blockSelecting) {
        this.updateBlockSelection(rowIndex, column.field);
      }
    });

    // Phase 12.3: Add tooltip event listeners
    if (column.tooltip && this.tooltip) {
      addClass(cell, 'velox-cell--has-tooltip');
      
      cell.addEventListener('mouseenter', () => {
        if (this.tooltip) {
          this.tooltip.show(cell, value, rowData, column);
        }
      });
      
      cell.addEventListener('mouseleave', () => {
        if (this.tooltip) {
          this.tooltip.hide();
        }
      });
    }

    return cell;
  }

  private updateLoadingState(): void {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = this.options.loading ? 'flex' : 'none';
    }
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
    // Close filter popup if clicking outside
    if (this.filterPopup && !this.filterPopup.contains(e.target as Node)) {
      this.closeFilterPopup();
    }
    // Close column menu if clicking outside
    if (this.columnMenuPopup && !this.columnMenuPopup.contains(e.target as Node)) {
      this.closeColumnMenu();
    }
  };

  private closeFilterPopup(): void {
    if (this.filterPopup) {
      this.filterPopup.remove();
      this.filterPopup = null;
    }
    // Only remove listener if no popups are open
    if (!this.columnMenuPopup) {
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
    this.clearSelectionState();
    this.applyDataTransformations();
    this.render();
    this.events.onFilter?.(this.state.filter);
  }

  private removeColumnFilter(field: string): void {
    if (this.state.filter) {
      const conditions = this.state.filter.conditions.filter(c => c.field !== field);
      this.state.filter = conditions.length === 0 ? null : { conditions, logic: 'and' };
      this.clearSelectionState();
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
    document.addEventListener('mousemove', this.boundHandleResizeMove);
    document.addEventListener('mouseup', this.boundHandleResizeEnd);
    document.addEventListener('mouseup', this.boundHandleBlockSelectionEnd);
    this.rootElement.addEventListener('keydown', this.boundHandleKeyDown);
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
    this.clearSelectionState();
    this.applyDataTransformations();
    this.render();
    this.events.onSort?.(this.state.sort);
  }

  private handleRowClick(rowIndex: number, e: MouseEvent): void {
    if (!this.options.selectable) return;
    
    const selectionStyle = this.options.selectionStyle || 'row';
    
    if (selectionStyle === 'row') {
      this.handleRowSelection(rowIndex, e);
    }
    
    this.events.onRowClick?.(rowIndex, this.state.displayData[rowIndex]);
  }

  private handleRowSelection(rowIndex: number, e: MouseEvent): void {
    const selectionMode = this.options.selectionMode || 'multiple';
    
    if (selectionMode === 'none') return;
    
    if (selectionMode === 'multiple' && (e.ctrlKey || e.metaKey)) {
      const isSelected = this.state.selection.selectedRows.has(rowIndex);
      this.selectRow(rowIndex, !isSelected);
    } else if (selectionMode === 'multiple' && e.shiftKey) {
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
    } else if (selectionMode === 'extended' && (e.ctrlKey || e.metaKey)) {
      const isSelected = this.state.selection.selectedRows.has(rowIndex);
      this.selectRow(rowIndex, !isSelected);
    } else {
      this.state.selection.selectedRows.clear();
      this.selectRow(rowIndex, true);
    }
  }

  private handleCellClick(rowIndex: number, field: string, value: CellValue, e: MouseEvent): void {
    const selectionStyle = this.options.selectionStyle || 'row';
    
    if (selectionStyle === 'cell' || selectionStyle === 'block') {
      this.handleCellSelection(rowIndex, field, e);
    }
    
    this.events.onCellClick?.(rowIndex, field, value);
  }

  private handleCellSelection(rowIndex: number, field: string, e: MouseEvent): void {
    const selectionMode = this.options.selectionMode || 'multiple';
    const cellKey = `${rowIndex}:${field}`;
    
    if (selectionMode === 'none') return;
    
    this.state.selection.focusedCell = { rowIndex, field };
    
    if (selectionMode === 'multiple' && (e.ctrlKey || e.metaKey)) {
      const isSelected = this.state.selection.selectedCells.has(cellKey);
      if (isSelected) {
        this.state.selection.selectedCells.delete(cellKey);
      } else {
        this.state.selection.selectedCells.add(cellKey);
      }
    } else if (selectionMode === 'multiple' && e.shiftKey) {
      const focusedCell = this.state.selection.focusedCell;
      if (focusedCell) {
        this.selectCellRange(focusedCell.rowIndex, focusedCell.field, rowIndex, field);
      }
    } else {
      this.state.selection.selectedCells.clear();
      this.state.selection.selectedCells.add(cellKey);
    }
    
    this.render();
    this.events.onCellSelectionChange?.(this.getSelectedCells());
  }

  private selectCellRange(startRow: number, startField: string, endRow: number, endField: string): void {
    const columns = this.getVisibleColumns();
    const startColIndex = columns.findIndex(c => c.field === startField);
    const endColIndex = columns.findIndex(c => c.field === endField);
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);
    
    this.state.selection.selectedCells.clear();
    
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const field = columns[c].field;
        this.state.selection.selectedCells.add(`${r}:${field}`);
      }
    }
  }

  private startBlockSelection(rowIndex: number, field: string): void {
    if (this.options.selectionStyle !== 'block') return;
    
    this.blockSelecting = { startRow: rowIndex, startField: field };
    this.state.selection.focusedCell = { rowIndex, field };
    this.state.selection.selectedCells.clear();
    this.state.selection.selectedCells.add(`${rowIndex}:${field}`);
    this.render();
  }

  private updateBlockSelection(rowIndex: number, field: string): void {
    if (!this.blockSelecting) return;
    
    this.selectCellRange(
      this.blockSelecting.startRow,
      this.blockSelecting.startField,
      rowIndex,
      field
    );
    this.render();
  }

  private handleBlockSelectionEnd = (): void => {
    if (this.blockSelecting) {
      this.blockSelecting = null;
      this.events.onCellSelectionChange?.(this.getSelectedCells());
    }
  };

  private handleRowDoubleClick(rowIndex: number, _e: MouseEvent): void {
    this.events.onRowDoubleClick?.(rowIndex, this.state.displayData[rowIndex]);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Handle editing state
    if (this.state.edit.editing) {
      if (e.key === 'Escape') {
        this.cancelEdit();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.endEditAndMove('down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.endEditAndMove(e.shiftKey ? 'left' : 'right');
      }
      return;
    }
    
    // Handle Undo/Redo (Ctrl+Z, Ctrl+Y)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      this.undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      this.redo();
      return;
    }
    
    // Handle Copy/Paste/Cut shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      this.copy();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      this.paste();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
      e.preventDefault();
      this.cut();
      return;
    }
    
    // Handle Delete key
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.options.editable) {
        e.preventDefault();
        this.deleteSelectedCells();
        return;
      }
    }
    
    const focusedCell = this.state.selection.focusedCell;
    this.events.onKeyDown?.(e, focusedCell);
    
    if (!focusedCell) return;
    
    const columns = this.getVisibleColumns();
    const currentColIndex = columns.findIndex(c => c.field === focusedCell.field);
    let newRowIndex = focusedCell.rowIndex;
    let newColIndex = currentColIndex;
    let handled = false;
    
    switch (e.key) {
      case 'ArrowUp':
        if (newRowIndex > 0) { newRowIndex--; handled = true; }
        break;
      case 'ArrowDown':
        if (newRowIndex < this.state.displayData.length - 1) { newRowIndex++; handled = true; }
        break;
      case 'ArrowLeft':
        if (newColIndex > 0) { newColIndex--; handled = true; }
        break;
      case 'ArrowRight':
        if (newColIndex < columns.length - 1) { newColIndex++; handled = true; }
        break;
      case 'Home':
        if (e.ctrlKey) { newRowIndex = 0; newColIndex = 0; }
        else { newColIndex = 0; }
        handled = true;
        break;
      case 'End':
        if (e.ctrlKey) { newRowIndex = this.state.displayData.length - 1; newColIndex = columns.length - 1; }
        else { newColIndex = columns.length - 1; }
        handled = true;
        break;
      case 'PageUp':
        newRowIndex = Math.max(0, newRowIndex - this.virtualState.visibleCount);
        handled = true;
        break;
      case 'PageDown':
        newRowIndex = Math.min(this.state.displayData.length - 1, newRowIndex + this.virtualState.visibleCount);
        handled = true;
        break;
      case 'Enter':
      case 'F2':
        if (this.options.editable) { this.startEdit(focusedCell.rowIndex, focusedCell.field); handled = true; }
        break;
      case ' ':
        if (this.options.checkBar?.visible) { this.checkItem(focusedCell.rowIndex, !this.isItemChecked(focusedCell.rowIndex)); handled = true; }
        break;
      case 'a':
      case 'A':
        if (e.ctrlKey || e.metaKey) { this.selectAllCells(); handled = true; }
        break;
    }
    
    if (handled) {
      e.preventDefault();
      
      const newField = columns[newColIndex]?.field;
      if (newField && (newRowIndex !== focusedCell.rowIndex || newField !== focusedCell.field)) {
        this.setFocusedCell(newRowIndex, newField);
        
        if (e.shiftKey && (this.options.selectionStyle === 'cell' || this.options.selectionStyle === 'block')) {
          this.selectCellRange(focusedCell.rowIndex, focusedCell.field, newRowIndex, newField);
        } else if (!e.shiftKey && !e.ctrlKey) {
          this.state.selection.selectedCells.clear();
          this.state.selection.selectedCells.add(`${newRowIndex}:${newField}`);
          
          if (this.options.selectionStyle === 'row') {
            this.state.selection.selectedRows.clear();
            this.state.selection.selectedRows.add(newRowIndex);
          }
        }
        
        this.render();
        this.scrollToCell(newRowIndex, newField);
      }
    }
  }

  private selectAllCells(): void {
    const columns = this.getVisibleColumns();
    this.state.selection.selectedCells.clear();
    
    for (let r = 0; r < this.state.displayData.length; r++) {
      for (const col of columns) {
        this.state.selection.selectedCells.add(`${r}:${col.field}`);
      }
    }
    
    this.render();
    this.events.onCellSelectionChange?.(this.getSelectedCells());
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
    this.initCheckableRows();
  }

  /**
   * Clear all selection state (rows, cells, focused cell)
   * Extracted to reduce code duplication
   */
  private clearSelectionState(): void {
    this.state.selection.selectedRows.clear();
    this.state.selection.selectedCells.clear();
    this.state.selection.focusedCell = null;
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
    this.clearSelectionState();
    this.state.checkBar.checkedRows.clear();
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
    
    const dataIndex = this.state.data.indexOf(displayRow);
    if (dataIndex >= 0) {
      const removed = this.state.data.splice(dataIndex, 1)[0];
      this.rebuildDataIndexMap();
      
      this.state.selection.selectedRows.delete(index);
      const newSelectedRows = new Set<number>();
      this.state.selection.selectedRows.forEach(i => {
        if (i > index) newSelectedRows.add(i - 1);
        else if (i < index) newSelectedRows.add(i);
      });
      this.state.selection.selectedRows = newSelectedRows;
      
      this.state.checkBar.checkedRows.delete(index);
      const newCheckedRows = new Set<number>();
      this.state.checkBar.checkedRows.forEach(i => {
        if (i > index) newCheckedRows.add(i - 1);
        else if (i < index) newCheckedRows.add(i);
      });
      this.state.checkBar.checkedRows = newCheckedRows;

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
    this.state.selection.selectedCells.clear();
    this.state.selection.focusedCell = null;
    this.state.checkBar.checkedRows.clear();
    this.state.checkBar.checkableRows.clear();
    this.render();
    this.events.onDataChange?.([]);
  }

  // ============================================
  // Public API - Row Selection Methods
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
    this.clearSelectionState();
    this.render();
    this.events.onSelectionChange?.([]);
    this.events.onCellSelectionChange?.([]);
  }

  isRowSelected(index: number): boolean {
    return this.state.selection.selectedRows.has(index);
  }

  // ============================================
  // Public API - Cell Selection Methods (Phase 7)
  // ============================================

  selectCell(rowIndex: number, field: string, selected = true): void {
    const cellKey = `${rowIndex}:${field}`;
    if (selected) {
      this.state.selection.selectedCells.add(cellKey);
    } else {
      this.state.selection.selectedCells.delete(cellKey);
    }
    this.render();
    this.events.onCellSelect?.({ rowIndex, field }, selected);
    this.events.onCellSelectionChange?.(this.getSelectedCells());
  }

  getSelectedCells(): CellIndex[] {
    return Array.from(this.state.selection.selectedCells).map(key => {
      const [rowIndex, field] = key.split(':');
      return { rowIndex: parseInt(rowIndex, 10), field };
    });
  }

  setFocusedCell(rowIndex: number, field: string): void {
    this.state.selection.focusedCell = { rowIndex, field };
    this.render();
  }

  getFocusedCell(): CellIndex | null {
    return this.state.selection.focusedCell;
  }

  setSelection(selection: Selection): void {
    this.state.selection.selectedCells.clear();
    this.state.selection.selectedRows.clear();
    
    if (selection.style === 'row') {
      for (let r = selection.startRow; r <= selection.endRow; r++) {
        this.state.selection.selectedRows.add(r);
      }
    } else if (selection.style === 'cell' || selection.style === 'block') {
      if (selection.startColumn && selection.endColumn) {
        this.selectCellRange(selection.startRow, selection.startColumn, selection.endRow, selection.endColumn);
      }
    }
    
    this.state.selection.selections = [selection];
    this.render();
  }

  getSelection(): Selection | null {
    const selections = this.state.selection.selections;
    return selections.length > 0 ? selections[0] : null;
  }

  getSelectionData(): CellValue[][] {
    const cells = this.getSelectedCells();
    if (cells.length === 0) return [];
    
    const rowIndices = [...new Set(cells.map(c => c.rowIndex))].sort((a, b) => a - b);
    const fields = [...new Set(cells.map(c => c.field))];
    
    const columns = this.getVisibleColumns();
    const orderedFields = columns.filter(c => fields.includes(c.field)).map(c => c.field);
    
    const result: CellValue[][] = [];
    for (const rowIndex of rowIndices) {
      const rowData = this.state.displayData[rowIndex];
      if (rowData) {
        const row: CellValue[] = orderedFields.map(field => rowData[field]);
        result.push(row);
      }
    }
    
    return result;
  }

  // ============================================
  // Public API - CheckBar Methods (Phase 7)
  // ============================================

  checkItem(index: number, checked = true): void {
    if (!this.state.checkBar.checkableRows.has(index)) return;
    
    const checkBar = this.options.checkBar;
    
    if (checkBar?.exclusive && checked) {
      this.state.checkBar.checkedRows.clear();
    }
    
    if (checked) {
      this.state.checkBar.checkedRows.add(index);
    } else {
      this.state.checkBar.checkedRows.delete(index);
    }
    
    this.render();
    this.events.onCheckChange?.(index, checked);
  }

  checkItems(indices: number[], checked = true): void {
    indices.forEach(index => {
      if (this.state.checkBar.checkableRows.has(index)) {
        if (checked) {
          this.state.checkBar.checkedRows.add(index);
        } else {
          this.state.checkBar.checkedRows.delete(index);
        }
      }
    });
    this.render();
  }

  checkAll(checked = true): void {
    if (this.options.checkBar?.exclusive) return;
    
    if (checked) {
      this.state.checkBar.checkableRows.forEach(index => {
        this.state.checkBar.checkedRows.add(index);
      });
    } else {
      this.state.checkBar.checkedRows.clear();
    }
    
    this.render();
    this.events.onCheckAllChange?.(checked);
  }

  uncheckAll(): void {
    this.checkAll(false);
  }

  getCheckedItems(): number[] {
    return Array.from(this.state.checkBar.checkedRows).sort((a, b) => a - b);
  }

  getCheckedData(): RowData[] {
    return this.getCheckedItems()
      .map(i => this.state.displayData[i])
      .filter(Boolean)
      .map(row => ({ ...row }));
  }

  isItemChecked(index: number): boolean {
    return this.state.checkBar.checkedRows.has(index);
  }

  isItemCheckable(index: number): boolean {
    return this.state.checkBar.checkableRows.has(index);
  }

  checkRow(index: number, checked = true): void { this.checkItem(index, checked); }
  getCheckedRows(): number[] { return this.getCheckedItems(); }

  // ============================================
  // Public API - Sort Methods
  // ============================================

  sort(field: string, direction: SortDirection = 'asc'): void {
    this.state.sort = direction ? [{ field, direction }] : [];
    this.clearSelectionState();
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
    this.clearSelectionState();
    this.applyDataTransformations();
    this.render();
    this.events.onFilter?.(this.state.filter);
  }

  clearFilter(): void {
    this.state.filter = null;
    this.clearSelectionState();
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
    const cell = row?.querySelector(`[data-field="${field}"]`) as HTMLElement;
    if (!cell) return;

    const column = this.state.columns.find(c => c.field === field);
    if (!column) return;

    addClass(cell, 'velox-cell--editing');

    // Phase 12.2: Use GridEditorFactory if editor is specified
    if (column.editor) {
      const editor = GridEditorFactory.createEditor(
        value,
        column.editor,
        (newValue) => {
          // Save callback
          this.state.edit.editing = false;
          const row = this.state.displayData[rowIndex];
          if (row) {
            const dataIndex = this.state.data.indexOf(row);
            if (dataIndex >= 0) {
              this.state.data[dataIndex][field] = newValue;
            }
          }
          this.applyDataTransformations();
          this.render();
          
          const event = this.events as any;
          if (event.onCellEditEnd) {
            event.onCellEditEnd({
              rowIndex,
              field,
              oldValue: value,
              newValue,
              row: this.state.displayData[rowIndex]
            });
          }
        },
        () => {
          // Cancel callback
          this.cancelEdit();
        }
      );

      cell.innerHTML = '';
      cell.appendChild(editor);
      
      // Focus the editor
      setTimeout(() => {
        if (editor instanceof HTMLInputElement || editor instanceof HTMLSelectElement) {
          editor.focus();
          if (editor instanceof HTMLInputElement && editor.type === 'text') {
            editor.select();
          }
        }
      }, 0);
    } else {
      // 기존 text input 방식
      const input = createElement('input', 'velox-edit-input') as HTMLInputElement;
      input.type = column.type === 'number' ? 'number' : 'text';
      input.value = value != null ? String(value) : '';

      cell.innerHTML = '';
      cell.appendChild(input);
      input.focus();
      input.select();

      input.addEventListener('blur', () => this.endEdit(true));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.endEdit(true);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.cancelEdit();
        }
      });
    }
  }

  endEdit(save = true): void {
    if (!this.state.edit.editing) return;
    const { rowIndex, field, originalValue } = this.state.edit;
    if (rowIndex === null || field === null) return;
    
    const row = this.bodyInner.querySelector(`[data-row-index="${rowIndex}"]`);
    const cell = row?.querySelector(`[data-field="${field}"]`);
    
    if (save && cell) {
      const column = this.state.columns.find(c => c.field === field);
      const displayRow = this.state.displayData[rowIndex];
      
      // Phase 12.2: Get value from different editor types
      let newValue: CellValue = originalValue;
      
      const input = cell.querySelector('.velox-edit-input') as HTMLInputElement;
      const select = cell.querySelector('.velox-editor--select') as HTMLSelectElement;
      const checkbox = cell.querySelector('.velox-editor--checkbox input[type="checkbox"]') as HTMLInputElement;
      const dateInput = cell.querySelector('.velox-editor--date') as HTMLInputElement;
      const numberInput = cell.querySelector('.velox-editor--number') as HTMLInputElement;
      
      if (checkbox) {
        // Checkbox editor
        newValue = checkbox.checked;
      } else if (select) {
        // Select editor
        if (select.multiple) {
          newValue = Array.from(select.selectedOptions).map(opt => opt.value);
        } else {
          newValue = select.value;
        }
      } else if (dateInput) {
        // Date editor
        newValue = dateInput.value;
      } else if (numberInput) {
        // Number editor
        newValue = numberInput.value === '' ? null : Number(numberInput.value);
      } else if (input) {
        // Default text/number input
        newValue = input.value;
      }
      
      // Check if value changed
      const valueChanged = JSON.stringify(newValue) !== JSON.stringify(originalValue);
      
      if (valueChanged) {
        // Phase 12.1: Validation
        if (column?.validation && column.validation.length > 0) {
          const parsedValue = column.type === 'number' && typeof newValue === 'string' 
            ? parseFloat(newValue) 
            : newValue;
          const validationResult = GridValidator.validate(parsedValue, column.validation, displayRow);
          
          if (!validationResult.valid) {
            // Validation failed - show error
            if (cell) {
              addClass(cell as HTMLElement, 'velox-cell--invalid');
              
              // Show error tooltip
              const errors = validationResult.errors.map(e => e.message).join(', ');
              (cell as HTMLElement).title = errors;
            }
            
            // Fire validation error event
            this.events.onValidationError?.({
              rowIndex,
              field,
              value: parsedValue,
              errors: validationResult.errors.map(e => e.message)
            });
            
            // Keep editing mode - focus input
            if (input) input.focus();
            else if (select) select.focus();
            else if (dateInput) dateInput.focus();
            else if (numberInput) numberInput.focus();
            return;
          }
        }
        
        // Validation passed - save the value
        const parsedValue = column?.type === 'number' && typeof newValue === 'string'
          ? parseFloat(newValue)
          : newValue;
        
        const dataIndex = this.state.data.indexOf(displayRow);
        if (dataIndex >= 0) {
          this.state.data[dataIndex][field] = parsedValue;
        }
        
        this.events.onCellEditEnd?.({
          rowIndex,
          field,
          oldValue: originalValue,
          newValue: parsedValue,
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

  /**
   * End edit and move to adjacent cell (Phase 9)
   */
  private endEditAndMove(direction: 'up' | 'down' | 'left' | 'right'): void {
    const { rowIndex, field } = this.state.edit;
    if (rowIndex === null || field === null) return;
    
    this.endEdit(true);
    
    const columns = this.getVisibleColumns();
    const currentColIndex = columns.findIndex(c => c.field === field);
    let newRowIndex = rowIndex;
    let newColIndex = currentColIndex;
    
    switch (direction) {
      case 'up':
        if (newRowIndex > 0) newRowIndex--;
        break;
      case 'down':
        if (newRowIndex < this.state.displayData.length - 1) newRowIndex++;
        break;
      case 'left':
        if (newColIndex > 0) newColIndex--;
        else if (newRowIndex > 0) {
          newRowIndex--;
          newColIndex = columns.length - 1;
        }
        break;
      case 'right':
        if (newColIndex < columns.length - 1) newColIndex++;
        else if (newRowIndex < this.state.displayData.length - 1) {
          newRowIndex++;
          newColIndex = 0;
        }
        break;
    }
    
    const newField = columns[newColIndex]?.field;
    if (newField) {
      this.setFocusedCell(newRowIndex, newField);
      this.state.selection.selectedCells.clear();
      this.state.selection.selectedCells.add(`${newRowIndex}:${newField}`);
      this.scrollToCell(newRowIndex, newField);
      this.render();
    }
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
      this.invalidateColumnCache();
      this.render();
      this.events.onColumnResize?.(field, width);
    }
  }

  showColumn(field: string): void {
    const column = this.state.columns.find(c => c.field === field);
    if (column) {
      column.visible = true;
      this.invalidateColumnCache();
      this.render();
    }
  }

  hideColumn(field: string): void {
    const column = this.state.columns.find(c => c.field === field);
    if (column) {
      column.visible = false;
      this.invalidateColumnCache();
      this.render();
    }
  }

  setColumns(columns: ColumnDefinition[]): void {
    this.state.columns = columns.map(col => ({ ...col }));
    this.invalidateColumnCache();
    this.render();
  }

  autoFitColumn(field: string): void {
    const column = this.state.columns.find(c => c.field === field);
    if (!column) return;
    
    let maxWidth = 100;
    
    const headerText = column.header || '';
    maxWidth = Math.max(maxWidth, this.measureTextWidth(headerText) + 40);
    
    this.state.displayData.forEach(row => {
      const value = row[column.field];
      const text = formatValue(value, column.type);
      const width = this.measureTextWidth(text) + 20;
      maxWidth = Math.max(maxWidth, width);
    });
    
    column.width = Math.min(maxWidth, 500);
    this.invalidateColumnCache();
    this.render();
    this.events.onColumnResize?.(field, column.width);
  }

  autoFitAllColumns(): void {
    this.getVisibleColumns().forEach(col => this.autoFitColumn(col.field));
  }

  private measureTextWidth(text: string): number {
    // Reuse canvas instance for better performance
    if (!this.measureCanvas) {
      this.measureCanvas = document.createElement('canvas');
      this.measureContext = this.measureCanvas.getContext('2d');
      if (this.measureContext) {
        this.measureContext.font = '14px sans-serif';
      }
    }
    if (!this.measureContext) return 100;
    return this.measureContext.measureText(text).width;
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

  scrollToCell(rowIndex: number, field: string): void {
    const rowHeight = this.options.rowHeight || 40;
    const containerHeight = this.bodyElement.clientHeight;
    const currentScrollTop = this.bodyElement.scrollTop;
    
    const rowTop = rowIndex * rowHeight;
    const rowBottom = rowTop + rowHeight;
    
    if (rowTop < currentScrollTop) {
      this.bodyElement.scrollTop = rowTop;
    } else if (rowBottom > currentScrollTop + containerHeight) {
      this.bodyElement.scrollTop = rowBottom - containerHeight;
    }
    
    if (this.fixedLeftBody) {
      this.fixedLeftBody.scrollTop = this.bodyElement.scrollTop;
    }
    
    const cell = this.bodyInner.querySelector(`[data-field="${field}"]`) as HTMLElement;
    if (cell) {
      const cellLeft = cell.offsetLeft;
      const cellRight = cellLeft + cell.offsetWidth;
      const containerWidth = this.bodyElement.clientWidth;
      const currentScrollLeft = this.bodyElement.scrollLeft;
      
      if (cellLeft < currentScrollLeft) {
        this.bodyElement.scrollLeft = cellLeft;
      } else if (cellRight > currentScrollLeft + containerWidth) {
        this.bodyElement.scrollLeft = cellRight - containerWidth;
      }
    }
  }

  // ============================================
  // Public API - Clipboard Methods (Phase 9 - Stub)
  // ============================================

  copy(): void {
    const data = this.getSelectionData();
    if (data.length === 0) return;
    
    const text = data.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.events.onCopy?.(data.map(row => row.map(v => String(v ?? ''))));
    });
  }

  paste(): void {
    const focusedCell = this.state.selection.focusedCell;
    if (!focusedCell) return;
    
    navigator.clipboard.readText().then(text => {
      const rows = text.split('\n').map(row => row.split('\t'));
      this.events.onPaste?.(rows, focusedCell);
      
      const columns = this.getVisibleColumns();
      const startColIndex = columns.findIndex(c => c.field === focusedCell.field);
      
      rows.forEach((row, rOffset) => {
        const rowIndex = focusedCell.rowIndex + rOffset;
        if (rowIndex >= this.state.displayData.length) return;
        
        row.forEach((value, cOffset) => {
          const colIndex = startColIndex + cOffset;
          if (colIndex >= columns.length) return;
          
          const field = columns[colIndex].field;
          const column = columns[colIndex];
          
          if (column.editable !== false) {
            const displayRow = this.state.displayData[rowIndex];
            const dataIndex = this.state.data.indexOf(displayRow);
            if (dataIndex >= 0) {
              this.state.data[dataIndex][field] = column.type === 'number' ? parseFloat(value) : value;
            }
          }
        });
      });
      
      this.applyDataTransformations();
      this.render();
      this.events.onDataChange?.(this.state.data);
    });
  }

  cut(): void {
    const data = this.getSelectionData();
    if (data.length === 0) return;
    
    this.copy();
    
    // Collect changes for undo
    const changes: BulkEditUndoData['changes'] = [];
    
    const cells = this.getSelectedCells();
    cells.forEach(cell => {
      const column = this.state.columns.find(c => c.field === cell.field);
      if (column?.editable !== false) {
        const displayRow = this.state.displayData[cell.rowIndex];
        const dataIndex = this.state.data.indexOf(displayRow);
        if (dataIndex >= 0) {
          const oldValue = this.state.data[dataIndex][cell.field];
          changes.push({
            rowIndex: cell.rowIndex,
            field: cell.field,
            oldValue,
            newValue: ''
          });
          this.state.data[dataIndex][cell.field] = '';
        }
      }
    });
    
    // Push to undo stack
    if (changes.length > 0) {
      this.pushUndo({ type: 'cut', timestamp: Date.now(), data: { changes } as BulkEditUndoData });
    }
    
    this.applyDataTransformations();
    this.render();
    this.events.onCut?.(data.map(row => row.map(v => String(v ?? ''))));
    this.events.onDataChange?.(this.state.data);
  }

  // ============================================
  // Public API - Undo/Redo Methods (Phase 9)
  // ============================================

  /**
   * Push action to undo stack (using GridHistory)
   */
  private pushUndo(action: UndoAction): void {
    this.history.push(action);
  }

  /**
   * Undo the last action (using GridHistory)
   */
  undo(): boolean {
    const action = this.history.popUndo();
    if (!action) return false;
    
    switch (action.type) {
      case 'cell_edit': {
        const data = action.data as CellEditUndoData;
        const displayRow = this.state.displayData[data.rowIndex];
        const dataIndex = this.state.data.indexOf(displayRow);
        if (dataIndex >= 0) {
          this.state.data[dataIndex][data.field] = data.oldValue;
        }
        break;
      }
      case 'bulk_edit':
      case 'paste':
      case 'cut':
      case 'delete': {
        const data = action.data as BulkEditUndoData;
        data.changes.forEach(change => {
          const displayRow = this.state.displayData[change.rowIndex];
          const dataIndex = this.state.data.indexOf(displayRow);
          if (dataIndex >= 0) {
            this.state.data[dataIndex][change.field] = change.oldValue;
          }
        });
        break;
      }
      case 'row_add': {
        const data = action.data as RowAddUndoData;
        this.state.data.splice(data.index, 1);
        this.rebuildDataIndexMap();
        break;
      }
      case 'row_remove': {
        const data = action.data as RowRemoveUndoData;
        this.state.data.splice(data.index, 0, { ...data.row });
        this.rebuildDataIndexMap();
        break;
      }
    }
    
    this.applyDataTransformations();
    this.render();
    this.events.onUndo?.(action);
    this.events.onDataChange?.(this.state.data);
    
    return true;
  }

  /**
   * Redo the last undone action (using GridHistory)
   */
  redo(): boolean {
    const action = this.history.popRedo();
    if (!action) return false;
    
    switch (action.type) {
      case 'cell_edit': {
        const data = action.data as CellEditUndoData;
        const displayRow = this.state.displayData[data.rowIndex];
        const dataIndex = this.state.data.indexOf(displayRow);
        if (dataIndex >= 0) {
          this.state.data[dataIndex][data.field] = data.newValue;
        }
        break;
      }
      case 'bulk_edit':
      case 'paste':
      case 'cut':
      case 'delete': {
        const data = action.data as BulkEditUndoData;
        data.changes.forEach(change => {
          const displayRow = this.state.displayData[change.rowIndex];
          const dataIndex = this.state.data.indexOf(displayRow);
          if (dataIndex >= 0) {
            this.state.data[dataIndex][change.field] = change.newValue;
          }
        });
        break;
      }
      case 'row_add': {
        const data = action.data as RowAddUndoData;
        this.state.data.splice(data.index, 0, { ...data.row });
        this.rebuildDataIndexMap();
        break;
      }
      case 'row_remove': {
        const data = action.data as RowRemoveUndoData;
        this.state.data.splice(data.index, 1);
        this.rebuildDataIndexMap();
        break;
      }
    }
    
    this.applyDataTransformations();
    this.render();
    this.events.onRedo?.(action);
    this.events.onDataChange?.(this.state.data);
    
    return true;
  }

  /**
   * Check if undo is available (using GridHistory)
   */
  canUndo(): boolean {
    return this.history.canUndo();
  }

  /**
   * Check if redo is available (using GridHistory)
   */
  canRedo(): boolean {
    return this.history.canRedo();
  }

  /**
   * Clear undo/redo history (using GridHistory)
   */
  clearHistory(): void {
    this.history.clear();
  }

  // ============================================
  // Public API - Delete Methods (Phase 9)
  // ============================================

  /**
   * Delete selected cells content
   */
  deleteSelectedCells(): void {
    if (!this.options.editable) return;
    
    const cells = this.getSelectedCells();
    if (cells.length === 0) return;
    
    const changes: BulkEditUndoData['changes'] = [];
    
    cells.forEach(cell => {
      const column = this.state.columns.find(c => c.field === cell.field);
      if (column?.editable !== false) {
        const displayRow = this.state.displayData[cell.rowIndex];
        const dataIndex = this.state.data.indexOf(displayRow);
        if (dataIndex >= 0) {
          const oldValue = this.state.data[dataIndex][cell.field];
          if (oldValue !== '' && oldValue !== null && oldValue !== undefined) {
            changes.push({
              rowIndex: cell.rowIndex,
              field: cell.field,
              oldValue,
              newValue: ''
            });
            this.state.data[dataIndex][cell.field] = '';
          }
        }
      }
    });
    
    if (changes.length > 0) {
      this.pushUndo({ type: 'delete', timestamp: Date.now(), data: { changes } as BulkEditUndoData });
      this.applyDataTransformations();
      this.render();
      this.events.onDataChange?.(this.state.data);
    }
  }

  /**
   * Delete selected rows
   */
  deleteSelectedRows(): void {
    const selectedRows = this.getSelectedRows();
    if (selectedRows.length === 0) return;
    
    // Sort in reverse order to delete from end first
    const sortedRows = [...selectedRows].sort((a, b) => b - a);
    
    sortedRows.forEach(index => {
      this.removeRow(index);
    });
  }

  // ============================================
  // Public API - Export Methods (Phase 8)
  // ============================================

  /**
   * Create export context for export utilities
   */
  private createExportContext(options: ExportOptions = {}): ExportContext {
    return {
      data: this.state.data,
      displayData: this.state.displayData,
      columns: this.state.columns,
      selectedRows: this.getSelectedRows(),
      options,
    };
  }

  /**
   * Export grid data to Excel (.xlsx) file
   * Requires SheetJS library to be loaded via CDN:
   * <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
   */
  exportToExcel(options: ExportOptions = {}): void {
    const context = this.createExportContext(options);
    exportToExcelUtil(context);
  }

  /**
   * Export grid data to CSV format
   * @returns CSV string
   */
  exportToCSV(options: ExportOptions = {}): string {
    const context = this.createExportContext(options);
    return exportToCSVUtil(context);
  }

  /**
   * Export grid data to JSON format
   * @returns JSON string
   */
  exportToJSON(options: ExportOptions = {}): string {
    const context = this.createExportContext(options);
    return exportToJSONUtil(context);
  }

  /**
   * Download grid data as CSV file
   */
  downloadCSV(options: ExportOptions = {}): void {
    const context = this.createExportContext(options);
    downloadCSV(context);
  }

  /**
   * Download grid data as JSON file
   */
  downloadJSON(options: ExportOptions = {}): void {
    const context = this.createExportContext(options);
    downloadJSON(context);
  }

  /**
   * Import data from CSV string
   * @param csvString CSV content
   * @param hasHeader Whether first row is header (default: true)
   */
  importFromCSV(csvString: string, hasHeader = true): ImportResult {
    const result = parseCSV(csvString, hasHeader);
    if (result.errors.length === 0 && result.data.length > 0) {
      this.setData(result.data);
    }
    return result;
  }

  /**
   * Import data from Excel file
   * Requires SheetJS library to be loaded via CDN
   * @param file Excel file (File object)
   * @param sheetIndex Sheet index to import (default: 0)
   */
  async importFromExcel(file: File, sheetIndex = 0): Promise<ImportResult> {
    const result = await importFromExcel(file, sheetIndex);
    if (result.errors.length === 0 && result.data.length > 0) {
      this.setData(result.data);
    }
    return result;
  }

  /**
   * Check if SheetJS library is available for Excel operations
   */
  static isExcelSupported(): boolean {
    return isSheetJSAvailable();
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
    
    if (options.checkBar) {
      this.options.checkBar = { ...DEFAULT_CHECKBAR, ...options.checkBar };
    }
    
    if (options.columns) {
      this.state.columns = options.columns.map(col => ({ ...col }));
    }
    
    if (options.loading !== undefined) {
      this.updateLoadingState();
    }
    
    this.render();
  }

  getOptions(): GridOptions { 
    return { ...this.options }; 
  }

  setLoading(loading: boolean): void {
    this.options.loading = loading;
    this.updateLoadingState();
  }

  refresh(): void {
    this.applyDataTransformations();
    this.render();
  }

  // ============================================
  // Phase 10: Column Reorder & Menu
  // ============================================

  /**
   * Fix/unfix column to a position
   */
  fixColumn(field: string, position: 'left' | 'right' | false): void {
    const column = this.state.columns.find(c => c.field === field);
    if (column) {
      column.fixed = position;
      this.invalidateColumnCache();
      this.render();
    }
  }

  /**
   * Reorder column to new position
   */
  reorderColumn(sourceField: string, targetField: string): void {
    const sourceIndex = this.state.columns.findIndex(c => c.field === sourceField);
    const targetIndex = this.state.columns.findIndex(c => c.field === targetField);
    
    if (sourceIndex === -1 || targetIndex === -1) return;
    
    const [removed] = this.state.columns.splice(sourceIndex, 1);
    this.state.columns.splice(targetIndex, 0, removed);
    
    this.invalidateColumnCache();
    this.render();
    this.events.onColumnReorder?.(sourceField, sourceIndex, targetIndex);
  }

  private showColumnMenu(column: ColumnDefinition, anchor: HTMLElement): void {
    this.closeColumnMenu();
    this.closeFilterPopup();

    const menu = createElement('div', 'velox-column-menu');
    const rect = anchor.getBoundingClientRect();
    const gridRect = this.rootElement.getBoundingClientRect();

    menu.style.top = `${rect.bottom - gridRect.top + 5}px`;
    menu.style.left = `${rect.left - gridRect.left}px`;

    // Create context for custom menu items
    const context: ContextMenuContext = {
      field: column.field,
      column,
      selectedRows: this.getSelectedRows(),
      selectedCells: this.getSelectedCells(),
      grid: this,
    };

    // Get menu items (custom or default)
    const menuConfig = this.options.contextMenu;
    const showDefault = menuConfig?.showDefaultItems !== false;
    const customItems = menuConfig?.headerItems || [];

    // Default menu items
    const defaultItems: ContextMenuItem[] = [
      { id: 'sort-asc', label: '오름차순 정렬', icon: '↑', action: () => this.sort(column.field, 'asc') },
      { id: 'sort-desc', label: '내림차순 정렬', icon: '↓', action: () => this.sort(column.field, 'desc') },
      { id: 'sort-clear', label: '정렬 해제', icon: '✕', action: () => this.clearSort() },
      { type: 'separator' },
      { id: 'hide', label: '컬럼 숨기기', icon: '👁', action: () => this.hideColumn(column.field) },
      { id: 'autofit', label: '컬럼 너비 자동', icon: '↔', action: () => this.autoFitColumn(column.field) },
      { id: 'autofit-all', label: '모든 컬럼 자동', icon: '⇔', action: () => this.autoFitAllColumns() },
      { type: 'separator' },
      { id: 'fix-left', label: '왼쪽에 고정', icon: '◀', action: () => this.fixColumn(column.field, 'left') },
      { id: 'unfix', label: '고정 해제', icon: '◇', action: () => this.fixColumn(column.field, false) },
    ];

    // Combine items
    let items: ContextMenuItem[] = [];
    if (showDefault) {
      items = [...defaultItems];
      if (customItems.length > 0) {
        items.push({ type: 'separator' });
        items.push(...customItems);
      }
    } else {
      items = customItems;
    }

    // Render menu items
    items.forEach(item => {
      // Check visibility
      const isVisible = typeof item.visible === 'function' 
        ? item.visible(context) 
        : item.visible !== false;
      if (!isVisible) return;

      if (item.type === 'separator') {
        const sep = createElement('div', 'velox-column-menu-separator');
        menu.appendChild(sep);
      } else {
        const menuItem = createElement('div', 'velox-column-menu-item');
        if (item.className) addClass(menuItem, item.className);
        
        // Check disabled state
        const isDisabled = typeof item.disabled === 'function'
          ? item.disabled(context)
          : item.disabled === true;
        if (isDisabled) addClass(menuItem, 'velox-column-menu-item--disabled');

        // Build item content
        let html = '';
        if (item.icon) html += `<span class="velox-column-menu-icon">${item.icon}</span>`;
        html += `<span class="velox-column-menu-label">${item.label || ''}</span>`;
        if (item.shortcut) html += `<span class="velox-column-menu-shortcut">${item.shortcut}</span>`;
        menuItem.innerHTML = html;

        if (!isDisabled) {
          menuItem.addEventListener('click', () => {
            item.action?.(context);
            this.closeColumnMenu();
          });
        }
        menu.appendChild(menuItem);
      }
    });

    this.columnMenuPopup = menu;
    this.rootElement.appendChild(menu);

    // Add outside click listener with delay to avoid immediate close
    setTimeout(() => document.addEventListener('click', this.handleOutsideClick), 0);
  }

  private closeColumnMenu(): void {
    if (this.columnMenuPopup) {
      this.columnMenuPopup.remove();
      this.columnMenuPopup = null;
    }
    // Only remove listener if no popups are open
    if (!this.filterPopup) {
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  private startColumnDrag(e: MouseEvent, column: ColumnDefinition): void {
    e.preventDefault();
    e.stopPropagation();
    
    this.columnDragging = {
      field: column.field,
      startX: e.clientX,
      element: null,
    };
    
    const indicator = createElement('div', 'velox-column-drag-indicator');
    indicator.textContent = column.header;
    indicator.style.position = 'fixed';
    indicator.style.left = `${e.clientX}px`;
    indicator.style.top = `${e.clientY}px`;
    document.body.appendChild(indicator);
    this.columnDragging.element = indicator;

    document.addEventListener('mousemove', this.boundHandleColumnDragMove);
    document.addEventListener('mouseup', this.boundHandleColumnDragEnd);
    addClass(document.body, 'velox-no-select');
  }

  private handleColumnDragMove(e: MouseEvent): void {
    if (!this.columnDragging?.element) return;
    
    this.columnDragging.element.style.left = `${e.clientX + 10}px`;
    this.columnDragging.element.style.top = `${e.clientY + 10}px`;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const headerCell = target?.closest('.velox-header-cell') as HTMLElement;
    
    this.headerElement.querySelectorAll('.velox-header-cell--drop-target').forEach(el => {
      removeClass(el as HTMLElement, 'velox-header-cell--drop-target');
    });
    
    if (headerCell && headerCell.dataset.field !== this.columnDragging.field) {
      addClass(headerCell, 'velox-header-cell--drop-target');
    }
  }

  private handleColumnDragEnd(e: MouseEvent): void {
    if (!this.columnDragging) return;
    
    const sourceField = this.columnDragging.field;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const headerCell = target?.closest('.velox-header-cell') as HTMLElement;
    const targetField = headerCell?.dataset.field;
    
    if (this.columnDragging.element) {
      this.columnDragging.element.remove();
    }
    this.headerElement.querySelectorAll('.velox-header-cell--drop-target').forEach(el => {
      removeClass(el as HTMLElement, 'velox-header-cell--drop-target');
    });
    
    document.removeEventListener('mousemove', this.boundHandleColumnDragMove);
    document.removeEventListener('mouseup', this.boundHandleColumnDragEnd);
    removeClass(document.body, 'velox-no-select');
    
    if (targetField && targetField !== sourceField) {
      this.reorderColumn(sourceField, targetField);
    }
    
    this.columnDragging = null;
  }

  // ============================================
  // Phase 11: Row Drag & Drop
  // ============================================

  /**
   * Move row to new position
   */
  moveRow(fromIndex: number, toIndex: number): void {
    const displayRow = this.state.displayData[fromIndex];
    if (!displayRow) return;
    
    const dataIndex = this.state.data.indexOf(displayRow);
    if (dataIndex === -1) return;
    
    const targetDisplayRow = this.state.displayData[toIndex];
    const targetDataIndex = targetDisplayRow ? this.state.data.indexOf(targetDisplayRow) : this.state.data.length;
    
    const [removed] = this.state.data.splice(dataIndex, 1);
    const adjustedTargetIndex = targetDataIndex > dataIndex ? targetDataIndex - 1 : targetDataIndex;
    this.state.data.splice(adjustedTargetIndex, 0, removed);
    
    this.rebuildDataIndexMap();
    this.applyDataTransformations();
    this.render();
    this.events.onDataChange?.(this.state.data);
  }

  private startRowDrag(e: MouseEvent, rowIndex: number, rowElement: HTMLElement): void {
    e.preventDefault();
    e.stopPropagation();
    
    this.rowDragging = {
      index: rowIndex,
      startY: e.clientY,
      element: null,
    };
    
    const indicator = createElement('div', 'velox-row-drag-indicator');
    indicator.textContent = `행 ${rowIndex + 1}`;
    indicator.style.position = 'fixed';
    indicator.style.left = `${e.clientX}px`;
    indicator.style.top = `${e.clientY}px`;
    document.body.appendChild(indicator);
    this.rowDragging.element = indicator;
    
    addClass(rowElement, 'velox-row--dragging');

    document.addEventListener('mousemove', this.boundHandleRowDragMove);
    document.addEventListener('mouseup', this.boundHandleRowDragEnd);
    addClass(document.body, 'velox-no-select');
  }

  private handleRowDragMove(e: MouseEvent): void {
    if (!this.rowDragging?.element) return;
    
    this.rowDragging.element.style.left = `${e.clientX + 10}px`;
    this.rowDragging.element.style.top = `${e.clientY + 10}px`;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const rowElement = target?.closest('.velox-row') as HTMLElement;
    
    this.bodyInner.querySelectorAll('.velox-row--drop-target').forEach(el => {
      removeClass(el as HTMLElement, 'velox-row--drop-target');
    });
    this.fixedLeftBodyInner?.querySelectorAll('.velox-row--drop-target').forEach(el => {
      removeClass(el as HTMLElement, 'velox-row--drop-target');
    });
    
    if (rowElement) {
      const targetIndex = parseInt(rowElement.dataset.rowIndex || '-1', 10);
      if (targetIndex !== -1 && targetIndex !== this.rowDragging.index) {
        addClass(rowElement, 'velox-row--drop-target');
      }
    }
  }

  private handleRowDragEnd(e: MouseEvent): void {
    if (!this.rowDragging) return;
    
    const sourceIndex = this.rowDragging.index;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const rowElement = target?.closest('.velox-row') as HTMLElement;
    const targetIndex = rowElement ? parseInt(rowElement.dataset.rowIndex || '-1', 10) : -1;
    
    if (this.rowDragging.element) {
      this.rowDragging.element.remove();
    }
    this.bodyInner.querySelectorAll('.velox-row--dragging, .velox-row--drop-target').forEach(el => {
      removeClass(el as HTMLElement, 'velox-row--dragging');
      removeClass(el as HTMLElement, 'velox-row--drop-target');
    });
    this.fixedLeftBodyInner?.querySelectorAll('.velox-row--dragging, .velox-row--drop-target').forEach(el => {
      removeClass(el as HTMLElement, 'velox-row--dragging');
      removeClass(el as HTMLElement, 'velox-row--drop-target');
    });
    
    document.removeEventListener('mousemove', this.boundHandleRowDragMove);
    document.removeEventListener('mouseup', this.boundHandleRowDragEnd);
    removeClass(document.body, 'velox-no-select');
    
    if (targetIndex !== -1 && targetIndex !== sourceIndex) {
      this.moveRow(sourceIndex, targetIndex);
    }
    
    this.rowDragging = null;
  }

  destroy(): void {
    document.removeEventListener('mousemove', this.boundHandleResizeMove);
    document.removeEventListener('mouseup', this.boundHandleResizeEnd);
    document.removeEventListener('mouseup', this.boundHandleBlockSelectionEnd);
    document.removeEventListener('click', this.handleOutsideClick);
    this.rootElement.removeEventListener('keydown', this.boundHandleKeyDown);
    // Clean up cached canvas
    this.measureCanvas = null;
    this.measureContext = null;
    // Phase 12.3: Cleanup tooltip
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
    this.container.innerHTML = '';
    this.events.onDestroy?.();
  }
}