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

/** 드래그 시작 전 대기 상태 (임계값 판별용) */
interface ColumnDragPending {
  field: string;
  column: ColumnDefinition;
  startX: number;
  startY: number;
  groupName?: string; // 그룹 헤더 드래그 시 그룹명
}

interface ColumnDragState {
  field: string;
  startX: number;
  element: HTMLElement | null;
  groupName?: string; // 그룹 헤더 드래그 시 그룹명
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
  private static readonly DRAG_THRESHOLD = 5; // px — 이 거리 이상 이동해야 드래그 시작

  private columnDragPending: ColumnDragPending | null = null;
  private columnDragging: ColumnDragState | null = null;
  private rowDragging: RowDragState | null = null;
  private resizing: ResizeState | null = null;

  private boundHandleColumnDragPendingMove: (e: MouseEvent) => void;
  private boundHandleColumnDragPendingEnd: (e: MouseEvent) => void;
  private boundHandleColumnDragMove: (e: MouseEvent) => void;
  private boundHandleColumnDragEnd: (e: MouseEvent) => void;
  private boundHandleRowDragMove: (e: MouseEvent) => void;
  private boundHandleRowDragEnd: (e: MouseEvent) => void;
  private boundHandleResizeMove: (e: MouseEvent) => void;
  private boundHandleResizeEnd: (e: MouseEvent) => void;

  constructor(private ctx: GridInstance) {
    this.boundHandleColumnDragPendingMove = this.handleColumnDragPendingMove.bind(this);
    this.boundHandleColumnDragPendingEnd = this.handleColumnDragPendingEnd.bind(this);
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
   * Column 드래그 시작 (pending 상태 — 임계값 초과 시 실제 드래그 시작)
   * groupName이 지정되면 그룹 헤더 드래그 (최상위 레벨 이동)
   */
  startColumnDrag(e: MouseEvent, column: ColumnDefinition, groupName?: string): void {
    // 버튼 클릭과 구분하기 위해 즉시 드래그를 시작하지 않음
    e.preventDefault();
    
    this.columnDragPending = {
      field: column.field,
      column,
      startX: e.clientX,
      startY: e.clientY,
      groupName,
    };

    document.addEventListener('mousemove', this.boundHandleColumnDragPendingMove);
    document.addEventListener('mouseup', this.boundHandleColumnDragPendingEnd);
  }

  /**
   * Pending 상태에서 마우스 이동 — 임계값 초과 시 실제 드래그 시작
   */
  private handleColumnDragPendingMove(e: MouseEvent): void {
    if (!this.columnDragPending) return;

    const dx = e.clientX - this.columnDragPending.startX;
    const dy = e.clientY - this.columnDragPending.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= GridDragManager.DRAG_THRESHOLD) {
      // 임계값 초과 — 실제 드래그 시작
      const pending = this.columnDragPending;
      this.cleanupPendingListeners();
      this.columnDragPending = null;
      this.beginColumnDrag(e, pending.column, pending.groupName);
    }
  }

  /**
   * Pending 상태에서 마우스 업 — 드래그 취소 (클릭으로 처리)
   */
  private handleColumnDragPendingEnd(_e: MouseEvent): void {
    this.cleanupPendingListeners();
    this.columnDragPending = null;
  }

  /**
   * Pending 리스너 정리
   */
  private cleanupPendingListeners(): void {
    document.removeEventListener('mousemove', this.boundHandleColumnDragPendingMove);
    document.removeEventListener('mouseup', this.boundHandleColumnDragPendingEnd);
  }

  /**
   * 실제 Column 드래그 시작 (임계값 통과 후)
   */
  private beginColumnDrag(e: MouseEvent, column: ColumnDefinition, groupName?: string): void {
    this.columnDragging = {
      field: column.field,
      startX: e.clientX,
      element: null,
      groupName,
    };
    
    const indicator = createElement('div', 'velox-column-drag-indicator');
    indicator.textContent = groupName || column.header;
    indicator.style.position = 'fixed';
    indicator.style.left = `${e.clientX + 10}px`;
    indicator.style.top = `${e.clientY + 10}px`;
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
    // 모든 종류의 헤더 셀을 드롭 타겟으로 인식
    const headerCell = target?.closest('.velox-header-cell, .velox-header-cell--grouped, .velox-header-cell--group') as HTMLElement;
    
    // 이전 드롭 타겟 표시 제거
    ctx.headerElement.querySelectorAll('.velox-header-cell--drop-target').forEach((el: Element) => {
      removeClass(el as HTMLElement, 'velox-header-cell--drop-target');
    });
    
    if (!headerCell) return;

    const isGroupDrag = !!this.columnDragging.groupName;

    if (isGroupDrag) {
      // 그룹 드래그: 최상위 레벨 아이템(그룹 헤더 또는 독립 컬럼)만 드롭 타겟
      const targetGroupName = headerCell.dataset.groupName;
      const targetField = headerCell.dataset.field;
      const sourceGroupName = this.columnDragging.groupName;
      
      if (targetGroupName && targetGroupName !== sourceGroupName) {
        // 다른 그룹 헤더 위
        addClass(headerCell, 'velox-header-cell--drop-target');
      } else if (targetField && !ctx.getGroupNameFor(targetField)) {
        // 최상위 독립 컬럼 위
        addClass(headerCell, 'velox-header-cell--drop-target');
      }
    } else {
      // 일반 컬럼 드래그
      const targetField = headerCell.dataset.field;
      const targetGroupName = headerCell.dataset.groupName;
      const sourceGroup = ctx.getGroupNameFor(this.columnDragging.field);

      if (sourceGroup === null && ctx.hasColumnLayout()) {
        // 최상위 독립 컬럼 드래그 — 최상위 레벨 이동 허용
        if (targetGroupName) {
          // 독립 컬럼 → 그룹 헤더 위: 최상위 레벨 이동
          addClass(headerCell, 'velox-header-cell--drop-target');
        } else if (targetField && ctx.getGroupNameFor(targetField) === null
                   && targetField !== this.columnDragging.field) {
          // 독립 컬럼 → 독립 컬럼: 최상위 레벨 이동
          addClass(headerCell, 'velox-header-cell--drop-target');
        }
      } else if (targetField && targetField !== this.columnDragging.field) {
        // 그룹 내 컬럼 드래그: 같은 그룹 내에서만
        const targetGroup = ctx.getGroupNameFor(targetField);
        if (sourceGroup === targetGroup) {
          addClass(headerCell, 'velox-header-cell--drop-target');
        }
      }
    }
  }

  /**
   * Column 드래그 종료
   */
  private handleColumnDragEnd(e: MouseEvent): void {
    const ctx = this.ctx;

    if (!this.columnDragging) return;
    
    const isGroupDrag = !!this.columnDragging.groupName;
    const sourceGroupName = this.columnDragging.groupName;
    const sourceField = this.columnDragging.field;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    // 그룹 헤더 셀도 드롭 타겟으로 인식
    const headerCell = target?.closest('.velox-header-cell, .velox-header-cell--grouped, .velox-header-cell--group') as HTMLElement;
    
    if (this.columnDragging.element) {
      this.columnDragging.element.remove();
    }
    ctx.headerElement.querySelectorAll('.velox-header-cell--drop-target').forEach((el: Element) => {
      removeClass(el as HTMLElement, 'velox-header-cell--drop-target');
    });
    
    document.removeEventListener('mousemove', this.boundHandleColumnDragMove);
    document.removeEventListener('mouseup', this.boundHandleColumnDragEnd);
    removeClass(document.body, 'velox-no-select');
    
    if (headerCell) {
      if (isGroupDrag) {
        // 그룹 드래그: 최상위 레벨 아이템끼리 이동
        const targetGroupName = headerCell.dataset.groupName;
        const targetField = headerCell.dataset.field;
        
        if (targetGroupName && targetGroupName !== sourceGroupName) {
          // 그룹 → 그룹 이동
          ctx.reorderTopLevelLayout(sourceGroupName!, targetGroupName);
        } else if (targetField && !ctx.getGroupNameFor(targetField)) {
          // 그룹 → 독립 컬럼 위치로 이동
          ctx.reorderTopLevelLayout(sourceGroupName!, targetField);
        }
      } else {
        // 일반 컬럼 드래그
        const targetField = headerCell.dataset.field;
        const targetGroupName = headerCell.dataset.groupName;
        const sourceGroup = ctx.getGroupNameFor(sourceField);

        if (sourceGroup === null && ctx.hasColumnLayout()) {
          // 최상위 독립 컬럼 → 최상위 레벨 이동
          if (targetGroupName) {
            ctx.reorderTopLevelLayout(sourceField, targetGroupName);
          } else if (targetField && ctx.getGroupNameFor(targetField) === null
                     && targetField !== sourceField) {
            ctx.reorderTopLevelLayout(sourceField, targetField);
          }
        } else if (targetField && targetField !== sourceField) {
          // 그룹 내 컬럼 이동 (기존 로직)
          ctx.reorderColumn(sourceField, targetField);
        }
      }
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
    // Column drag pending cleanup
    if (this.columnDragPending) {
      this.cleanupPendingListeners();
      this.columnDragPending = null;
    }

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
