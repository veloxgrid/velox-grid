/**
 * GridEventManager - Event Handling Module  
 * Phase 8: Code Structure Optimization (Step 3)
 * 
 * VeloxGrid의 이벤트 핸들링 로직을 담당하는 모듈
 * - Row/Cell 클릭 이벤트
 * - 키보드 이벤트
 * - 리사이즈 이벤트
 */

import type { VeloxGrid } from './VeloxGrid';

export class GridEventManager {
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleResize: () => void;
  private boundHandleScroll: () => void;

  constructor(private grid: VeloxGrid) {
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleResize = this.handleResize.bind(this);
    this.boundHandleScroll = this.handleScroll.bind(this);
  }

  /**
   * 이벤트 리스너 등록
   */
  attachEvents(): void {
    const grid = this.grid as any;
    
    // Keyboard events
    grid.rootElement.addEventListener('keydown', this.boundHandleKeyDown);
    
    // Scroll events
    if (grid.bodyElement) {
      grid.bodyElement.addEventListener('scroll', this.boundHandleScroll);
    }
    
    // Resize events (throttled)
    window.addEventListener('resize', this.boundHandleResize);
  }

  /**
   * 이벤트 리스너 제거
   */
  detachEvents(): void {
    const grid = this.grid as any;
    
    grid.rootElement?.removeEventListener('keydown', this.boundHandleKeyDown);
    grid.bodyElement?.removeEventListener('scroll', this.boundHandleScroll);
    window.removeEventListener('resize', this.boundHandleResize);
  }

  /**
   * Row 클릭 핸들러
   */
  handleRowClick(rowIndex: number, e: MouseEvent): void {
    const grid = this.grid as any;
    
    if (!grid.options.selectable) return;
    
    if (grid.options.selectionStyle === 'row') {
      const isCtrlKey = e.ctrlKey || e.metaKey;
      const isShiftKey = e.shiftKey;
      
      if (grid.options.selectionMode === 'multiple') {
        if (isCtrlKey) {
          // Toggle selection
          if (grid.state.selection.selectedRows.has(rowIndex)) {
            grid.state.selection.selectedRows.delete(rowIndex);
          } else {
            grid.state.selection.selectedRows.add(rowIndex);
          }
        } else if (isShiftKey && grid.state.selection.lastSelectedRow !== null) {
          // Range selection
          const start = Math.min(grid.state.selection.lastSelectedRow, rowIndex);
          const end = Math.max(grid.state.selection.lastSelectedRow, rowIndex);
          for (let i = start; i <= end; i++) {
            grid.state.selection.selectedRows.add(i);
          }
        } else {
          // Single selection
          grid.state.selection.selectedRows.clear();
          grid.state.selection.selectedRows.add(rowIndex);
        }
      } else {
        // Single selection mode
        grid.state.selection.selectedRows.clear();
        grid.state.selection.selectedRows.add(rowIndex);
      }
      
      grid.state.selection.lastSelectedRow = rowIndex;
      grid.state.selection.selectedCells.clear();
      grid.state.selection.focusedCell = null;
      grid.render();
      grid.events.onRowSelect?.(rowIndex, e);
      grid.events.onSelectionChange?.(Array.from(grid.state.selection.selectedRows));
    }
  }

  /**
   * Cell 클릭 핸들러
   */
  handleCellClick(rowIndex: number, field: string, value: any, e: MouseEvent): void {
    const grid = this.grid as any;
    
    if (grid.options.selectionStyle === 'cell') {
      const cellKey = `${rowIndex}:${field}`;
      const isCtrlKey = e.ctrlKey || e.metaKey;
      
      if (grid.options.selectionMode === 'multiple' && isCtrlKey) {
        // Toggle cell selection
        if (grid.state.selection.selectedCells.has(cellKey)) {
          grid.state.selection.selectedCells.delete(cellKey);
        } else {
          grid.state.selection.selectedCells.add(cellKey);
        }
      } else {
        // Single cell selection
        grid.state.selection.selectedCells.clear();
        grid.state.selection.selectedCells.add(cellKey);
      }
      
      grid.state.selection.focusedCell = { rowIndex, field };
      grid.state.selection.selectedRows.clear();
      grid.render();
    }
    
    grid.events.onCellClick?.({ rowIndex, field, value, event: e });
  }

  /**
   * Row 더블클릭 핸들러
   */
  handleRowDoubleClick(rowIndex: number, e: MouseEvent): void {
    const grid = this.grid as any;
    grid.events.onRowDoubleClick?.(rowIndex, e);
  }

  /**
   * 키보드 이벤트 핸들러
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const grid = this.grid as any;
    
    // Editing 상태일 때는 기본 동작 허용
    if (grid.state.edit.editing) {
      return;
    }
    
    const isCtrlKey = e.ctrlKey || e.metaKey;
    
    // Ctrl+Z: Undo
    if (isCtrlKey && e.key === 'z' && grid.options.undoable) {
      e.preventDefault();
      grid.undo();
      return;
    }
    
    // Ctrl+Y or Ctrl+Shift+Z: Redo
    if (isCtrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z')) && grid.options.undoable) {
      e.preventDefault();
      grid.redo();
      return;
    }
    
    // Ctrl+C: Copy
    if (isCtrlKey && e.key === 'c') {
      e.preventDefault();
      grid.copy();
      return;
    }
    
    // Ctrl+V: Paste
    if (isCtrlKey && e.key === 'v') {
      e.preventDefault();
      grid.paste();
      return;
    }
    
    // Ctrl+X: Cut
    if (isCtrlKey && e.key === 'x') {
      e.preventDefault();
      grid.cut();
      return;
    }
    
    // Delete: Delete selected cells
    if (e.key === 'Delete' && grid.options.editable) {
      e.preventDefault();
      grid.deleteSelectedCells();
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
    const grid = this.grid as any;
    
    if (grid.options.selectionStyle === 'cell') {
      const focusedCell = grid.state.selection.focusedCell;
      if (!focusedCell) return;
      
      const columns = grid.getScrollableColumns();
      const currentColIndex = columns.findIndex((c: any) => c.field === focusedCell.field);
      
      let newRowIndex = focusedCell.rowIndex;
      let newColIndex = currentColIndex;
      
      switch (key) {
        case 'ArrowUp':
          newRowIndex = Math.max(0, focusedCell.rowIndex - 1);
          break;
        case 'ArrowDown':
          newRowIndex = Math.min(grid.state.displayData.length - 1, focusedCell.rowIndex + 1);
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
          grid.state.selection.focusedCell = { rowIndex: newRowIndex, field: newField };
          const cellKey = `${newRowIndex}:${newField}`;
          grid.state.selection.selectedCells.clear();
          grid.state.selection.selectedCells.add(cellKey);
          grid.render();
          
          // Scroll into view
          this.scrollCellIntoView(newRowIndex, newField);
        }
      }
    } else if (grid.options.selectionStyle === 'row') {
      const selectedRows = Array.from(grid.state.selection.selectedRows) as number[];
      if (selectedRows.length === 0) return;
      
      const currentRow = Math.max(...selectedRows);
      let newRow = currentRow;
      
      switch (key) {
        case 'ArrowUp':
          newRow = Math.max(0, currentRow - 1);
          break;
        case 'ArrowDown':
          newRow = Math.min(grid.state.displayData.length - 1, currentRow + 1);
          break;
      }
      
      if (newRow !== currentRow) {
        grid.state.selection.selectedRows.clear();
        grid.state.selection.selectedRows.add(newRow);
        grid.state.selection.lastSelectedRow = newRow;
        grid.render();
        
        // Scroll into view
        this.scrollRowIntoView(newRow);
      }
    }
  }

  /**
   * Enter 키 핸들러
   */
  private handleEnterKey(): void {
    const grid = this.grid as any;
    
    if (grid.options.selectionStyle === 'cell' && grid.options.editable) {
      const focusedCell = grid.state.selection.focusedCell;
      if (focusedCell) {
        grid.startEdit(focusedCell.rowIndex, focusedCell.field);
      }
    }
  }

  /**
   * Tab 키 핸들러
   */
  private handleTabKey(shiftKey: boolean): void {
    const grid = this.grid as any;
    
    if (grid.options.selectionStyle === 'cell') {
      const focusedCell = grid.state.selection.focusedCell;
      if (!focusedCell) return;
      
      const columns = grid.getScrollableColumns();
      const currentColIndex = columns.findIndex((c: any) => c.field === focusedCell.field);
      
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
          newRowIndex = Math.min(grid.state.displayData.length - 1, focusedCell.rowIndex + 1);
          newColIndex = 0;
        }
      }
      
      const newField = columns[newColIndex]?.field;
      if (newField) {
        grid.state.selection.focusedCell = { rowIndex: newRowIndex, field: newField };
        const cellKey = `${newRowIndex}:${newField}`;
        grid.state.selection.selectedCells.clear();
        grid.state.selection.selectedCells.add(cellKey);
        grid.render();
        
        // Scroll into view
        this.scrollCellIntoView(newRowIndex, newField);
      }
    }
  }

  /**
   * 리사이즈 핸들러
   */
  private handleResize(): void {
    const grid = this.grid as any;
    if (grid.options.virtualScroll) {
      grid.render();
    }
  }

  /**
   * 스크롤 핸들러
   */
  private handleScroll(): void {
    const grid = this.grid as any;
    
    if (grid.options.virtualScroll) {
      grid.render();
    }
    
    // Sync fixed left scroll
    if (grid.fixedLeftBody && grid.bodyElement) {
      grid.fixedLeftBody.scrollTop = grid.bodyElement.scrollTop;
    }
  }

  /**
   * Cell을 화면에 보이도록 스크롤
   */
  private scrollCellIntoView(rowIndex: number, field: string): void {
    const grid = this.grid as any;
    
    // Find the cell element
    const row = grid.bodyInner.querySelector(`[data-row-index="${rowIndex}"]`);
    const cell = row?.querySelector(`[data-field="${field}"]`) as HTMLElement;
    
    if (cell && grid.bodyElement) {
      const cellRect = cell.getBoundingClientRect();
      const bodyRect = grid.bodyElement.getBoundingClientRect();
      
      // Vertical scroll
      if (cellRect.top < bodyRect.top) {
        grid.bodyElement.scrollTop -= bodyRect.top - cellRect.top;
      } else if (cellRect.bottom > bodyRect.bottom) {
        grid.bodyElement.scrollTop += cellRect.bottom - bodyRect.bottom;
      }
      
      // Horizontal scroll
      if (cellRect.left < bodyRect.left) {
        grid.bodyElement.scrollLeft -= bodyRect.left - cellRect.left;
      } else if (cellRect.right > bodyRect.right) {
        grid.bodyElement.scrollLeft += cellRect.right - bodyRect.right;
      }
    }
  }

  /**
   * Row를 화면에 보이도록 스크롤
   */
  private scrollRowIntoView(rowIndex: number): void {
    const grid = this.grid as any;
    
    const row = grid.bodyInner.querySelector(`[data-row-index="${rowIndex}"]`) as HTMLElement;
    
    if (row && grid.bodyElement) {
      const rowRect = row.getBoundingClientRect();
      const bodyRect = grid.bodyElement.getBoundingClientRect();
      
      if (rowRect.top < bodyRect.top) {
        grid.bodyElement.scrollTop -= bodyRect.top - rowRect.top;
      } else if (rowRect.bottom > bodyRect.bottom) {
        grid.bodyElement.scrollTop += rowRect.bottom - bodyRect.bottom;
      }
    }
  }
}
