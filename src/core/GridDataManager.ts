/**
 * GridDataManager - Data Management for VeloxGrid
 * @description Handles data operations, sorting, and filtering
 */

import type {
  RowData,
  SortState,
  FilterState,
  FilterCondition,
  ValueType,
  CellValue,
} from '../types';
import { sortData, filterData } from '../utils/data';

export class GridDataManager {
  private data: RowData[] = [];
  private displayData: RowData[] = [];
  private dataIndexMap: Map<RowData, number> = new Map();

  // Sort & Filter state
  private sort: SortState[] = [];
  private filter: FilterState | null = null;

  constructor(data: RowData[] = []) {
    if (data.length > 0) {
      this.setData(data);
    }
  }

  // ============================================
  // Data Access
  // ============================================

  getData(): RowData[] {
    return this.data.map(row => ({ ...row }));
  }

  getDisplayData(): RowData[] {
    return this.displayData;
  }

  getRow(displayIndex: number): RowData | null {
    return this.displayData[displayIndex] || null;
  }

  getRowCount(): number {
    return this.data.length;
  }

  getDisplayCount(): number {
    return this.displayData.length;
  }

  getDataIndex(displayRow: RowData): number {
    return this.dataIndexMap.get(displayRow) ?? -1;
  }

  getOriginalIndex(displayIndex: number): number {
    const row = this.displayData[displayIndex];
    return row ? this.data.indexOf(row) : -1;
  }

  // ============================================
  // Data Modification
  // ============================================

  setData(data: RowData[]): void {
    this.data = data.map(row => ({ ...row }));
    this.rebuildIndexMap();
    this.applyTransformations();
  }

  addRow(row: RowData, index?: number): number {
    const newRow = { ...row };
    const insertIndex = index !== undefined ? index : this.data.length;
    this.data.splice(insertIndex, 0, newRow);
    this.rebuildIndexMap();
    this.applyTransformations();
    return insertIndex;
  }

  updateRow(displayIndex: number, updates: Partial<RowData>): boolean {
    const displayRow = this.displayData[displayIndex];
    if (!displayRow) return false;

    const dataIndex = this.data.indexOf(displayRow);
    if (dataIndex >= 0) {
      Object.assign(this.data[dataIndex], updates);
      this.applyTransformations();
      return true;
    }
    return false;
  }

  removeRow(displayIndex: number): RowData | null {
    const displayRow = this.displayData[displayIndex];
    if (!displayRow) return null;

    const dataIndex = this.data.indexOf(displayRow);
    if (dataIndex >= 0) {
      const [removed] = this.data.splice(dataIndex, 1);
      this.rebuildIndexMap();
      this.applyTransformations();
      return removed;
    }
    return null;
  }

  clearData(): void {
    this.data = [];
    this.displayData = [];
    this.dataIndexMap.clear();
  }

  setCellValue(displayIndex: number, field: string, value: CellValue): boolean {
    const displayRow = this.displayData[displayIndex];
    if (!displayRow) return false;

    const dataIndex = this.data.indexOf(displayRow);
    if (dataIndex >= 0) {
      this.data[dataIndex][field] = value;
      this.applyTransformations();
      return true;
    }
    return false;
  }

  getCellValue(displayIndex: number, field: string): unknown {
    return this.displayData[displayIndex]?.[field];
  }

  // ============================================
  // Row Reorder (for drag & drop)
  // ============================================

  moveRow(fromDisplayIndex: number, toDisplayIndex: number): boolean {
    const displayRow = this.displayData[fromDisplayIndex];
    if (!displayRow) return false;

    const dataIndex = this.data.indexOf(displayRow);
    if (dataIndex === -1) return false;

    const targetDisplayRow = this.displayData[toDisplayIndex];
    const targetDataIndex = targetDisplayRow
      ? this.data.indexOf(targetDisplayRow)
      : this.data.length;

    const [removed] = this.data.splice(dataIndex, 1);
    const adjustedTargetIndex = targetDataIndex > dataIndex
      ? targetDataIndex - 1
      : targetDataIndex;
    this.data.splice(adjustedTargetIndex, 0, removed);

    this.rebuildIndexMap();
    this.applyTransformations();
    return true;
  }

  // ============================================
  // Sort & Filter
  // ============================================

  getSortState(): SortState[] {
    return [...this.sort];
  }

  getFilterState(): FilterState | null {
    return this.filter ? { ...this.filter } : null;
  }

  setSort(field: string, direction: 'asc' | 'desc' | null): void {
    this.sort = direction ? [{ field, direction }] : [];
    this.applyTransformations();
  }

  toggleSort(field: string): 'asc' | 'desc' | null {
    const existing = this.sort.find(s => s.field === field);
    let newDirection: 'asc' | 'desc' | null = 'asc';

    if (existing) {
      if (existing.direction === 'asc') newDirection = 'desc';
      else if (existing.direction === 'desc') newDirection = null;
    }

    this.setSort(field, newDirection);
    return newDirection;
  }

  clearSort(): void {
    this.sort = [];
    this.applyTransformations();
  }

  setFilter(conditions: FilterCondition | FilterCondition[]): void {
    const conditionArray = Array.isArray(conditions) ? conditions : [conditions];
    this.filter = { conditions: conditionArray, logic: 'and' };
    this.applyTransformations();
  }

  addFilterCondition(field: string, operator: string, value: CellValue): void {
    const newCondition: FilterCondition = { field, operator: operator as any, value };

    if (this.filter) {
      const conditions = this.filter.conditions.filter(c => c.field !== field);
      conditions.push(newCondition);
      this.filter = { conditions, logic: 'and' };
    } else {
      this.filter = { conditions: [newCondition], logic: 'and' };
    }

    this.applyTransformations();
  }

  removeFilterCondition(field: string): void {
    if (this.filter) {
      const conditions = this.filter.conditions.filter(c => c.field !== field);
      this.filter = conditions.length === 0 ? null : { conditions, logic: 'and' };
      this.applyTransformations();
    }
  }

  clearFilter(): void {
    this.filter = null;
    this.applyTransformations();
  }

  // ============================================
  // Data Transformations
  // ============================================

  applyTransformations(columnTypes?: Record<string, ValueType>): void {
    let data = [...this.data];

    // Apply filter
    if (this.filter) {
      data = filterData(data, this.filter);
    }

    // Apply sort
    if (this.sort.length > 0 && columnTypes) {
      data = sortData(data, this.sort, columnTypes);
    }

    this.displayData = data;
  }

  // ============================================
  // Private Methods
  // ============================================

  private rebuildIndexMap(): void {
    this.dataIndexMap.clear();
    this.data.forEach((row, index) => {
      this.dataIndexMap.set(row, index);
    });
  }

  // ============================================
  // Bulk Operations
  // ============================================

  /**
   * Get selected data based on display indices
   */
  getSelectedData(indices: number[]): RowData[] {
    return indices
      .map(i => this.displayData[i])
      .filter(Boolean)
      .map(row => ({ ...row }));
  }

  /**
   * Get data for export
   */
  getExportData(options: {
    selectedOnly?: boolean;
    filteredOnly?: boolean;
    selectedIndices?: number[];
  } = {}): RowData[] {
    if (options.selectedOnly && options.selectedIndices) {
      return this.getSelectedData(options.selectedIndices);
    }
    if (options.filteredOnly) {
      return this.displayData.map(row => ({ ...row }));
    }
    return this.getData();
  }
}
