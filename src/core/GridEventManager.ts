/**
 * GridEventManager - Event Handling Module  
 * Phase 8: Code Structure Optimization (Step 3)
 * 
 * VeloxGrid의 이벤트 핸들링 로직을 담당하는 모듈
 * - Row/Cell 클릭 이벤트
 * - 키보드 이벤트
 * - 리사이즈 이벤트
 */

import type { GridContext } from '../types';
import type { VeloxGrid } from './VeloxGrid';

// VeloxGrid는 GridContext를 구현하므로, 타입 안전성을 위해 GridContext 사용
type GridInstance = VeloxGrid & GridContext;

export class GridEventManager {
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleResize: () => void;
  private boundHandleScroll: () => void;

  constructor(private ctx: GridInstance) {
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleResize = this.handleResize.bind(this);
    this.boundHandleScroll = this.handleScroll.bind(this);
  }

  /**
   * 이벤트 리스너 등록
   */
  attachEvents(): void {
    const ctx = this.ctx;
    // Keyboard events
    ctx.rootElement.addEventListener('keydown', this.boundHandleKeyDown);
    
    // Scroll events
    if (ctx.bodyElement) {
      ctx.bodyElement.addEventListener('scroll', this.boundHandleScroll);
    }
    
    // Resize events (throttled)
    window.addEventListener('resize', this.boundHandleResize);
  }

  /**
   * 이벤트 리스너 제거
   */
  detachEvents(): void {
    const ctx = this.ctx;
    ctx.rootElement?.removeEventListener('keydown', this.boundHandleKeyDown);
    ctx.bodyElement?.removeEventListener('scroll', this.boundHandleScroll);
    window.removeEventListener('resize', this.boundHandleResize);
  }

  /**
   * Row 클릭 핸들러
   */
  handleRowClick(rowIndex: number, e: MouseEvent): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
    if (!options.selectable) return;
    
    if (options.selectionStyle === 'row') {
      const isCtrlKey = e.ctrlKey || e.metaKey;
      const isShiftKey = e.shiftKey;
      
      if (options.selectionMode === 'multiple') {
        if (isCtrlKey) {
          // Toggle selection
          if (state.selection.selectedRows.has(rowIndex)) {
            state.selection.selectedRows.delete(rowIndex);
          } else {
            state.selection.selectedRows.add(rowIndex);
          }
        } else if (isShiftKey && state.selection.lastSelectedRow !== null) {
          // Range selection
          const start = Math.min(state.selection.lastSelectedRow, rowIndex);
          const end = Math.max(state.selection.lastSelectedRow, rowIndex);
          for (let i = start; i <= end; i++) {
            state.selection.selectedRows.add(i);
          }
        } else {
          // Single selection
          state.selection.selectedRows.clear();
          state.selection.selectedRows.add(rowIndex);
        }
      } else {
        // Single selection mode
        state.selection.selectedRows.clear();
        state.selection.selectedRows.add(rowIndex);
      }
      
      state.selection.lastSelectedRow = rowIndex;
      state.selection.selectedCells.clear();
      state.selection.focusedCell = null;
      ctx.render();
      ctx.emitEvent('onRowSelect', rowIndex, true);
      ctx.emitEvent('onSelectionChange', Array.from(state.selection.selectedRows));
    }
  }

  /**
   * Cell 클릭 핸들러
   */
  handleCellClick(rowIndex: number, field: string, value: any, e: MouseEvent): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
    if (options.selectionStyle === 'cell') {
      const cellKey = `${rowIndex}:${field}`;
      const isCtrlKey = e.ctrlKey || e.metaKey;
      
      if (options.selectionMode === 'multiple' && isCtrlKey) {
        // Toggle cell selection
        if (state.selection.selectedCells.has(cellKey)) {
          state.selection.selectedCells.delete(cellKey);
        } else {
          state.selection.selectedCells.add(cellKey);
        }
      } else {
        // Single cell selection
        state.selection.selectedCells.clear();
        state.selection.selectedCells.add(cellKey);
      }
      
      state.selection.focusedCell = { rowIndex, field };
      state.selection.selectedRows.clear();
      ctx.render();
    }
    
    ctx.emitEvent('onCellClick', rowIndex, field, value);
  }

  /**
   * Row 더블클릭 핸들러
   */
  handleRowDoubleClick(rowIndex: number, _e: MouseEvent): void {
    const ctx = this.ctx;
    const state = ctx.getState();
    const row = state.displayData[rowIndex];
    if (row) {
      ctx.emitEvent('onRowDoubleClick', rowIndex, row);
    }
  }

  /**
   * 키보드 이벤트 핸들러
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
    // Editing 상태일 때는 기본 동작 허용
    if (state.edit.editing) {
      return;
    }
    
    const isCtrlKey = e.ctrlKey || e.metaKey;
    
    // Ctrl+Z: Undo
    if (isCtrlKey && e.key === 'z' && options.undoable) {
      e.preventDefault();
      ctx.undo();
      return;
    }
    
    // Ctrl+Y or Ctrl+Shift+Z: Redo
    if (isCtrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z')) && options.undoable) {
      e.preventDefault();
      ctx.redo();
      return;
    }
    
    // Ctrl+C: Copy
    if (isCtrlKey && e.key === 'c') {
      e.preventDefault();
      ctx.copy();
      return;
    }
    
    // Ctrl+V: Paste
    if (isCtrlKey && e.key === 'v') {
      e.preventDefault();
      ctx.paste();
      return;
    }
    
    // Ctrl+X: Cut
    if (isCtrlKey && e.key === 'x') {
      e.preventDefault();
      ctx.cut();
      return;
    }
    
    // Delete: Delete selected cells
    if (e.key === 'Delete' && options.editable) {
      e.preventDefault();
      ctx.deleteSelectedCells();
      return;
    }
    
    // Arrow keys: Navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      this.handleArrowKey(e.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight');
      return;
    }
    
    // Enter: Start editing or move down
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleEnterKey();
      return;
    }
    
    // Tab: Move to next cell
    if (e.key === 'Tab') {
      e.preventDefault();
      this.handleTabKey(e.shiftKey);
      return;
    }
  }

  /**
   * 화살표 키 핸들러
   */
  private handleArrowKey(key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
    if (options.selectionStyle === 'cell') {
      const focusedCell = state.selection.focusedCell;
      if (!focusedCell) return;
      
      const columns = ctx.getScrollableColumns();
      const currentColIndex = columns.findIndex(c => c.field === focusedCell.field);
      
      let newRowIndex = focusedCell.rowIndex;
      let newColIndex = currentColIndex;
      
      switch (key) {
        case 'ArrowUp':
          newRowIndex = Math.max(0, focusedCell.rowIndex - 1);
          break;
        case 'ArrowDown':
          newRowIndex = Math.min(state.displayData.length - 1, focusedCell.rowIndex + 1);
          break;
        case 'ArrowLeft':
          newColIndex = Math.max(0, currentColIndex - 1);
          break;
        case 'ArrowRight':
          newColIndex = Math.min(columns.length - 1, currentColIndex + 1);
          break;
      }
      
      if (newRowIndex !== focusedCell.rowIndex || newColIndex !== currentColIndex) {
        const newField = columns[newColIndex]?.field;
        if (newField) {
          state.selection.focusedCell = { rowIndex: newRowIndex, field: newField };
          const cellKey = `${newRowIndex}:${newField}`;
          state.selection.selectedCells.clear();
          state.selection.selectedCells.add(cellKey);
          ctx.render();
          
          // Scroll into view
          this.scrollCellIntoView(newRowIndex, newField);
        }
      }
    } else if (options.selectionStyle === 'row') {
      const selectedRows = Array.from(state.selection.selectedRows) as number[];
      if (selectedRows.length === 0) return;
      
      const currentRow = Math.max(...selectedRows);
      let newRow = currentRow;
      
      switch (key) {
        case 'ArrowUp':
          newRow = Math.max(0, currentRow - 1);
          break;
        case 'ArrowDown':
          newRow = Math.min(state.displayData.length - 1, currentRow + 1);
          break;
      }
      
      if (newRow !== currentRow) {
        state.selection.selectedRows.clear();
        state.selection.selectedRows.add(newRow);
        state.selection.lastSelectedRow = newRow;
        ctx.render();
        
        // Scroll into view
        this.scrollRowIntoView(newRow);
      }
    }
  }

  /**
   * Enter 키 핸들러
   */
  private handleEnterKey(): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
    if (options.selectionStyle === 'cell' && options.editable) {
      const focusedCell = state.selection.focusedCell;
      if (focusedCell) {
        ctx.startEdit(focusedCell.rowIndex, focusedCell.field);
      }
    }
  }

  /**
   * Tab 키 핸들러
   */
  private handleTabKey(shiftKey: boolean): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    const state = ctx.getState();
    
    if (options.selectionStyle === 'cell') {
      const focusedCell = state.selection.focusedCell;
      if (!focusedCell) return;
      
      const columns = ctx.getScrollableColumns();
      const currentColIndex = columns.findIndex(c => c.field === focusedCell.field);
      
      let newRowIndex = focusedCell.rowIndex;
      let newColIndex = currentColIndex;
      
      if (shiftKey) {
        // Shift+Tab: Move left or previous row
        newColIndex = currentColIndex - 1;
        if (newColIndex < 0) {
          newRowIndex = Math.max(0, focusedCell.rowIndex - 1);
          newColIndex = columns.length - 1;
        }
      } else {
        // Tab: Move right or next row
        newColIndex = currentColIndex + 1;
        if (newColIndex >= columns.length) {
          newRowIndex = Math.min(state.displayData.length - 1, focusedCell.rowIndex + 1);
          newColIndex = 0;
        }
      }
      
      const newField = columns[newColIndex]?.field;
      if (newField) {
        state.selection.focusedCell = { rowIndex: newRowIndex, field: newField };
        const cellKey = `${newRowIndex}:${newField}`;
        state.selection.selectedCells.clear();
        state.selection.selectedCells.add(cellKey);
        ctx.render();
        
        // Scroll into view
        this.scrollCellIntoView(newRowIndex, newField);
      }
    }
  }

  /**
   * 리사이즈 핸들러
   */
  private handleResize(): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    if (options.virtualScroll) {
      ctx.render();
    }
  }

  /**
   * 스크롤 핸들러
   */
  private handleScroll(): void {
    const ctx = this.ctx;
    const options = ctx.getOptions();
    
    if (options.virtualScroll) {
      ctx.render();
    }
    
    // Sync fixed left scroll
    if (ctx.fixedLeftBody && ctx.bodyElement) {
      ctx.fixedLeftBody.scrollTop = ctx.bodyElement.scrollTop;
    }
  }

  /**
   * Cell을 화면에 보이도록 스크롤
   */
  private scrollCellIntoView(rowIndex: number, field: string): void {
    const ctx = this.ctx;
    // Find the cell element
    const row = ctx.bodyInner.querySelector(`[data-row-index="${rowIndex}"]`);
    const cell = row?.querySelector(`[data-field="${field}"]`) as HTMLElement;
    
    if (cell && ctx.bodyElement) {
      const cellRect = cell.getBoundingClientRect();
      const bodyRect = ctx.bodyElement.getBoundingClientRect();
      
      // Vertical scroll
      if (cellRect.top < bodyRect.top) {
        ctx.bodyElement.scrollTop -= bodyRect.top - cellRect.top;
      } else if (cellRect.bottom > bodyRect.bottom) {
        ctx.bodyElement.scrollTop += cellRect.bottom - bodyRect.bottom;
      }
      
      // Horizontal scroll
      if (cellRect.left < bodyRect.left) {
        ctx.bodyElement.scrollLeft -= bodyRect.left - cellRect.left;
      } else if (cellRect.right > bodyRect.right) {
        ctx.bodyElement.scrollLeft += cellRect.right - bodyRect.right;
      }
    }
  }

  /**
   * Row를 화면에 보이도록 스크롤
   */
  private scrollRowIntoView(rowIndex: number): void {
    const ctx = this.ctx;
    const row = ctx.bodyInner.querySelector(`[data-row-index="${rowIndex}"]`) as HTMLElement;
    
    if (row && ctx.bodyElement) {
      const rowRect = row.getBoundingClientRect();
      const bodyRect = ctx.bodyElement.getBoundingClientRect();
      
      if (rowRect.top < bodyRect.top) {
        ctx.bodyElement.scrollTop -= bodyRect.top - rowRect.top;
      } else if (rowRect.bottom > bodyRect.bottom) {
        ctx.bodyElement.scrollTop += rowRect.bottom - bodyRect.bottom;
      }
    }
  }
}
