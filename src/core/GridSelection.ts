/**
 * GridSelection - Selection Management for VeloxGrid
 * @description Handles row selection, cell selection, and block selection
 */

import type {
  CellIndex,
  Selection,
  SelectionState,
  CheckBarState,
  CheckBarOptions,
  RowData,
  ColumnDefinition,
} from '../types';

export class GridSelection {
  private state: SelectionState;
  private checkBarState: CheckBarState;

  constructor() {
    this.state = {
      selectedRows: new Set<number>(),
      selectedCells: new Set<string>(),
      focusedCell: null,
      selections: [],
    };
    this.checkBarState = {
      checkedRows: new Set<number>(),
      checkableRows: new Set<number>(),
    };
  }

  // ============================================
  // State Access
  // ============================================

  getState(): SelectionState {
    return this.state;
  }

  getCheckBarState(): CheckBarState {
    return this.checkBarState;
  }

  // ============================================
  // Selection State Management
  // ============================================

  clearAll(): void {
    this.state.selectedRows.clear();
    this.state.selectedCells.clear();
    this.state.focusedCell = null;
    this.state.selections = [];
  }

  clearRowSelection(): void {
    this.state.selectedRows.clear();
  }

  clearCellSelection(): void {
    this.state.selectedCells.clear();
    this.state.focusedCell = null;
  }

  // ============================================
  // Row Selection
  // ============================================

  selectRow(index: number, selected: boolean, mode: 'single' | 'multiple' | 'extended' | 'none'): void {
    if (mode === 'none') return;

    if (selected) {
      if (mode === 'single') {
        this.state.selectedRows.clear();
      }
      this.state.selectedRows.add(index);
    } else {
      this.state.selectedRows.delete(index);
    }
  }

  selectRowRange(startIndex: number, endIndex: number): void {
    const min = Math.min(startIndex, endIndex);
    const max = Math.max(startIndex, endIndex);
    for (let i = min; i <= max; i++) {
      this.state.selectedRows.add(i);
    }
  }

  selectAllRows(count: number): void {
    for (let i = 0; i < count; i++) {
      this.state.selectedRows.add(i);
    }
  }

  isRowSelected(index: number): boolean {
    return this.state.selectedRows.has(index);
  }

  getSelectedRows(): number[] {
    return Array.from(this.state.selectedRows).sort((a, b) => a - b);
  }

  // ============================================
  // Cell Selection
  // ============================================

  selectCell(rowIndex: number, field: string, selected: boolean): void {
    const key = `${rowIndex}:${field}`;
    if (selected) {
      this.state.selectedCells.add(key);
    } else {
      this.state.selectedCells.delete(key);
    }
  }

  selectCellRange(
    startRow: number,
    startField: string,
    endRow: number,
    endField: string,
    columns: ColumnDefinition[]
  ): void {
    const startColIndex = columns.findIndex(c => c.field === startField);
    const endColIndex = columns.findIndex(c => c.field === endField);

    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);

    this.state.selectedCells.clear();

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const field = columns[c]?.field;
        if (field) {
          this.state.selectedCells.add(`${r}:${field}`);
        }
      }
    }
  }

  selectAllCells(rowCount: number, columns: ColumnDefinition[]): void {
    this.state.selectedCells.clear();
    for (let r = 0; r < rowCount; r++) {
      for (const col of columns) {
        this.state.selectedCells.add(`${r}:${col.field}`);
      }
    }
  }

  isCellSelected(rowIndex: number, field: string): boolean {
    return this.state.selectedCells.has(`${rowIndex}:${field}`);
  }

  getSelectedCells(): CellIndex[] {
    return Array.from(this.state.selectedCells).map(key => {
      const [rowIndex, field] = key.split(':');
      return { rowIndex: parseInt(rowIndex, 10), field };
    });
  }

  // ============================================
  // Focused Cell
  // ============================================

  setFocusedCell(rowIndex: number, field: string): void {
    this.state.focusedCell = { rowIndex, field };
  }

  getFocusedCell(): CellIndex | null {
    return this.state.focusedCell;
  }

  isCellFocused(rowIndex: number, field: string): boolean {
    const focused = this.state.focusedCell;
    return focused !== null && focused.rowIndex === rowIndex && focused.field === field;
  }

  // ============================================
  // Selection Object
  // ============================================

  setSelection(selection: Selection, columns: ColumnDefinition[]): void {
    this.state.selectedCells.clear();
    this.state.selectedRows.clear();

    if (selection.style === 'row') {
      for (let r = selection.startRow; r <= selection.endRow; r++) {
        this.state.selectedRows.add(r);
      }
    } else if ((selection.style === 'cell' || selection.style === 'block') &&
               selection.startColumn && selection.endColumn) {
      this.selectCellRange(
        selection.startRow,
        selection.startColumn,
        selection.endRow,
        selection.endColumn,
        columns
      );
    }

    this.state.selections = [selection];
  }

  getSelection(): Selection | null {
    return this.state.selections.length > 0 ? this.state.selections[0] : null;
  }

  // ============================================
  // CheckBar Management
  // ============================================

  initCheckableRows(
    displayData: RowData[],
    checkBar: CheckBarOptions | undefined
  ): void {
    this.checkBarState.checkableRows.clear();

    displayData.forEach((row, index) => {
      if (checkBar?.checkableCallback) {
        if (checkBar.checkableCallback(row, index)) {
          this.checkBarState.checkableRows.add(index);
        }
      } else {
        this.checkBarState.checkableRows.add(index);
      }
    });
  }

  checkItem(index: number, checked: boolean, exclusive: boolean): boolean {
    if (!this.checkBarState.checkableRows.has(index)) {
      return false;
    }

    if (exclusive && checked) {
      this.checkBarState.checkedRows.clear();
    }

    if (checked) {
      this.checkBarState.checkedRows.add(index);
    } else {
      this.checkBarState.checkedRows.delete(index);
    }

    return true;
  }

  checkAll(checked: boolean): void {
    if (checked) {
      this.checkBarState.checkableRows.forEach(index => {
        this.checkBarState.checkedRows.add(index);
      });
    } else {
      this.checkBarState.checkedRows.clear();
    }
  }

  getCheckedItems(): number[] {
    return Array.from(this.checkBarState.checkedRows).sort((a, b) => a - b);
  }

  isItemChecked(index: number): boolean {
    return this.checkBarState.checkedRows.has(index);
  }

  isItemCheckable(index: number): boolean {
    return this.checkBarState.checkableRows.has(index);
  }

  clearChecked(): void {
    this.checkBarState.checkedRows.clear();
  }

  // ============================================
  // Index Adjustment (after row removal)
  // ============================================

  adjustAfterRowRemoval(removedIndex: number): void {
    // Adjust selected rows
    this.state.selectedRows.delete(removedIndex);
    const newSelectedRows = new Set<number>();
    this.state.selectedRows.forEach(i => {
      if (i > removedIndex) newSelectedRows.add(i - 1);
      else if (i < removedIndex) newSelectedRows.add(i);
    });
    this.state.selectedRows = newSelectedRows;

    // Adjust checked rows
    this.checkBarState.checkedRows.delete(removedIndex);
    const newCheckedRows = new Set<number>();
    this.checkBarState.checkedRows.forEach(i => {
      if (i > removedIndex) newCheckedRows.add(i - 1);
      else if (i < removedIndex) newCheckedRows.add(i);
    });
    this.checkBarState.checkedRows = newCheckedRows;

    // Adjust focused cell
    if (this.state.focusedCell && this.state.focusedCell.rowIndex === removedIndex) {
      this.state.focusedCell = null;
    } else if (this.state.focusedCell && this.state.focusedCell.rowIndex > removedIndex) {
      this.state.focusedCell.rowIndex--;
    }
  }
}
