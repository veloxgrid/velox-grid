/**
 * GridDragManager - Drag & Drop Module
 * Phase 8: Code Structure Optimization (Step 6)
 * 
 * VeloxGrid의 드래그 앤 드롭 기능을 담당하는 모듈
 * - Column 드래그 앤 드롭 (순서 변경)
 * - Row 드래그 앤 드롭 (순서 변경)
 * - Resize 핸들링
 */

import type { ColumnDefinition, GridContext } from '../types';
import { createElement, addClass, removeClass } from '../utils/dom';
import type { VeloxGrid } from './VeloxGrid';

// VeloxGrid는 GridContext를 구현하므로, 타입 안전성을 위해 GridContext 사용
type GridInstance = VeloxGrid & GridContext;

interface ColumnDragState {
  field: string;
  startX: number;
  element: HTMLElement | null;
}

interface RowDragState {
  index: number;
  startY: number;
  element: HTMLElement | null;
}

interface ResizeState {
  column: ColumnDefinition;
  startX: number;
  startWidth: number;
}

export class GridDragManager {
  private columnDragging: ColumnDragState | null = null;
  private rowDragging: RowDragState | null = null;
  private resizing: ResizeState | null = null;

  private boundHandleColumnDragMove: (e: MouseEvent) => void;
  private boundHandleColumnDragEnd: (e: MouseEvent) => void;
  private boundHandleRowDragMove: (e: MouseEvent) => void;
  private boundHandleRowDragEnd: (e: MouseEvent) => void;
  private boundHandleResizeMove: (e: MouseEvent) => void;
  private boundHandleResizeEnd: (e: MouseEvent) => void;

  constructor(private ctx: GridInstance) {
    this.boundHandleColumnDragMove = this.handleColumnDragMove.bind(this);
    this.boundHandleColumnDragEnd = this.handleColumnDragEnd.bind(this);
    this.boundHandleRowDragMove = this.handleRowDragMove.bind(this);
    this.boundHandleRowDragEnd = this.handleRowDragEnd.bind(this);
    this.boundHandleResizeMove = this.handleResizeMove.bind(this);
    this.boundHandleResizeEnd = this.handleResizeEnd.bind(this);
  }

  // ============================================
  // Column Drag & Drop
  // ============================================

  /**
   * Column 드래그 시작
   */
  startColumnDrag(e: MouseEvent, column: ColumnDefinition): void {
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

  /**
   * Column 드래그 이동
   */
  private handleColumnDragMove(e: MouseEvent): void {
    const ctx = this.ctx;

    if (!this.columnDragging?.element) return;
    
    this.columnDragging.element.style.left = `${e.clientX + 10}px`;
    this.columnDragging.element.style.top = `${e.clientY + 10}px`;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    // Phase 19: grouped 헤더 셀도 드롭 타겟으로 인식
    const headerCell = target?.closest('.velox-header-cell, .velox-header-cell--grouped') as HTMLElement;
    
    ctx.headerElement.querySelectorAll('.velox-header-cell--drop-target').forEach((el: Element) => {
      removeClass(el as HTMLElement, 'velox-header-cell--drop-target');
    });
    
    if (headerCell && headerCell.dataset.field && headerCell.dataset.field !== this.columnDragging.field) {
      // Phase 19: 같은 그룹 내에서만 드롭 타겟 표시
      const sourceGroup = ctx.getGroupNameFor(this.columnDragging.field);
      const targetGroup = ctx.getGroupNameFor(headerCell.dataset.field);
      if (sourceGroup === targetGroup) {
        addClass(headerCell, 'velox-header-cell--drop-target');
      }
    }
  }

  /**
   * Column 드래그 종료
   */
  private handleColumnDragEnd(e: MouseEvent): void {
    const ctx = this.ctx;

    if (!this.columnDragging) return;
    
    const sourceField = this.columnDragging.field;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const headerCell = target?.closest('.velox-header-cell, .velox-header-cell--grouped') as HTMLElement;
    const targetField = headerCell?.dataset.field;
    
    if (this.columnDragging.element) {
      this.columnDragging.element.remove();
    }
    ctx.headerElement.querySelectorAll('.velox-header-cell--drop-target').forEach((el: Element) => {
      removeClass(el as HTMLElement, 'velox-header-cell--drop-target');
    });
    
    document.removeEventListener('mousemove', this.boundHandleColumnDragMove);
    document.removeEventListener('mouseup', this.boundHandleColumnDragEnd);
    removeClass(document.body, 'velox-no-select');
    
    if (targetField && targetField !== sourceField) {
      ctx.reorderColumn(sourceField, targetField);
    }
    
    this.columnDragging = null;
  }

  /**
   * Column 드래그 중인지 확인
   */
  isColumnDragging(): boolean {
    return this.columnDragging !== null;
  }

  // ============================================
  // Row Drag & Drop
  // ============================================

  /**
   * Row 드래그 시작
   */
  startRowDrag(e: MouseEvent, rowIndex: number, rowElement: HTMLElement): void {
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

  /**
   * Row 드래그 이동
   */
  private handleRowDragMove(e: MouseEvent): void {
    const ctx = this.ctx;

    if (!this.rowDragging?.element) return;
    
    this.rowDragging.element.style.left = `${e.clientX + 10}px`;
    this.rowDragging.element.style.top = `${e.clientY + 10}px`;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const rowElement = target?.closest('.velox-row') as HTMLElement;
    
    ctx.bodyInner.querySelectorAll('.velox-row--drop-target').forEach((el: Element) => {
      removeClass(el as HTMLElement, 'velox-row--drop-target');
    });
    ctx.fixedLeftBodyInner?.querySelectorAll('.velox-row--drop-target').forEach((el: Element) => {
      removeClass(el as HTMLElement, 'velox-row--drop-target');
    });
    
    if (rowElement) {
      const targetIndex = parseInt(rowElement.dataset.rowIndex || '-1', 10);
      if (targetIndex !== -1 && targetIndex !== this.rowDragging.index) {
        addClass(rowElement, 'velox-row--drop-target');
      }
    }
  }

  /**
   * Row 드래그 종료
   */
  private handleRowDragEnd(e: MouseEvent): void {
    const ctx = this.ctx;

    if (!this.rowDragging) return;
    
    const sourceIndex = this.rowDragging.index;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const rowElement = target?.closest('.velox-row') as HTMLElement;
    const targetIndex = rowElement ? parseInt(rowElement.dataset.rowIndex || '-1', 10) : -1;
    
    if (this.rowDragging.element) {
      this.rowDragging.element.remove();
    }
    ctx.bodyInner.querySelectorAll('.velox-row--dragging, .velox-row--drop-target').forEach((el: Element) => {
      removeClass(el as HTMLElement, 'velox-row--dragging');
      removeClass(el as HTMLElement, 'velox-row--drop-target');
    });
    ctx.fixedLeftBodyInner?.querySelectorAll('.velox-row--dragging, .velox-row--drop-target').forEach((el: Element) => {
      removeClass(el as HTMLElement, 'velox-row--dragging');
      removeClass(el as HTMLElement, 'velox-row--drop-target');
    });
    
    document.removeEventListener('mousemove', this.boundHandleRowDragMove);
    document.removeEventListener('mouseup', this.boundHandleRowDragEnd);
    removeClass(document.body, 'velox-no-select');
    
    if (targetIndex !== -1 && targetIndex !== sourceIndex) {
      ctx.moveRow(sourceIndex, targetIndex);
    }
    
    this.rowDragging = null;
  }

  /**
   * Row 드래그 중인지 확인
   */
  isRowDragging(): boolean {
    return this.rowDragging !== null;
  }

  // ============================================
  // Column Resize
  // ============================================

  /**
   * Column 리사이즈 시작
   */
  startResize(e: MouseEvent, column: ColumnDefinition): void {
    const ctx = this.ctx;

    e.preventDefault();
    e.stopPropagation();
    
    const headerCell = ctx.headerElement.querySelector(`[data-field="${column.field}"]`) as HTMLElement;
    
    if (headerCell) {
      this.resizing = {
        column,
        startX: e.clientX,
        startWidth: headerCell.offsetWidth,
      };
      
      document.addEventListener('mousemove', this.boundHandleResizeMove);
      document.addEventListener('mouseup', this.boundHandleResizeEnd);
      addClass(document.body, 'velox-no-select');
    }
  }

  /**
   * Column 리사이즈 이동
   */
  private handleResizeMove(e: MouseEvent): void {
    const ctx = this.ctx;

    if (!this.resizing) return;
    
    const deltaX = e.clientX - this.resizing.startX;
    const newWidth = Math.max(50, this.resizing.startWidth + deltaX);
    
    this.resizing.column.width = newWidth;
    
    ctx.invalidateColumnCache();
    ctx.render();
  }

  /**
   * Column 리사이즈 종료
   */
  private handleResizeEnd(): void {
    const ctx = this.ctx;
    
    if (!this.resizing) return;
    
    document.removeEventListener('mousemove', this.boundHandleResizeMove);
    document.removeEventListener('mouseup', this.boundHandleResizeEnd);
    removeClass(document.body, 'velox-no-select');
    
    ctx.emitEvent('onColumnResize', this.resizing.column.field, this.resizing.column.width || 0);
    
    this.resizing = null;
  }

  /**
   * 리사이즈 중인지 확인
   */
  isResizing(): boolean {
    return this.resizing !== null;
  }

  /**
   * 모든 드래그 상태 초기화
   */
  cleanup(): void {
    // Column drag cleanup
    if (this.columnDragging) {
      if (this.columnDragging.element) {
        this.columnDragging.element.remove();
      }
      document.removeEventListener('mousemove', this.boundHandleColumnDragMove);
      document.removeEventListener('mouseup', this.boundHandleColumnDragEnd);
      this.columnDragging = null;
    }

    // Row drag cleanup
    if (this.rowDragging) {
      if (this.rowDragging.element) {
        this.rowDragging.element.remove();
      }
      document.removeEventListener('mousemove', this.boundHandleRowDragMove);
      document.removeEventListener('mouseup', this.boundHandleRowDragEnd);
      this.rowDragging = null;
    }

    // Resize cleanup
    if (this.resizing) {
      document.removeEventListener('mousemove', this.boundHandleResizeMove);
      document.removeEventListener('mouseup', this.boundHandleResizeEnd);
      this.resizing = null;
    }

    removeClass(document.body, 'velox-no-select');
  }

  /**
   * 리소스 정리 (destroy 별칭)
   */
  destroy(): void {
    this.cleanup();
  }
}
