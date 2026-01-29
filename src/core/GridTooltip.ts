/**
 * VeloxGrid - GridTooltip
 * @description Cell tooltip management for hover information display
 * Phase 12.3: Cell Tooltip
 */

import type { CellValue, RowData, ColumnDefinition } from '../types';

export class GridTooltip {
  private tooltip: HTMLElement | null = null;
  private currentCell: HTMLElement | null = null;
  private hideTimeout: number | null = null;
  private readonly HIDE_DELAY = 100; // ms

  constructor(private container: HTMLElement) {
    this.createTooltipElement();
  }

  /**
   * Create tooltip element
   */
  private createTooltipElement(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'velox-tooltip';
    this.tooltip.style.display = 'none';
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.pointerEvents = 'none';
    this.container.appendChild(this.tooltip);
  }

  /**
   * Show tooltip for a cell
   */
  show(
    cell: HTMLElement,
    value: CellValue,
    row: RowData,
    column: ColumnDefinition
  ): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    this.currentCell = cell;

    // Get tooltip content
    let content: string | null = null;

    if (column.tooltip === true) {
      // Auto tooltip for long text
      content = this.getAutoTooltipContent(cell, value);
    } else if (typeof column.tooltip === 'function') {
      // Custom tooltip callback
      content = column.tooltip(value, row);
    }

    if (!content || !this.tooltip) {
      this.hide();
      return;
    }

    // Set content and show
    this.tooltip.textContent = content;
    this.tooltip.style.display = 'block';
    this.positionTooltip(cell);
  }

  /**
   * Get auto tooltip content for truncated text
   */
  private getAutoTooltipContent(cell: HTMLElement, value: CellValue): string | null {
    const content = cell.querySelector('.velox-cell-content');
    if (!content) return null;

    // Check if text is truncated
    const isOverflowing = content.scrollWidth > content.clientWidth ||
                         content.scrollHeight > content.clientHeight;

    if (isOverflowing) {
      return String(value ?? '');
    }

    return null;
  }

  /**
   * Position tooltip relative to cell
   */
  private positionTooltip(cell: HTMLElement): void {
    if (!this.tooltip) return;

    const cellRect = cell.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();

    // Default position: below the cell
    let top = cellRect.bottom - containerRect.top + 5;
    let left = cellRect.left - containerRect.left;

    // Check if tooltip would go outside viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position
    if (cellRect.left + tooltipRect.width > viewportWidth) {
      left = cellRect.right - containerRect.left - tooltipRect.width;
    }

    // Adjust vertical position (show above if no space below)
    if (cellRect.bottom + tooltipRect.height + 5 > viewportHeight) {
      top = cellRect.top - containerRect.top - tooltipRect.height - 5;
    }

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  /**
   * Hide tooltip
   */
  hide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = window.setTimeout(() => {
      if (this.tooltip) {
        this.tooltip.style.display = 'none';
        this.tooltip.textContent = '';
      }
      this.currentCell = null;
      this.hideTimeout = null;
    }, this.HIDE_DELAY);
  }

  /**
   * Update tooltip position (for scroll events)
   */
  update(): void {
    if (this.currentCell && this.tooltip && this.tooltip.style.display !== 'none') {
      this.positionTooltip(this.currentCell);
    }
  }

  /**
   * Destroy tooltip
   */
  destroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }

    this.currentCell = null;
  }
}
