/**
 * GridVirtualScroll - Virtual Scroll Management for VeloxGrid
 * @description Handles virtual scrolling calculations for large datasets
 */

import type { RowData } from '../types';

export interface VirtualState {
  startIndex: number;
  endIndex: number;
  visibleCount: number;
  totalHeight: number;
}

export interface VirtualScrollOptions {
  enabled: boolean;
  rowHeight: number;
  bufferSize: number;
}

const DEFAULT_OPTIONS: VirtualScrollOptions = {
  enabled: false,
  rowHeight: 40,
  bufferSize: 5,
};

export class GridVirtualScroll {
  private options: VirtualScrollOptions;
  private state: VirtualState;

  constructor(options: Partial<VirtualScrollOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.state = {
      startIndex: 0,
      endIndex: 0,
      visibleCount: 0,
      totalHeight: 0,
    };
  }

  // ============================================
  // Configuration
  // ============================================

  setOptions(options: Partial<VirtualScrollOptions>): void {
    this.options = { ...this.options, ...options };
  }

  isEnabled(): boolean {
    return this.options.enabled;
  }

  getRowHeight(): number {
    return this.options.rowHeight;
  }

  // ============================================
  // State Access
  // ============================================

  getState(): VirtualState {
    return { ...this.state };
  }

  getTotalHeight(): number {
    return this.state.totalHeight;
  }

  getVisibleCount(): number {
    return this.state.visibleCount;
  }

  // ============================================
  // Calculations
  // ============================================

  /**
   * Calculate virtual scroll state based on container and scroll position
   */
  calculate(containerHeight: number, scrollTop: number, totalRows: number): VirtualState {
    if (!this.options.enabled) {
      this.state = {
        startIndex: 0,
        endIndex: totalRows,
        visibleCount: totalRows,
        totalHeight: totalRows * this.options.rowHeight,
      };
      return this.state;
    }

    const { rowHeight, bufferSize } = this.options;

    this.state.visibleCount = Math.ceil(containerHeight / rowHeight);
    this.state.startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferSize);
    this.state.endIndex = Math.min(
      totalRows,
      this.state.startIndex + this.state.visibleCount + bufferSize * 2
    );
    this.state.totalHeight = totalRows * rowHeight;

    return this.state;
  }

  /**
   * Get visible rows from data array
   */
  getVisibleRows<T extends RowData>(data: T[]): { data: T; index: number }[] {
    if (!this.options.enabled) {
      return data.map((d, index) => ({ data: d, index }));
    }

    const rows: { data: T; index: number }[] = [];
    for (let i = this.state.startIndex; i < this.state.endIndex; i++) {
      if (data[i]) {
        rows.push({ data: data[i], index: i });
      }
    }
    return rows;
  }

  /**
   * Calculate row position (top offset) for virtual scrolling
   */
  getRowTop(index: number): number {
    return index * this.options.rowHeight;
  }

  /**
   * Calculate scroll position to show a specific row
   */
  getScrollTopForRow(rowIndex: number, containerHeight: number): number {
    const rowTop = this.getRowTop(rowIndex);
    const rowBottom = rowTop + this.options.rowHeight;
    const currentVisibleStart = this.state.startIndex * this.options.rowHeight;
    const currentVisibleEnd = currentVisibleStart + containerHeight;

    // Row is above visible area
    if (rowTop < currentVisibleStart) {
      return rowTop;
    }
    // Row is below visible area
    if (rowBottom > currentVisibleEnd) {
      return rowBottom - containerHeight;
    }
    // Row is already visible
    return -1; // No scroll needed
  }

  /**
   * Check if a row index is currently visible
   */
  isRowVisible(index: number): boolean {
    return index >= this.state.startIndex && index < this.state.endIndex;
  }

  /**
   * Get page size for PageUp/PageDown navigation
   */
  getPageSize(): number {
    return Math.max(1, this.state.visibleCount - 1);
  }

  /**
   * Reset state (useful when data changes)
   */
  reset(): void {
    this.state = {
      startIndex: 0,
      endIndex: 0,
      visibleCount: 0,
      totalHeight: 0,
    };
  }
}
