/**
 * GridRenderer - Rendering Module
 * Phase 8: Code Structure Optimization
 * 
 * VeloxGrid의 렌더링 로직을 담당하는 모듈
 * - Header, Body, Cell 렌더링
 * - Row 생성 및 업데이트
 */

import type { ColumnDefinition, RowData, GridContext } from '../types';
import { createElement, addClass } from '../utils/dom';
import { formatValue } from '../utils/data';

export class GridRenderer {
  constructor(private ctx: GridContext) {}

  /**
   * 전체 그리드 렌더링
   */
  render(): void {
    const state = this.ctx.getState();
    console.log('🎨 GridRenderer.render() called', { editing: state.edit.editing });
    this.renderHeader();
    this.renderBody();
    this.updateLoadingState();
    console.log('🎨 GridRenderer.render() completed', { editing: state.edit.editing });
  }

  /**
   * 헤더 렌더링
   */
  renderHeader(): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();

    // Fixed left header
    if (ctx.fixedLeftHeader) {
      ctx.fixedLeftHeader.innerHTML = '';
      const headerRow = createElement('div', 'velox-header-row');
      
      if (options.checkBar?.visible) {
        headerRow.appendChild(this.createHeaderCheckbarCell());
      }
      
      if (options.showRowNumbers) {
        const rowNumCell = createElement('div', 'velox-header-cell velox-rownumber-cell');
        rowNumCell.textContent = '#';
        headerRow.appendChild(rowNumCell);
      }
      
      ctx.getFixedLeftColumns().forEach((col: ColumnDefinition) => 
        headerRow.appendChild(this.createHeaderCell(col))
      );
      ctx.fixedLeftHeader.appendChild(headerRow);
    }

    // Scrollable header
    const headerRow = createElement('div', 'velox-header-row');
    ctx.getScrollableColumns().forEach((col: ColumnDefinition) => 
      headerRow.appendChild(this.createHeaderCell(col))
    );
    ctx.headerElement.innerHTML = '';
    ctx.headerElement.appendChild(headerRow);
  }

  /**
   * CheckBar 헤더 셀 생성
   */
  private createHeaderCheckbarCell(): HTMLElement {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
    const cell = createElement('div', 'velox-header-cell velox-checkbox-cell');
    const checkBar = options.checkBar!;
    
    if (checkBar.showAll && !checkBar.exclusive) {
      const checkbox = createElement('input', 'velox-checkbox') as HTMLInputElement;
      checkbox.type = 'checkbox';
      
      const checkableCount = state.checkBar.checkableRows.size;
      const checkedCount = state.checkBar.checkedRows.size;
      const allChecked = checkableCount > 0 && checkedCount === checkableCount;
      const someChecked = checkedCount > 0 && !allChecked;
      
      checkbox.checked = allChecked;
      checkbox.indeterminate = someChecked;
      checkbox.addEventListener('change', () => ctx.checkAll(checkbox.checked));
      cell.appendChild(checkbox);
    } else if (checkBar.exclusive) {
      const label = createElement('span', 'velox-checkbox-label');
      label.textContent = '선택';
      cell.appendChild(label);
    }
    
    return cell;
  }

  /**
   * 헤더 셀 생성
   */
  createHeaderCell(column: ColumnDefinition): HTMLElement {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
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
    if (options.sortable && column.sortable !== false) {
      addClass(cell, 'velox-header-cell--sortable');
      const sortState = state.sort.find((s: any) => s.field === column.field);
      if (sortState?.direction) addClass(cell, 'velox-header-cell--sorted');
    }

    const contentWrapper = createElement('div', 'velox-header-content');
    
    // Column drag handle
    const dragHandle = createElement('span', 'velox-column-drag-handle');
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.title = '드래그하여 컬럼 순서 변경';
    dragHandle.addEventListener('mousedown', (e) => ctx.startColumnDrag(e, column));
    contentWrapper.appendChild(dragHandle);
    
    const text = createElement('span', 'velox-header-text');
    text.textContent = column.header;
    contentWrapper.appendChild(text);

    // Sort icon
    if (options.sortable && column.sortable !== false) {
      const sortIcon = createElement('span', 'velox-sort-icon');
      const sortState = state.sort.find((s: any) => s.field === column.field);
      
      if (sortState?.direction === 'asc') {
        addClass(sortIcon, 'velox-sort-icon--asc');
        sortIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>`;
      } else if (sortState?.direction === 'desc') {
        addClass(sortIcon, 'velox-sort-icon--desc');
        sortIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>`;
      } else {
        sortIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>`;
      }
      
      contentWrapper.appendChild(sortIcon);
      contentWrapper.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        ctx.handleSort(column.field); 
      });
    }

    cell.appendChild(contentWrapper);

    // Filter button
    if (options.filterable && column.filterable !== false) {
      const filterBtn = createElement('button', 'velox-filter-btn');
      filterBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>`;
      const hasFilter = state.filter?.conditions.some((c: any) => c.field === column.field);
      if (hasFilter) addClass(filterBtn, 'velox-filter-btn--active');
      filterBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        ctx.showFilterPopup(column, filterBtn);
      });
      cell.appendChild(filterBtn);
    }
    
    // Column menu button
    const menuBtn = createElement('button', 'velox-column-menu-btn');
    menuBtn.innerHTML = '⋯';
    menuBtn.title = '컬럼 메뉴';
    menuBtn.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      ctx.showColumnMenu(column, menuBtn);
    });
    cell.appendChild(menuBtn);

    // Resize handle
    if (options.resizable && column.resizable !== false) {
      const handle = createElement('div', 'velox-resize-handle');
      handle.addEventListener('mousedown', (e) => ctx.startResize(e, column));
      cell.appendChild(handle);
    }

    return cell;
  }

  /**
   * 바디 렌더링
   */
  renderBody(): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const visibleRows = ctx.getVisibleRows();
    const virtualState = ctx.getVirtualState();
    const rowHeight = options.rowHeight || 40;

    // Fixed left body
    if (ctx.fixedLeftBodyInner) {
      ctx.fixedLeftBodyInner.innerHTML = '';
      if (options.virtualScroll) {
        ctx.fixedLeftBodyInner.style.height = `${virtualState.totalHeight}px`;
        ctx.fixedLeftBodyInner.style.position = 'relative';
      } else {
        ctx.fixedLeftBodyInner.style.height = '';
        ctx.fixedLeftBodyInner.style.position = '';
      }

      visibleRows.forEach(({ data, index }) => {
        const row = this.createRowBase(data, index, true);
        if (options.virtualScroll) {
          row.style.position = 'absolute';
          row.style.top = `${index * rowHeight}px`;
          row.style.left = '0';
          row.style.right = '0';
        }
        ctx.fixedLeftBodyInner!.appendChild(row);
      });
    }

    // Scrollable body
    ctx.bodyInner.innerHTML = '';
    if (options.virtualScroll) {
      ctx.bodyInner.style.height = `${virtualState.totalHeight}px`;
      ctx.bodyInner.style.position = 'relative';
    } else {
      ctx.bodyInner.style.height = '';
      ctx.bodyInner.style.position = '';
    }

    if (visibleRows.length === 0) {
      const emptyDiv = createElement('div', 'velox-empty');
      emptyDiv.textContent = options.emptyMessage || '데이터가 없습니다.';
      ctx.bodyInner.appendChild(emptyDiv);
      return;
    }

    visibleRows.forEach(({ data, index }) => {
      const row = this.createRowBase(data, index, false);
      if (options.virtualScroll) {
        row.style.position = 'absolute';
        row.style.top = `${index * rowHeight}px`;
        row.style.left = '0';
        row.style.right = '0';
      }
      ctx.bodyInner.appendChild(row);
    });
  }

  /**
   * Row 생성 (통합 메서드)
   */
  createRowBase(rowData: RowData, rowIndex: number, isFixedLeft: boolean): HTMLElement {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
    const row = createElement('div', 'velox-row');
    row.dataset.rowIndex = String(rowIndex);

    // Alternating row style
    if (rowIndex % 2 === 1) addClass(row, 'velox-row--alt');
    
    // Selection state
    if (options.selectionStyle === 'row' && state.selection.selectedRows.has(rowIndex)) {
      addClass(row, 'velox-row--selected');
    }
    
    // CheckBar state
    if (isFixedLeft && state.checkBar.checkedRows.has(rowIndex)) {
      addClass(row, 'velox-row--checked');
    }

    // Row click handler
    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('velox-checkbox')) return;
      if (target.classList.contains('velox-row-drag-handle')) return;
      ctx.handleRowClick(rowIndex, e);
    });

    // Double click
    if (!isFixedLeft) {
      row.addEventListener('dblclick', (e) => ctx.handleRowDoubleClick(rowIndex, e));
    }

    // Fixed left content
    if (isFixedLeft) {
      // Row drag handle
      const dragHandle = createElement('div', 'velox-row-drag-handle');
      dragHandle.innerHTML = '☰';
      dragHandle.title = '드래그하여 행 순서 변경';
      dragHandle.addEventListener('mousedown', (e) => ctx.startRowDrag(e, rowIndex, row));
      row.appendChild(dragHandle);
      
      if (options.checkBar?.visible) {
        row.appendChild(this.createCheckbarCell(rowIndex));
      }
      
      if (options.showRowNumbers) {
        const rowNumCell = createElement('div', 'velox-cell velox-rownumber-cell');
        rowNumCell.textContent = String(rowIndex + 1);
        row.appendChild(rowNumCell);
      }
      
      ctx.getFixedLeftColumns().forEach((col: ColumnDefinition) => 
        row.appendChild(this.createCell(rowData, rowIndex, col))
      );
    } else {
      ctx.getScrollableColumns().forEach((col: ColumnDefinition) => 
        row.appendChild(this.createCell(rowData, rowIndex, col))
      );
    }

    return row;
  }

  /**
   * CheckBar 셀 생성
   */
  private createCheckbarCell(rowIndex: number): HTMLElement {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
    const cell = createElement('div', 'velox-cell velox-checkbox-cell');
    const checkBar = options.checkBar!;
    const isCheckable = state.checkBar.checkableRows.has(rowIndex);
    const isChecked = state.checkBar.checkedRows.has(rowIndex);
    
    const input = createElement('input', 'velox-checkbox') as HTMLInputElement;
    input.type = checkBar.exclusive ? 'radio' : 'checkbox';
    input.name = checkBar.exclusive ? `${ctx.getGridId()}-check` : '';
    input.checked = isChecked;
    input.disabled = !isCheckable;
    
    if (!isCheckable) {
      addClass(cell, 'velox-checkbox-cell--disabled');
    }
    
    input.addEventListener('click', (e) => {
      console.log('✅ Checkbox clicked', { rowIndex, checked: input.checked });
      e.stopPropagation();
    });
    input.addEventListener('change', () => {
      console.log('🔄 Checkbox changed', { rowIndex, checked: input.checked });
      if (checkBar.exclusive) {
        // Edit 상태 보존
        const editState = { ...ctx.getState().edit };
        
        state.checkBar.checkedRows.clear();
        if (input.checked) {
          state.checkBar.checkedRows.add(rowIndex);
        }
        this.render();
        
        // Edit 중이었다면 상태 복원
        if (editState.editing && editState.rowIndex !== null && editState.field !== null) {
          ctx.getState().edit = editState;
          ctx.renderEditCell(editState.rowIndex, editState.field, editState.originalValue);
        }
        
        ctx.emitEvent('onCheckChange', rowIndex, input.checked);
      } else {
        ctx.checkItem(rowIndex, input.checked);
      }
    });
    
    cell.appendChild(input);
    return cell;
  }

  /**
   * Cell 생성
   */
  createCell(rowData: RowData, rowIndex: number, column: ColumnDefinition): HTMLElement {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
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
    if (state.selection.selectedCells.has(cellKey)) {
      addClass(cell, 'velox-cell--selected');
    }
    
    const focusedCell = state.selection.focusedCell;
    if (focusedCell && focusedCell.rowIndex === rowIndex && focusedCell.field === column.field) {
      addClass(cell, 'velox-cell--focused');
    }

    if (options.editable && column.editable !== false) {
      addClass(cell, 'velox-cell--editable');
      cell.addEventListener('dblclick', (e) => { 
        // 이미 편집 중인 셀이면 더블클릭 무시
        if (cell.classList.contains('velox-cell--editing')) {
          console.log('🚫 Double click ignored - already editing');
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        console.log('🖱️🖱️ Double click detected', { rowIndex, field: column.field });
        e.stopPropagation(); 
        ctx.startEdit(rowIndex, column.field); 
      });
    }

    const value = rowData[column.field];
    const content = createElement('span', 'velox-cell-content');

    if (column.renderer) content.innerHTML = column.renderer(value, rowData, column);
    else if (column.formatter) content.textContent = column.formatter(value, rowData, column);
    else content.textContent = formatValue(value, column.type);

    cell.appendChild(content);
    
    cell.addEventListener('click', (e) => {
      // 편집 중인 셀이면 클릭 무시 (단, interactive 요소는 예외)
      if (cell.classList.contains('velox-cell--editing')) {
        const target = e.target as HTMLElement;
        // input, select, button 등 interactive 요소는 이벤트 허용하되 전파는 중단
        if (target.tagName === 'INPUT' || 
            target.tagName === 'SELECT' || 
            target.tagName === 'BUTTON' ||
            target.tagName === 'TEXTAREA') {
          console.log('✅ Interactive element click allowed during edit');
          e.stopPropagation(); // 상위로 전파 막기 (document까지 가지 않도록)
          return;
        }
        console.log('🚫 Cell click ignored - editing mode (cell background)');
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      ctx.handleCellClick(rowIndex, column.field, value, e);
    });
    
    cell.addEventListener('mousedown', (e) => {
      // 편집 중인 셀은 VeloxGrid에서 처리하므로 여기서는 무시
      if (cell.classList.contains('velox-cell--editing')) {
        console.log('🔒 Cell mousedown - editing mode (ignored in renderer)');
        return;
      }
      if (options.selectionStyle === 'block' && e.button === 0) {
        ctx.startBlockSelection(rowIndex, column.field);
      }
    });
    
    cell.addEventListener('mouseenter', () => {
      if (ctx.isBlockSelecting()) {
        ctx.updateBlockSelection(rowIndex, column.field);
      }
    });

    // Tooltip
    if (column.tooltip) {
      addClass(cell, 'velox-cell--has-tooltip');
      
      cell.addEventListener('mouseenter', () => ctx.showTooltip(cell, value, rowData, column));
      cell.addEventListener('mouseleave', () => ctx.hideTooltip());
    }

    return cell;
  }

  /**
   * Loading 상태 업데이트
   */
  updateLoadingState(): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    
    if (ctx.loadingOverlay) {
      ctx.loadingOverlay.style.display = options.loading ? 'flex' : 'none';
    }
  }

  /**
   * Row validation 상태 업데이트
   */
  updateRowValidationState(rowIndex: number): void {
    const ctx = this.ctx;
    const state = ctx.getState();
    
    const row = ctx.rootElement.querySelector(`[data-row-index="${rowIndex}"]`) as HTMLElement;
    if (!row) return;

    const cells = row.querySelectorAll('.velox-cell');
    cells.forEach((cellEl: Element) => {
      const cell = cellEl as HTMLElement;
      const field = cell.dataset.field;
      if (!field) return;

      const column = state.columns.find((c: ColumnDefinition) => c.field === field);
      if (!column?.validation) return;

      // Validation은 VeloxGrid 내부에서 처리됨
    });
  }
}
