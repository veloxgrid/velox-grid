/**
 * GridRenderer - Rendering Module
 * Phase 8: Code Structure Optimization (Step 2)
 * 
 * VeloxGrid의 렌더링 로직을 담당하는 모듈
 * - Header, Body, Cell 렌더링
 * - Row 생성 및 업데이트
 */

import type { ColumnDefinition, RowData } from '../types';
import { createElement, addClass } from '../utils/dom';
import { formatValue } from '../utils/data';
import type { VeloxGrid } from './VeloxGrid';

export class GridRenderer {
  constructor(private grid: VeloxGrid) {}

  /**
   * 전체 그리드 렌더링
   */
  render(): void {
    this.renderHeader();
    this.renderBody();
    this.updateLoadingState();
  }

  /**
   * 헤더 렌더링
   */
  renderHeader(): void {
    const grid = this.grid as any; // Internal access

    // Fixed left header
    if (grid.fixedLeftHeader) {
      grid.fixedLeftHeader.innerHTML = '';
      const headerRow = createElement('div', 'velox-header-row');
      
      if (grid.options.checkBar?.visible) {
        headerRow.appendChild(this.createHeaderCheckbarCell());
      }
      
      if (grid.options.showRowNumbers) {
        const rowNumCell = createElement('div', 'velox-header-cell velox-rownumber-cell');
        rowNumCell.textContent = '#';
        headerRow.appendChild(rowNumCell);
      }
      
      grid.getFixedLeftColumns().forEach((col: ColumnDefinition) => 
        headerRow.appendChild(this.createHeaderCell(col))
      );
      grid.fixedLeftHeader.appendChild(headerRow);
    }

    // Scrollable header
    const headerRow = createElement('div', 'velox-header-row');
    grid.getScrollableColumns().forEach((col: ColumnDefinition) => 
      headerRow.appendChild(this.createHeaderCell(col))
    );
    grid.headerElement.innerHTML = '';
    grid.headerElement.appendChild(headerRow);
  }

  /**
   * CheckBar 헤더 셀 생성
   */
  private createHeaderCheckbarCell(): HTMLElement {
    const grid = this.grid as any;
    const cell = createElement('div', 'velox-header-cell velox-checkbox-cell');
    const checkBar = grid.options.checkBar!;
    
    if (checkBar.showAll && !checkBar.exclusive) {
      const checkbox = createElement('input', 'velox-checkbox') as HTMLInputElement;
      checkbox.type = 'checkbox';
      
      const checkableCount = grid.state.checkBar.checkableRows.size;
      const checkedCount = grid.state.checkBar.checkedRows.size;
      const allChecked = checkableCount > 0 && checkedCount === checkableCount;
      const someChecked = checkedCount > 0 && !allChecked;
      
      checkbox.checked = allChecked;
      checkbox.indeterminate = someChecked;
      checkbox.addEventListener('change', () => grid.checkAll(checkbox.checked));
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
    const grid = this.grid as any;
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
    if (grid.options.sortable && column.sortable !== false) {
      addClass(cell, 'velox-header-cell--sortable');
      const sortState = grid.state.sort.find((s: any) => s.field === column.field);
      if (sortState?.direction) addClass(cell, 'velox-header-cell--sorted');
    }

    const contentWrapper = createElement('div', 'velox-header-content');
    
    // Column drag handle
    const dragHandle = createElement('span', 'velox-column-drag-handle');
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.title = '드래그하여 컬럼 순서 변경';
    dragHandle.addEventListener('mousedown', (e) => grid.startColumnDrag(e, column));
    contentWrapper.appendChild(dragHandle);
    
    const text = createElement('span', 'velox-header-text');
    text.textContent = column.header;
    contentWrapper.appendChild(text);

    // Sort icon
    if (grid.options.sortable && column.sortable !== false) {
      const sortIcon = createElement('span', 'velox-sort-icon');
      const sortState = grid.state.sort.find((s: any) => s.field === column.field);
      
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
        if (!grid.columnDragging) grid.handleSort(column.field); 
      });
    }

    cell.appendChild(contentWrapper);

    // Filter button
    if (grid.options.filterable && column.filterable !== false) {
      const filterBtn = createElement('button', 'velox-filter-btn');
      filterBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>`;
      const hasFilter = grid.state.filter?.conditions.some((c: any) => c.field === column.field);
      if (hasFilter) addClass(filterBtn, 'velox-filter-btn--active');
      filterBtn.addEventListener('click', (e) => { e.stopPropagation(); grid.showFilterPopup(column, filterBtn); });
      cell.appendChild(filterBtn);
    }
    
    // Column menu button
    const menuBtn = createElement('button', 'velox-column-menu-btn');
    menuBtn.innerHTML = '⋯';
    menuBtn.title = '컬럼 메뉴';
    menuBtn.addEventListener('click', (e) => { e.stopPropagation(); grid.showColumnMenu(column, menuBtn); });
    cell.appendChild(menuBtn);

    // Resize handle
    if (grid.options.resizable && column.resizable !== false) {
      const handle = createElement('div', 'velox-resize-handle');
      handle.addEventListener('mousedown', (e) => grid.startResize(e, column));
      cell.appendChild(handle);
    }

    return cell;
  }

  /**
   * 바디 렌더링
   */
  renderBody(): void {
    const grid = this.grid as any;
    const visibleRows = grid.getVisibleRows();
    const rowHeight = grid.options.rowHeight || 40;

    // Fixed left body
    if (grid.fixedLeftBodyInner) {
      grid.fixedLeftBodyInner.innerHTML = '';
      if (grid.options.virtualScroll) {
        grid.fixedLeftBodyInner.style.height = `${grid.virtualState.totalHeight}px`;
        grid.fixedLeftBodyInner.style.position = 'relative';
      } else {
        grid.fixedLeftBodyInner.style.height = '';
        grid.fixedLeftBodyInner.style.position = '';
      }

      visibleRows.forEach(({ data, index }: any) => {
        const row = this.createRowBase(data, index, true);
        if (grid.options.virtualScroll) {
          row.style.position = 'absolute';
          row.style.top = `${index * rowHeight}px`;
          row.style.left = '0';
          row.style.right = '0';
        }
        grid.fixedLeftBodyInner!.appendChild(row);
      });
    }

    // Scrollable body
    grid.bodyInner.innerHTML = '';
    if (grid.options.virtualScroll) {
      grid.bodyInner.style.height = `${grid.virtualState.totalHeight}px`;
      grid.bodyInner.style.position = 'relative';
    } else {
      grid.bodyInner.style.height = '';
      grid.bodyInner.style.position = '';
    }

    if (visibleRows.length === 0) {
      const emptyDiv = createElement('div', 'velox-empty');
      emptyDiv.textContent = grid.options.emptyMessage || '데이터가 없습니다.';
      grid.bodyInner.appendChild(emptyDiv);
      return;
    }

    visibleRows.forEach(({ data, index }: any) => {
      const row = this.createRowBase(data, index, false);
      if (grid.options.virtualScroll) {
        row.style.position = 'absolute';
        row.style.top = `${index * rowHeight}px`;
        row.style.left = '0';
        row.style.right = '0';
      }
      grid.bodyInner.appendChild(row);
    });
  }

  /**
   * Row 생성 (통합 메서드)
   */
  createRowBase(rowData: RowData, rowIndex: number, isFixedLeft: boolean): HTMLElement {
    const grid = this.grid as any;
    const row = createElement('div', 'velox-row');
    row.dataset.rowIndex = String(rowIndex);

    // Alternating row style
    if (rowIndex % 2 === 1) addClass(row, 'velox-row--alt');
    
    // Selection state
    if (grid.options.selectionStyle === 'row' && grid.state.selection.selectedRows.has(rowIndex)) {
      addClass(row, 'velox-row--selected');
    }
    
    // CheckBar state
    if (isFixedLeft && grid.state.checkBar.checkedRows.has(rowIndex)) {
      addClass(row, 'velox-row--checked');
    }

    // Row click handler
    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('velox-checkbox')) return;
      if (target.classList.contains('velox-row-drag-handle')) return;
      grid.handleRowClick(rowIndex, e);
    });

    // Double click
    if (!isFixedLeft) {
      row.addEventListener('dblclick', (e) => grid.handleRowDoubleClick(rowIndex, e));
    }

    // Fixed left content
    if (isFixedLeft) {
      // Row drag handle
      const dragHandle = createElement('div', 'velox-row-drag-handle');
      dragHandle.innerHTML = '☰';
      dragHandle.title = '드래그하여 행 순서 변경';
      dragHandle.addEventListener('mousedown', (e) => grid.startRowDrag(e, rowIndex, row));
      row.appendChild(dragHandle);
      
      if (grid.options.checkBar?.visible) {
        row.appendChild(this.createCheckbarCell(rowIndex));
      }
      
      if (grid.options.showRowNumbers) {
        const rowNumCell = createElement('div', 'velox-cell velox-rownumber-cell');
        rowNumCell.textContent = String(rowIndex + 1);
        row.appendChild(rowNumCell);
      }
      
      grid.getFixedLeftColumns().forEach((col: ColumnDefinition) => 
        row.appendChild(this.createCell(rowData, rowIndex, col))
      );
    } else {
      grid.getScrollableColumns().forEach((col: ColumnDefinition) => 
        row.appendChild(this.createCell(rowData, rowIndex, col))
      );
    }

    return row;
  }

  /**
   * CheckBar 셀 생성
   */
  private createCheckbarCell(rowIndex: number): HTMLElement {
    const grid = this.grid as any;
    const cell = createElement('div', 'velox-cell velox-checkbox-cell');
    const checkBar = grid.options.checkBar!;
    const isCheckable = grid.state.checkBar.checkableRows.has(rowIndex);
    const isChecked = grid.state.checkBar.checkedRows.has(rowIndex);
    
    const input = createElement('input', 'velox-checkbox') as HTMLInputElement;
    input.type = checkBar.exclusive ? 'radio' : 'checkbox';
    input.name = checkBar.exclusive ? `${grid.gridId}-check` : '';
    input.checked = isChecked;
    input.disabled = !isCheckable;
    
    if (!isCheckable) {
      addClass(cell, 'velox-checkbox-cell--disabled');
    }
    
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('change', () => {
      if (checkBar.exclusive) {
        grid.state.checkBar.checkedRows.clear();
        if (input.checked) {
          grid.state.checkBar.checkedRows.add(rowIndex);
        }
        this.render();
        grid.events.onCheckChange?.(rowIndex, input.checked);
      } else {
        grid.checkItem(rowIndex, input.checked);
      }
    });
    
    cell.appendChild(input);
    return cell;
  }

  /**
   * Cell 생성
   */
  createCell(rowData: RowData, rowIndex: number, column: ColumnDefinition): HTMLElement {
    const grid = this.grid as any;
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
    if (grid.state.selection.selectedCells.has(cellKey)) {
      addClass(cell, 'velox-cell--selected');
    }
    
    const focusedCell = grid.state.selection.focusedCell;
    if (focusedCell && focusedCell.rowIndex === rowIndex && focusedCell.field === column.field) {
      addClass(cell, 'velox-cell--focused');
    }

    if (grid.options.editable && column.editable !== false) {
      addClass(cell, 'velox-cell--editable');
      cell.addEventListener('dblclick', (e) => { e.stopPropagation(); grid.startEdit(rowIndex, column.field); });
    }

    const value = rowData[column.field];
    const content = createElement('span', 'velox-cell-content');

    if (column.renderer) content.innerHTML = column.renderer(value, rowData, column);
    else if (column.formatter) content.textContent = column.formatter(value, rowData, column);
    else content.textContent = formatValue(value, column.type);

    cell.appendChild(content);
    
    cell.addEventListener('click', (e) => {
      grid.handleCellClick(rowIndex, column.field, value, e);
    });
    
    cell.addEventListener('mousedown', (e) => {
      if (grid.options.selectionStyle === 'block' && e.button === 0) {
        grid.startBlockSelection(rowIndex, column.field);
      }
    });
    
    cell.addEventListener('mouseenter', () => {
      if (grid.blockSelecting) {
        grid.updateBlockSelection(rowIndex, column.field);
      }
    });

    // Tooltip
    if (column.tooltip && grid.tooltip) {
      addClass(cell, 'velox-cell--has-tooltip');
      
      cell.addEventListener('mouseenter', () => {
        if (grid.tooltip) {
          grid.tooltip.show(cell, value, rowData, column);
        }
      });
      
      cell.addEventListener('mouseleave', () => {
        if (grid.tooltip) {
          grid.tooltip.hide();
        }
      });
    }

    return cell;
  }

  /**
   * Loading 상태 업데이트
   */
  updateLoadingState(): void {
    const grid = this.grid as any;
    if (grid.loadingOverlay) {
      grid.loadingOverlay.style.display = grid.options.loading ? 'flex' : 'none';
    }
  }

  /**
   * Row validation 상태 업데이트
   */
  updateRowValidationState(rowIndex: number): void {
    const grid = this.grid as any;
    const row = grid.rootElement.querySelector(`[data-row-index="${rowIndex}"]`) as HTMLElement;
    if (!row) return;

    const cells = row.querySelectorAll('.velox-cell');
    cells.forEach((cell: Element) => {
      const cellEl = cell as HTMLElement;
      const field = cellEl.dataset.field;
      if (!field) return;

      const column = grid.columns.find((c: ColumnDefinition) => c.field === field);
      if (!column?.validation) return;

      const rowData = grid.state.displayData[rowIndex];
      if (!rowData) return;

      const value = rowData[field];
      const result = grid.validator.validate(value, column.validation, rowData);

      if (!result.valid) {
        addClass(cellEl, 'velox-cell--invalid');
        cellEl.title = result.errors.join(', ');
      } else {
        cellEl.classList.remove('velox-cell--invalid');
        cellEl.removeAttribute('title');
      }
    });
  }
}
