/**
 * VeloxGrid - Core Grid Class v6.0
 * 
 * A lightweight, high-performance data grid library
 * 
 * Architecture:
 * - Modular design with delegated components
 * - GridRenderer: Rendering (header, body, cells)
 * - GridFilterPopup: Filter UI
 * - GridColumnMenu: Column context menu
 * - GridDragManager: Column/Row drag & resize
 * - GridHistory: Undo/Redo management
 * - Column caching for performance
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
  GridContext,
} from '../types';
import { createElement, addClass, throttle } from '../utils/dom';
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
import { GridRenderer } from './GridRenderer';
import { GridFilterPopup } from './GridFilterPopup';
import { GridColumnMenu } from './GridColumnMenu';
import { GridDragManager } from './GridDragManager';
import { GridSummary } from './GridSummary';

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

export class VeloxGrid implements VeloxGridInstance, GridContext {
  private container: HTMLElement;
  private options: GridOptions;
  private state: GridState;
  private events: GridEvents;
  private gridId: string;

  // DOM Elements - public for GridContext access
  public rootElement!: HTMLElement;
  public headerElement!: HTMLElement;
  public bodyElement!: HTMLElement;
  public bodyInner!: HTMLElement;
  public footerElement: HTMLElement | null = null;
  public fixedLeftFooter: HTMLElement | null = null;
  public loadingOverlay: HTMLElement | null = null;
  public fixedLeftContainer: HTMLElement | null = null;
  public fixedLeftHeader: HTMLElement | null = null;
  public fixedLeftBody: HTMLElement | null = null;
  public fixedLeftBodyInner: HTMLElement | null = null;

  // Internal state
  private blockSelecting: { startRow: number; startField: string } | null = null;

  // Cached canvas for text measurement (performance optimization)
  private measureCanvas: HTMLCanvasElement | null = null;
  private measureContext: CanvasRenderingContext2D | null = null;

  // Bound event handlers (avoid creating new functions on each call)
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

  // Undo/Redo - using GridHistory (refactored)
  private history: GridHistory;
  private tooltip: GridTooltip | null = null;
  
  // Edit mode document click handler cleanup
  private editModeCleanup: (() => void) | null = null;

  // Modularized components
  private renderer: GridRenderer;
  private filterPopupManager: GridFilterPopup;
  private columnMenuManager: GridColumnMenu;
  private dragManager: GridDragManager;
  private summary: GridSummary;

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
    this.boundHandleBlockSelectionEnd = this.handleBlockSelectionEnd.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);

    // Initialize history manager (refactored from inline stacks)
    this.history = new GridHistory({
      enabled: this.options.undoable ?? true,
      maxSize: this.options.undoStackSize ?? 50,
    });

    // Initialize modularized components
    this.renderer = new GridRenderer(this);
    this.filterPopupManager = new GridFilterPopup(this);
    this.columnMenuManager = new GridColumnMenu(this);
    this.dragManager = new GridDragManager(this);
    this.summary = new GridSummary(this);

    this.state = {
      data: [],
      displayData: [],
      columns: this.options.columns.map(col => ({ ...col })),
      selection: {
        selectedRows: new Set<number>(),
        selectedCells: new Set<string>(),
        focusedCell: null,
        selections: [],
        lastSelectedRow: null,
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
    this.tooltip = new GridTooltip(this.rootElement);
    this.render();
    this.attachEvents();
    this.events.onReady?.(this);
  }

  // GridContext: Data index methods (public for module access)
  rebuildDataIndexMap(): void {
    this.dataIndexMap.clear();
    this.state.data.forEach((row, index) => {
      this.dataIndexMap.set(row, index);
    });
  }

  initCheckableRows(): void {
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

  // GridContext: Column cache methods (public for module access)
  invalidateColumnCache(): void {
    this.columnCache.dirty = true;
    this.columnCache.visible = null;
    this.columnCache.fixedLeft = null;
    this.columnCache.scrollable = null;
  }

  getFixedLeftColumns(): ColumnDefinition[] {
    if (this.columnCache.dirty || !this.columnCache.fixedLeft) {
      this.columnCache.fixedLeft = this.state.columns.filter(
        col => col.fixed === 'left' && col.visible !== false
      );
    }
    return this.columnCache.fixedLeft;
  }

  getScrollableColumns(): ColumnDefinition[] {
    if (this.columnCache.dirty || !this.columnCache.scrollable) {
      this.columnCache.scrollable = this.state.columns.filter(
        col => col.fixed !== 'left' && col.visible !== false
      );
      this.columnCache.dirty = false; // Mark as clean after all queries
    }
    return this.columnCache.scrollable;
  }

  getVisibleColumns(): ColumnDefinition[] {
    if (this.columnCache.dirty || !this.columnCache.visible) {
      this.columnCache.visible = this.state.columns.filter(col => col.visible !== false);
    }
    return this.columnCache.visible;
  }

  hasFixedLeft(): boolean {
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
      
      // Phase 13: Footer Summary for fixed left
      if (this.options.footerSummary?.visible) {
        this.fixedLeftFooter = createElement('div', 'velox-footer velox-footer--fixed');
        this.fixedLeftContainer.appendChild(this.fixedLeftFooter);
      }
      
      wrapper.appendChild(this.fixedLeftContainer);
    }

    const mainSection = createElement('div', 'velox-main');
    this.headerElement = createElement('div', 'velox-header');
    this.bodyElement = createElement('div', 'velox-body');
    this.bodyInner = createElement('div', 'velox-body-inner');
    this.bodyElement.appendChild(this.bodyInner);
    mainSection.appendChild(this.headerElement);
    mainSection.appendChild(this.bodyElement);
    
    // Phase 13: Footer Summary
    if (this.options.footerSummary?.visible) {
      this.footerElement = createElement('div', 'velox-footer');
      mainSection.appendChild(this.footerElement);
    }
    
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

  // GridContext: Virtual scroll methods (public for module access)
  calculateVirtualState(): void {
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

  getVisibleRows(): { data: RowData; index: number }[] {
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

  // GridContext: Rendering methods - delegated to GridRenderer
  render(): void {
    console.log('🔄 render() called', { editing: this.state.edit.editing, rowIndex: this.state.edit.rowIndex, field: this.state.edit.field });
    this.renderer.render();
  }

  renderHeader(): void {
    this.renderer.renderHeader();
  }
  renderBody(): void {
    this.renderer.renderBody();
  }

  updateLoadingState(): void {
    this.renderer.updateLoadingState();
  }

  // GridContext: Filter popup methods - delegated to GridFilterPopup
  showFilterPopup(column: ColumnDefinition, anchor: HTMLElement): void {
    this.filterPopupManager.showFilterPopup(column, anchor);
  }

  closeFilterPopup(): void {
    this.filterPopupManager.closeFilterPopup();
  }

  applyColumnFilter(field: string, operator: FilterOperator, value: CellValue): void {
    this.filterPopupManager.applyColumnFilter(field, operator, value);
  }

  removeColumnFilter(field: string): void {
    this.filterPopupManager.removeColumnFilter(field);
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
    document.addEventListener('mouseup', this.boundHandleBlockSelectionEnd);
    this.rootElement.addEventListener('keydown', this.boundHandleKeyDown);
  }

  handleSort(field: string): void {
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

  // GridContext: Event handlers (public for module access)
  handleRowClick(rowIndex: number, e: MouseEvent): void {
    if (!this.options.selectable) return;
    
    const selectionStyle = this.options.selectionStyle || 'row';
    
    if (selectionStyle === 'row') {
      this.handleRowSelection(rowIndex, e);
    }
    
    this.events.onRowClick?.(rowIndex, this.state.displayData[rowIndex]);
  }

  handleRowSelection(rowIndex: number, e: MouseEvent): void {
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

  handleCellClick(rowIndex: number, field: string, value: CellValue, e: MouseEvent): void {
    console.log('🔍 handleCellClick', { rowIndex, field, editing: this.state.edit.editing, editRow: this.state.edit.rowIndex, editField: this.state.edit.field });
    
    // 편집 중인 셀을 클릭하면 편집 모드 유지
    if (this.state.edit.editing && 
        this.state.edit.rowIndex === rowIndex && 
        this.state.edit.field === field) {
      console.log('✅ Same cell clicked - maintaining edit mode');
      return;
    }
    
    const selectionStyle = this.options.selectionStyle || 'row';
    
    if (selectionStyle === 'cell' || selectionStyle === 'block') {
      this.handleCellSelection(rowIndex, field, e);
    }
    
    this.events.onCellClick?.(rowIndex, field, value);
  }

  handleCellSelection(rowIndex: number, field: string, e: MouseEvent): void {
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

  selectCellRange(startRow: number, startField: string, endRow: number, endField: string): void {
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

  // GridContext: Block selection methods (public for module access)
  startBlockSelection(rowIndex: number, field: string): void {
    if (this.options.selectionStyle !== 'block') return;
    
    this.blockSelecting = { startRow: rowIndex, startField: field };
    this.state.selection.focusedCell = { rowIndex, field };
    this.state.selection.selectedCells.clear();
    this.state.selection.selectedCells.add(`${rowIndex}:${field}`);
    this.render();
  }

  updateBlockSelection(rowIndex: number, field: string): void {
    if (!this.blockSelecting) return;
    
    this.selectCellRange(
      this.blockSelecting.startRow,
      this.blockSelecting.startField,
      rowIndex,
      field
    );
    this.render();
  }

  handleBlockSelectionEnd(): void {
    if (this.blockSelecting) {
      this.blockSelecting = null;
      this.events.onCellSelectionChange?.(this.getSelectedCells());
    }
  }

  handleRowDoubleClick(rowIndex: number, _e: MouseEvent): void {
    this.events.onRowDoubleClick?.(rowIndex, this.state.displayData[rowIndex]);
  }

  handleKeyDown(e: KeyboardEvent): void {
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

  // GridContext: Resize methods - delegated to GridDragManager
  startResize(e: MouseEvent, column: ColumnDefinition): void {
    this.dragManager.startResize(e, column);
  }

  // GridContext: Data transformation (public for module access)
  applyDataTransformations(): void {
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
  // GridContext: Selection state clearing (public for module access)
  clearSelectionState(): void {
    this.state.selection.selectedRows.clear();
    this.state.selection.selectedCells.clear();
    this.state.selection.focusedCell = null;
  }

  // --- Public API: Data Methods ---

  getData(): RowData[] {
    return this.state.data.map(row => ({ ...row }));
  }
  
  setData(data: RowData[]): void {
    this.state.data = data.map(row => ({ ...row }));
    this.rebuildDataIndexMap();
    this.clearSelectionState();
    this.state.checkBar.checkedRows.clear();
    this.summary.invalidateCache();
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

  // --- Public API: Row Selection ---

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

  // --- Public API: Cell Selection ---

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

  // --- Public API: CheckBar ---

  checkItem(index: number, checked = true): void {
    console.log('🔵 checkItem START', { index, checked, currentEditState: this.state.edit });
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
    
    // Edit 상태 보존하면서 render
    const editState = { ...this.state.edit };
    console.log('💾 Saved edit state before render', editState);
    this.render();
    console.log('🔄 Render complete, edit state after render', this.state.edit);
    
    // Edit 중이었다면 상태 복원 및 재렌더링
    if (editState.editing && editState.rowIndex !== null && editState.field !== null) {
      console.log('♻️ Restoring edit state', editState);
      this.state.edit = editState;
      this.renderEditCell(editState.rowIndex, editState.field, editState.originalValue);
    }
    
    this.events.onCheckChange?.(index, checked);
    console.log('🔵 checkItem END');
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

  // --- Public API: Sort ---

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

  // --- Public API: Filter ---

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

  // --- Public API: Edit ---

  startEdit(rowIndex: number, field: string): void {
    console.log('🎬 startEdit called', { rowIndex, field, editable: this.options.editable });
    if (!this.options.editable) return;
    
    // 이미 같은 셀을 편집 중이면 무시
    if (this.state.edit.editing && 
        this.state.edit.rowIndex === rowIndex && 
        this.state.edit.field === field) {
      console.log('⚠️ Already editing this cell - ignoring startEdit');
      return;
    }
    
    const column = this.state.columns.find(c => c.field === field);
    console.log('📋 Column found', { column: column?.field, editable: column?.editable });
    if (!column || column.editable === false) return;
    if (this.state.edit.editing) this.endEdit(true);
    const value = this.state.displayData[rowIndex]?.[field];
    this.state.edit = { editing: true, rowIndex, field, originalValue: value };
    console.log('✅ Edit state updated', this.state.edit);
    this.events.onCellEditStart?.(rowIndex, field, value);
    this.renderEditCell(rowIndex, field, value);
  }

  renderEditCell(rowIndex: number, field: string, value: CellValue): void {
    console.log('🎨 renderEditCell START', { rowIndex, field, value, currentEditState: this.state.edit });
    
    // 이전 edit mode의 document 리스너 정리
    if (this.editModeCleanup) {
      console.log('🧹 Cleaning up previous edit mode listener');
      this.editModeCleanup();
      this.editModeCleanup = null;
    }
    
    const row = this.bodyInner.querySelector(`[data-row-index="${rowIndex}"]`);
    const cell = row?.querySelector(`[data-field="${field}"]`) as HTMLElement;
    console.log('🔍 Cell element found', { cell: !!cell, hasClass: cell?.classList.contains('velox-cell--editing') });
    if (!cell) return;

    const column = this.state.columns.find(c => c.field === field);
    if (!column) return;

    addClass(cell, 'velox-cell--editing');
    console.log('✅ Added velox-cell--editing class', { classList: Array.from(cell.classList) });
    
    // Document click으로 외부 클릭 감지 (cell/input 클릭은 제외)
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!cell.contains(target)) {
        console.log('🌍 Outside click detected - ending edit');
        this.editModeCleanup = null; // cleanup 실행됨
        document.removeEventListener('mousedown', handleOutsideClick);
        this.endEdit(true);
      } else {
        console.log('📦 Inside cell click - maintaining edit mode');
      }
    };
    
    // cleanup 함수 저장
    this.editModeCleanup = () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
    
    setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 0);

    // Phase 12.2: Use GridEditorFactory if editor is specified
    if (column.editor) {
      const editor = GridEditorFactory.createEditor(
        value,
        column.editor,
        (newValue) => {
          // Save callback
          console.log('💾 Editor save callback', { newValue, editing: this.state.edit.editing });
          
          // 데이터 업데이트
          const row = this.state.displayData[rowIndex];
          if (row) {
            const dataIndex = this.state.data.indexOf(row);
            if (dataIndex >= 0) {
              this.state.data[dataIndex][field] = newValue;
            }
          }
          
          // Checkbox editor는 edit 모드를 유지 (즉시 종료하지 않음)
          if (column.editor?.type === 'checkbox') {
            console.log('✅ Checkbox editor - maintaining edit mode, new value:', newValue);
            
            // originalValue를 새 값으로 업데이트 (다음 렌더링에서 사용)
            this.state.edit.originalValue = newValue;
            
            // Edit 상태 유지하면서 데이터만 업데이트
            this.applyDataTransformations();
            
            // Edit 상태 보존
            const editState = { ...this.state.edit };
            this.render();
            
            // Edit 모드 복원 (새 값으로 렌더링)
            if (editState.editing) {
              this.state.edit = editState;
              this.renderEditCell(editState.rowIndex!, editState.field!, newValue);
            }
          } else {
            // 다른 editor는 기존대로 edit 종료
            console.log('🛑 Other editor - ending edit mode');
            this.state.edit.editing = false;
            this.applyDataTransformations();
            this.render();
          }
          
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
      
      // 편집 중인 editor 클릭 로그용
      editor.addEventListener('mousedown', () => {
        console.log('🖱️ Editor mousedown');
      });
      
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
      
      // Input mousedown 로그용
      input.addEventListener('mousedown', () => {
        console.log('🖱️ Input mousedown');
      });

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
    console.log('🛑 endEdit called', { save, editing: this.state.edit.editing });
    
    // Document 리스너 정리
    if (this.editModeCleanup) {
      console.log('🧹 Cleaning up edit mode listener on endEdit');
      this.editModeCleanup();
      this.editModeCleanup = null;
    }
    
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

  // --- Public API: Column ---

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

  // GridContext: Text measurement (public for module access)
  measureTextWidth(text: string, font?: string): number {
    // Reuse canvas instance for better performance
    if (!this.measureCanvas) {
      this.measureCanvas = document.createElement('canvas');
      this.measureContext = this.measureCanvas.getContext('2d');
    }
    if (!this.measureContext) return 100;
    
    // Apply font if provided, otherwise use default
    this.measureContext.font = font || '14px sans-serif';
    return this.measureContext.measureText(text).width;
  }

  // --- Public API: Scroll ---

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

  // --- Public API: Clipboard ---

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

  // --- Public API: Undo/Redo ---

  pushUndo(action: UndoAction): void {
    this.history.push(action);
  }

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

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  clearHistory(): void {
    this.history.clear();
  }

  // --- Public API: Delete ---

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

  deleteSelectedRows(): void {
    const selectedRows = this.getSelectedRows();
    if (selectedRows.length === 0) return;
    
    // Sort in reverse order to delete from end first
    const sortedRows = [...selectedRows].sort((a, b) => b - a);
    
    sortedRows.forEach(index => {
      this.removeRow(index);
    });
  }

  // --- Public API: Export/Import ---

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
      // Invalidate summary cache
      this.summary.invalidateCache();
      this.applyDataTransformations();
      this.render();
      this.events.onDataChange?.(this.state.data);
    }
  }

  // ============================================
  // Phase 13: Summary Methods
  // ============================================

  /**
   * Get summary value for a specific field
   * @param field Column field name
   * @returns Calculated summary value
   */
  getSummaryValue(field: string): CellValue {
    return this.summary.getSummaryValue(field);
  }

  /**
   * Get all summary values
   * @returns Object with field names as keys and summary values
   */
  getSummaryValues(): Record<string, CellValue> {
    return this.summary.getAllSummaryValues();
  }

  /**
   * Refresh summary calculations (clear cache)
   */
  refreshSummary(): void {
    this.summary.invalidateCache();
    this.render();
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

  // GridContext: Column menu methods - delegated to GridColumnMenu
  showColumnMenu(column: ColumnDefinition, anchor: HTMLElement): void {
    this.closeFilterPopup();
    this.columnMenuManager.showColumnMenu(column, anchor);
  }

  closeColumnMenu(): void {
    this.columnMenuManager.closeColumnMenu();
  }

  // GridContext: Column drag methods - delegated to GridDragManager
  startColumnDrag(e: MouseEvent, column: ColumnDefinition): void {
    this.dragManager.startColumnDrag(e, column);
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

  // GridContext: Row drag methods - delegated to GridDragManager
  startRowDrag(e: MouseEvent, rowIndex: number, rowElement: HTMLElement): void {
    this.dragManager.startRowDrag(e, rowIndex, rowElement);
  }

  // ============================================
  // GridContext Implementation
  // ============================================

  /** GridContext: 그리드 상태 반환 */
  getState(): GridState {
    return this.state;
  }

  /** GridContext: 이벤트 핸들러 반환 */
  getEvents(): GridEvents {
    return this.events;
  }

  /** GridContext: 그리드 고유 ID 반환 */
  getGridId(): string {
    return this.gridId;
  }

  /** GridContext: 표시 데이터 반환 */
  getDisplayData(): RowData[] {
    return this.state.displayData;
  }

  /** GridContext: 가상 스크롤 상태 반환 */
  getVirtualState(): typeof this.virtualState {
    return this.virtualState;
  }

  /** GridContext: 이벤트 발행 헬퍼 */
  emitEvent<K extends keyof GridEvents>(
    event: K, 
    ...args: Parameters<NonNullable<GridEvents[K]>>
  ): void {
    const handler = this.events[event];
    if (handler) {
      (handler as (...args: any[]) => void)(...args);
    }
  }

  // ============================================
  // GridContext: Internal Handlers
  // ============================================

  /** GridContext: Block selection 상태 확인 */
  isBlockSelecting(): boolean {
    return this.blockSelecting !== null;
  }

  /** GridContext: Tooltip 표시 */
  showTooltip(cell: HTMLElement, value: CellValue, rowData: RowData, column: ColumnDefinition): void {
    if (this.tooltip) {
      this.tooltip.show(cell, value, rowData, column);
    }
  }

  /** GridContext: Tooltip 숨기기 */
  hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.hide();
    }
  }

  destroy(): void {
    // Clean up drag manager resources
    this.dragManager.destroy();
    document.removeEventListener('mouseup', this.boundHandleBlockSelectionEnd);
    // Close any open popups
    this.closeFilterPopup();
    this.closeColumnMenu();
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