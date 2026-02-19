/**
 * GridRenderer - Rendering Module
 * Phase 8: Code Structure Optimization
 * 
 * VeloxGrid의 렌더링 로직을 담당하는 모듈
 * - Header, Body, Cell 렌더링
 * - Row 생성 및 업데이트
 */

import type { ColumnDefinition, RowData, GridContext, HeaderCell } from '../types';
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
    this.renderFooter();
    this.updateLoadingState();
    console.log('🎨 GridRenderer.render() completed', { editing: state.edit.editing });
  }

  /**
   * 헤더 렌더링 (Phase 14: Fixed Right 지원, Phase 19: Column Group 지원)
   */
  renderHeader(): void {
    const ctx = this.ctx;
    
    // Phase 19: 레이아웃이 있으면 다단계 헤더 렌더링
    const headerMatrix = ctx.getHeaderMatrix();
    if (headerMatrix) {
      this.renderGroupedHeader(headerMatrix);
      return;
    }

    // 1. Fixed left header (only when colCount > 0)
    if (ctx.fixedLeftHeader) {
      ctx.fixedLeftHeader.innerHTML = '';
      const headerRow = createElement('div', 'velox-header-row');
      
      // Fixed left columns (Special + Data columns when colCount > 0)
      ctx.getFixedLeftColumns().forEach((col: ColumnDefinition) => {
        if (col.field === '__drag') {
          // Drag handle placeholder
          const dragPlaceholder = createElement('div', 'velox-row-drag-handle');
          dragPlaceholder.style.visibility = 'hidden';
          headerRow.appendChild(dragPlaceholder);
        } else if (col.field === '__checkbox') {
          // CheckBar header
          headerRow.appendChild(this.createHeaderCheckbarCell());
        } else if (col.field === '__rownum') {
          // Row numbers header
          const rowNumCell = createElement('div', 'velox-header-cell velox-rownumber-cell');
          rowNumCell.textContent = '#';
          headerRow.appendChild(rowNumCell);
        } else {
          // Data column
          headerRow.appendChild(this.createHeaderCell(col));
        }
      });
      
      ctx.fixedLeftHeader.appendChild(headerRow);
    }

    // 2. Scrollable header (includes special columns when colCount = 0)
    const headerRow = createElement('div', 'velox-header-row');
    
    ctx.getScrollableColumns().forEach((col: ColumnDefinition) => {
      if (col.field === '__drag') {
        // Drag handle placeholder
        const dragPlaceholder = createElement('div', 'velox-row-drag-handle');
        dragPlaceholder.style.visibility = 'hidden';
        headerRow.appendChild(dragPlaceholder);
      } else if (col.field === '__checkbox') {
        // CheckBar header
        headerRow.appendChild(this.createHeaderCheckbarCell());
      } else if (col.field === '__rownum') {
        // Row numbers header
        const rowNumCell = createElement('div', 'velox-header-cell velox-rownumber-cell');
        rowNumCell.textContent = '#';
        headerRow.appendChild(rowNumCell);
      } else {
        // Data column
        headerRow.appendChild(this.createHeaderCell(col));
      }
    });
    
    ctx.headerElement.innerHTML = '';
    ctx.headerElement.appendChild(headerRow);

    // 3. Fixed right header (Phase 14)
    if (ctx.fixedRightHeader) {
      ctx.fixedRightHeader.innerHTML = '';
      const fixedRightRow = createElement('div', 'velox-header-row');
      
      ctx.getFixedRightColumns().forEach((col: ColumnDefinition) => 
        fixedRightRow.appendChild(this.createHeaderCell(col))
      );
      
      ctx.fixedRightHeader.appendChild(fixedRightRow);
      
      // Calculate and set explicit width for Fixed Right container
      this.updateFixedRightWidth();
    }
  }

  /**
   * Phase 19: 다단계 헤더 렌더링 (CSS Grid 기반)
   */
  private renderGroupedHeader(headerMatrix: HeaderCell[][]): void {
    const ctx = this.ctx;
    const columnOrder = ctx.getLayoutColumnOrder();
    if (!columnOrder) return;
    
    const options = ctx.getOptions();
    const state = ctx.getState();
    const maxDepth = headerMatrix.length;
    const headerHeight = options.headerHeight || 44;
    const rowHeight = Math.floor(headerHeight / maxDepth);

    // 스크롤 영역 컬럼 너비 배열 생성
    const colWidths = columnOrder.map(field => {
      const col = state.columns.find(c => c.field === field);
      return col?.width || 120;
    });

    // CSS Grid template 문자열
    const gridTemplateCols = colWidths.map(w => `${w}px`).join(' ');
    const gridTemplateRows = Array(maxDepth).fill(`${rowHeight}px`).join(' ');

    // === 1. Fixed Left 헤더 (높이를 scrollable 영역과 맞춤) ===
    if (ctx.fixedLeftHeader) {
      ctx.fixedLeftHeader.innerHTML = '';
      ctx.fixedLeftHeader.style.minHeight = `${headerHeight}px`;
      ctx.fixedLeftHeader.style.height = `${headerHeight}px`;
      const headerRow = createElement('div', 'velox-header-row');
      headerRow.style.height = `${headerHeight}px`;
      ctx.getFixedLeftColumns().forEach((col: ColumnDefinition) => {
        if (col.field === '__drag') {
          const p = createElement('div', 'velox-row-drag-handle');
          p.style.visibility = 'hidden';
          headerRow.appendChild(p);
        } else if (col.field === '__checkbox') {
          headerRow.appendChild(this.createHeaderCheckbarCell());
        } else if (col.field === '__rownum') {
          const c = createElement('div', 'velox-header-cell velox-rownumber-cell');
          c.textContent = '#';
          headerRow.appendChild(c);
        } else {
          headerRow.appendChild(this.createHeaderCell(col));
        }
      });
      ctx.fixedLeftHeader.appendChild(headerRow);
    }

    // === 2. Scrollable 헤더 (CSS Grid 다단계) ===
    ctx.headerElement.innerHTML = '';
    ctx.headerElement.style.minHeight = `${headerHeight}px`;
    ctx.headerElement.style.height = `${headerHeight}px`;
    const gridContainer = createElement('div', 'velox-header--grouped');
    gridContainer.style.gridTemplateColumns = gridTemplateCols;
    gridContainer.style.gridTemplateRows = gridTemplateRows;
    gridContainer.style.height = `${headerHeight}px`;

    // 매트릭스의 각 셀을 CSS Grid 아이템으로 배치
    for (let rowIdx = 0; rowIdx < headerMatrix.length; rowIdx++) {
      for (const cell of headerMatrix[rowIdx]) {
        if (cell.type === 'group') {
          const el = this.createGroupHeaderCell(cell);
          gridContainer.appendChild(el);
        } else {
          // 개별 컬럼 헤더
          const col = cell.column;
          if (col) {
            const el = this.createGroupedColumnHeaderCell(col, cell);
            gridContainer.appendChild(el);
          }
        }
      }
    }

    ctx.headerElement.appendChild(gridContainer);

    // === 3. Fixed Right 헤더 (높이를 scrollable 영역과 맞춤) ===
    if (ctx.fixedRightHeader) {
      ctx.fixedRightHeader.innerHTML = '';
      ctx.fixedRightHeader.style.minHeight = `${headerHeight}px`;
      ctx.fixedRightHeader.style.height = `${headerHeight}px`;
      const fixedRightRow = createElement('div', 'velox-header-row');
      fixedRightRow.style.height = `${headerHeight}px`;
      ctx.getFixedRightColumns().forEach((col: ColumnDefinition) =>
        fixedRightRow.appendChild(this.createHeaderCell(col))
      );
      ctx.fixedRightHeader.appendChild(fixedRightRow);
      this.updateFixedRightWidth();
    }
  }

  /**
   * Phase 19: 그룹 헤더 셀 생성
   */
  private createGroupHeaderCell(cell: HeaderCell): HTMLElement {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const el = createElement('div', 'velox-header-cell--group');
    
    // CSS Grid 위치
    if (cell.gridColumn !== undefined) {
      el.style.gridColumn = `${cell.gridColumn} / span ${cell.colSpan}`;
    }
    if (cell.gridRow !== undefined) {
      el.style.gridRow = `${cell.gridRow} / span ${cell.rowSpan}`;
    }

    // 정렬
    const align = cell.align || 'center';
    addClass(el, `velox-header-cell--group-${align}`);

    // 커스텀 클래스
    if (cell.className) addClass(el, cell.className);

    // 텍스트
    const textSpan = createElement('span', 'velox-header-group-text');
    textSpan.textContent = cell.text;
    el.appendChild(textSpan);

    // Phase 19: 그룹 헤더 리사이즈 핸들 (그룹 내 마지막 컬럼 너비 조절)
    if (options.resizable !== false && cell.groupName) {
      el.style.position = 'relative';
      const handle = createElement('div', 'velox-resize-handle');
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        ctx.startGroupResize(e, cell.groupName!);
      });
      el.appendChild(handle);
    }

    return el;
  }

  /**
   * Phase 19: CSS Grid 기반 개별 컬럼 헤더 셀 생성
   */
  private createGroupedColumnHeaderCell(column: ColumnDefinition, cell: HeaderCell): HTMLElement {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();

    const el = createElement('div', 'velox-header-cell--grouped');
    el.dataset.field = column.field;

    // CSS Grid 위치
    if (cell.gridColumn !== undefined) {
      el.style.gridColumn = `${cell.gridColumn} / span ${cell.colSpan}`;
    }
    if (cell.gridRow !== undefined) {
      el.style.gridRow = `${cell.gridRow} / span ${cell.rowSpan}`;
    }

    // 정렬
    const align = column.headerAlign || column.align || 'left';
    addClass(el, `velox-header-cell--align-${align}`);
    if (column.headerClass) addClass(el, column.headerClass);

    // 정렬 가능 클래스
    if (options.sortable && column.sortable !== false) {
      addClass(el, 'velox-header-cell--sortable');
      const sortState = state.sort.find((s: any) => s.field === column.field);
      if (sortState?.direction) addClass(el, 'velox-header-cell--sorted');
    }

    // 컨텐츠 래퍼
    const contentWrapper = createElement('div', 'velox-header-content');

    // 헤더 텍스트
    const text = createElement('span', 'velox-header-text');
    text.textContent = column.header;
    contentWrapper.appendChild(text);

    el.appendChild(contentWrapper);

    // 헤더 셀 자체를 드래그하여 컬럼 이동 (임계값 기반 — 클릭과 자동 구분)
    el.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.velox-resize-handle')) return;
      ctx.startColumnDrag(e, column);
    });

    // Sort 버튼
    if (options.sortable && column.sortable !== false) {
      const sortBtn = createElement('button', 'velox-sort-btn');
      const sortState = state.sort.find((s: any) => s.field === column.field);
      if (sortState?.direction === 'asc') {
        addClass(sortBtn, 'velox-sort-btn--asc');
        sortBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>`;
      } else if (sortState?.direction === 'desc') {
        addClass(sortBtn, 'velox-sort-btn--desc');
        sortBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>`;
      } else {
        sortBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>`;
      }
      if (sortState?.direction) addClass(sortBtn, 'velox-sort-btn--active');
      sortBtn.title = '정렬';
      sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ctx.handleSort(column.field);
      });
      el.appendChild(sortBtn);
    }

    // Filter 버튼
    if (options.filterable && column.filterable !== false) {
      const filterBtn = createElement('button', 'velox-filter-btn');
      filterBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>`;
      const hasFilter = state.filter?.conditions.some((c: any) => c.field === column.field);
      if (hasFilter) addClass(filterBtn, 'velox-filter-btn--active');
      filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ctx.showFilterPopup(column, filterBtn);
      });
      el.appendChild(filterBtn);
    }

    // 컬럼 메뉴 버튼
    const menuBtn = createElement('button', 'velox-column-menu-btn');
    menuBtn.innerHTML = '⋯';
    menuBtn.title = '컬럼 메뉴';
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ctx.showColumnMenu(column, menuBtn);
    });
    el.appendChild(menuBtn);

    // 리사이즈 핸들
    if (options.resizable && column.resizable !== false) {
      const handle = createElement('div', 'velox-resize-handle');
      handle.addEventListener('mousedown', (e) => ctx.startResize(e, column));
      el.appendChild(handle);
    }

    return el;
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
      cell.style.maxWidth = `${column.width}px`;
      cell.style.flexShrink = '0';
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
    
    const text = createElement('span', 'velox-header-text');
    text.textContent = column.header;
    contentWrapper.appendChild(text);

    cell.appendChild(contentWrapper);

    // 헤더 셀 자체를 드래그하여 컬럼 이동 (임계값 기반 — 클릭과 자동 구분)
    cell.addEventListener('mousedown', (e) => {
      // 버튼이나 리사이즈 핸들 위에서의 mousedown은 무시
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.velox-resize-handle')) return;
      ctx.startColumnDrag(e, column);
    });

    // Sort button (우측 정렬)
    if (options.sortable && column.sortable !== false) {
      const sortBtn = createElement('button', 'velox-sort-btn');
      const sortState = state.sort.find((s: any) => s.field === column.field);
      
      if (sortState?.direction === 'asc') {
        addClass(sortBtn, 'velox-sort-btn--asc');
        sortBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>`;
      } else if (sortState?.direction === 'desc') {
        addClass(sortBtn, 'velox-sort-btn--desc');
        sortBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>`;
      } else {
        sortBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>`;
      }
      
      if (sortState?.direction) addClass(sortBtn, 'velox-sort-btn--active');
      sortBtn.title = '정렬';
      sortBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        ctx.handleSort(column.field); 
      });
      cell.appendChild(sortBtn);
    }

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
   * 바디 렌더링 (Phase 14: Fixed Right 지원)
   */
  renderBody(): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const visibleRows = ctx.getVisibleRows();
    const virtualState = ctx.getVirtualState();
    const rowHeight = options.rowHeight || 40;

    // 1. Fixed left body (Special + Fixed Left Data)
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
        const row = this.createRowBase(data, index, 'fixedLeft');
        if (options.virtualScroll) {
          row.style.position = 'absolute';
          row.style.top = `${index * rowHeight}px`;
          row.style.left = '0';
          row.style.right = '0';
        }
        ctx.fixedLeftBodyInner!.appendChild(row);
      });
    }

    // 2. Scrollable body
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
      const row = this.createRowBase(data, index, 'scrollable');
      if (options.virtualScroll) {
        row.style.position = 'absolute';
        row.style.top = `${index * rowHeight}px`;
        row.style.left = '0';
        row.style.right = '0';
      }
      ctx.bodyInner.appendChild(row);
    });

    // 3. Fixed right body (Phase 14)
    if (ctx.fixedRightBodyInner) {
      ctx.fixedRightBodyInner.innerHTML = '';
      if (options.virtualScroll) {
        ctx.fixedRightBodyInner.style.height = `${virtualState.totalHeight}px`;
        ctx.fixedRightBodyInner.style.position = 'relative';
      } else {
        ctx.fixedRightBodyInner.style.height = '';
        ctx.fixedRightBodyInner.style.position = '';
      }

      visibleRows.forEach(({ data, index }) => {
        const row = this.createRowBase(data, index, 'fixedRight');
        if (options.virtualScroll) {
          row.style.position = 'absolute';
          row.style.top = `${index * rowHeight}px`;
          row.style.left = '0';
          row.style.right = '0';
        }
        ctx.fixedRightBodyInner!.appendChild(row);
      });
      
      // Ensure Fixed Right width is consistent with header
      this.updateFixedRightWidth();
    }
  }

  /**
   * Update Fixed Right container width based on columns
   * Phase 14: Ensure header and body alignment
   */
  private updateFixedRightWidth(): void {
    const ctx = this.ctx;
    if (!ctx.fixedRightContainer) return;
    
    const fixedRightColumns = ctx.getFixedRightColumns();
    if (fixedRightColumns.length === 0) return;
    
    // Calculate total width of fixed right columns
    let totalWidth = 0;
    fixedRightColumns.forEach((col: ColumnDefinition) => {
      totalWidth += col.width || col.minWidth || 100;
    });
    
    // Get scrollbar width from Fixed Right body
    const scrollbarWidth = this.getScrollbarWidth(ctx.fixedRightBody);
    
    // Set explicit width to Fixed Right container (including scrollbar)
    ctx.fixedRightContainer.style.width = `${totalWidth + scrollbarWidth}px`;
    ctx.fixedRightContainer.style.minWidth = `${totalWidth + scrollbarWidth}px`;
    ctx.fixedRightContainer.style.maxWidth = `${totalWidth + scrollbarWidth}px`;
    
    // Add padding to header to account for scrollbar
    if (ctx.fixedRightHeader && scrollbarWidth > 0) {
      ctx.fixedRightHeader.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    // Add padding to footer to account for scrollbar
    if (ctx.fixedRightFooter && scrollbarWidth > 0) {
      ctx.fixedRightFooter.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  
  /**
   * Get scrollbar width of an element
   * Phase 14: For Fixed Right alignment
   */
  private getScrollbarWidth(element: HTMLElement | null): number {
    if (!element) return 0;
    
    // Calculate scrollbar width: offsetWidth - clientWidth
    const scrollbarWidth = element.offsetWidth - element.clientWidth;
    return scrollbarWidth;
  }

  /**
   * Row 생성 (통합 메서드)
   * @param area - 'fixedLeft' | 'scrollable' | 'fixedRight' (Phase 14)
   */
  createRowBase(rowData: RowData, rowIndex: number, area: 'fixedLeft' | 'scrollable' | 'fixedRight'): HTMLElement {
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
    if (area === 'fixedLeft' && state.checkBar.checkedRows.has(rowIndex)) {
      addClass(row, 'velox-row--checked');
    }

    // Row click handler
    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('velox-checkbox')) return;
      if (target.classList.contains('velox-row-drag-handle')) return;
      ctx.handleRowClick(rowIndex, e);
    });

    // Double click (only for scrollable and fixedRight areas)
    if (area !== 'fixedLeft') {
      row.addEventListener('dblclick', (e) => ctx.handleRowDoubleClick(rowIndex, e));
    }

    // Content based on area (Phase 14)
    if (area === 'fixedLeft') {
      // Fixed left columns (includes special columns when colCount > 0)
      ctx.getFixedLeftColumns().forEach((col: ColumnDefinition) => {
        if (col.field === '__drag') {
          // Row drag handle
          const dragHandle = createElement('div', 'velox-row-drag-handle');
          dragHandle.innerHTML = '☰';
          dragHandle.title = '드래그하여 행 순서 변경';
          dragHandle.addEventListener('mousedown', (e) => ctx.startRowDrag(e, rowIndex, row));
          row.appendChild(dragHandle);
        } else if (col.field === '__checkbox') {
          // CheckBar
          row.appendChild(this.createCheckbarCell(rowIndex));
        } else if (col.field === '__rownum') {
          // Row numbers
          const rowNumCell = createElement('div', 'velox-cell velox-rownumber-cell');
          rowNumCell.textContent = String(rowIndex + 1);
          row.appendChild(rowNumCell);
        } else {
          // Data cell
          row.appendChild(this.createCell(rowData, rowIndex, col));
        }
      });
    } else if (area === 'scrollable') {
      // Scrollable columns (includes special columns when colCount = 0)
      ctx.getScrollableColumns().forEach((col: ColumnDefinition) => {
        if (col.field === '__drag') {
          // Row drag handle
          const dragHandle = createElement('div', 'velox-row-drag-handle');
          dragHandle.innerHTML = '☰';
          dragHandle.title = '드래그하여 행 순서 변경';
          dragHandle.addEventListener('mousedown', (e) => ctx.startRowDrag(e, rowIndex, row));
          row.appendChild(dragHandle);
        } else if (col.field === '__checkbox') {
          // CheckBar
          row.appendChild(this.createCheckbarCell(rowIndex));
        } else if (col.field === '__rownum') {
          // Row numbers
          const rowNumCell = createElement('div', 'velox-cell velox-rownumber-cell');
          rowNumCell.textContent = String(rowIndex + 1);
          row.appendChild(rowNumCell);
        } else {
          // Data cell
          row.appendChild(this.createCell(rowData, rowIndex, col));
        }
      });
    } else if (area === 'fixedRight') {
      // Fixed right columns (Phase 14)
      ctx.getFixedRightColumns().forEach((col: ColumnDefinition) => 
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
      cell.style.maxWidth = `${column.width}px`;
      cell.style.flexShrink = '0';
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
   * Footer Summary 렌더링 (Phase 13, Phase 14: Fixed Right 지원)
   */
  renderFooter(): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();

    // Footer summary가 비활성화되어 있으면 건너뀨기
    if (!options.footerSummary?.visible) return;

    // 1. Fixed left footer (Special + Fixed Left Data)
    if (ctx.fixedLeftFooter) {
      ctx.fixedLeftFooter.innerHTML = '';
      const footerRow = createElement('div', 'velox-footer-row');
      
      // Row drag handle placeholder (only if rowDraggable is enabled)
      if (options.rowDraggable) {
        const dragPlaceholder = createElement('div', 'velox-row-drag-handle');
        dragPlaceholder.style.visibility = 'hidden';
        footerRow.appendChild(dragPlaceholder);
      }
      
      if (options.checkBar?.visible) {
        const checkboxCell = createElement('div', 'velox-footer-cell velox-checkbox-cell');
        footerRow.appendChild(checkboxCell);
      }
      
      // Fixed left columns (Special + Data columns from fixedOptions.colCount)
      ctx.getFixedLeftColumns().forEach((col: ColumnDefinition) => 
        footerRow.appendChild(this.createFooterCell(col))
      );
      
      ctx.fixedLeftFooter.appendChild(footerRow);
    }

    // 2. Scrollable footer
    if (ctx.footerElement) {
      ctx.footerElement.innerHTML = '';
      const footerRow = createElement('div', 'velox-footer-row');
      
      // Row number placeholder in footer
      if (options.showRowNumbers) {
        const rowNumCell = createElement('div', 'velox-footer-cell velox-rownumber-cell');
        footerRow.appendChild(rowNumCell);
      }
      
      ctx.getScrollableColumns().forEach((col: ColumnDefinition) => 
        footerRow.appendChild(this.createFooterCell(col))
      );
      ctx.footerElement.appendChild(footerRow);
    }

    // 3. Fixed right footer (Phase 14)
    if (ctx.fixedRightFooter) {
      ctx.fixedRightFooter.innerHTML = '';
      const fixedRightRow = createElement('div', 'velox-footer-row');
      
      ctx.getFixedRightColumns().forEach((col: ColumnDefinition) => 
        fixedRightRow.appendChild(this.createFooterCell(col))
      );
      
      ctx.fixedRightFooter.appendChild(fixedRightRow);
    }
  }

  /**
   * Footer 셀 생성 (Phase 13)
   */
  private createFooterCell(column: ColumnDefinition): HTMLElement {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    
    const cell = createElement('div', 'velox-footer-cell');
    cell.dataset.field = column.field;

    // Alignment
    const align = column.align || 'left';
    addClass(cell, `velox-footer-cell--align-${align}`);

    // Width
    if (column.width) {
      cell.style.width = `${column.width}px`;
      cell.style.minWidth = `${column.minWidth || column.width}px`;
    } else {
      cell.style.flex = '1';
      cell.style.minWidth = `${column.minWidth || 100}px`;
    }

    // Summary 값 계산 및 표시
    const summaryConfig = options.footerSummary?.columns?.[column.field] || column.summary;
    
    if (summaryConfig) {
      const summaryValue = ctx.getSummaryValue(column.field);
      const content = createElement('span', 'velox-footer-content');
      
      // Label 표시
      if (summaryConfig.label) {
        const label = createElement('span', 'velox-footer-label');
        label.textContent = summaryConfig.label;
        content.appendChild(label);
      }
      
      // Value 표시
      const valueSpan = createElement('span', 'velox-footer-value');
      
      // Custom formatter 사용
      if (summaryConfig.formatter) {
        valueSpan.textContent = summaryConfig.formatter(summaryValue);
      } else {
        valueSpan.textContent = formatValue(summaryValue, column.type);
      }
      
      content.appendChild(valueSpan);
      cell.appendChild(content);
      
      // Custom className
      if (summaryConfig.className) {
        addClass(cell, summaryConfig.className);
      }
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
