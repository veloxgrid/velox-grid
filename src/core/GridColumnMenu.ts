/**
 * GridColumnMenu - Column Menu Module
 * Phase 8: Code Structure Optimization (Step 5)
 * 
 * VeloxGrid의 컬럼 메뉴 UI를 담당하는 모듈
 * - Column 메뉴 표시/숨김
 * - 정렬, 숨기기, 고정 등의 기능 제공
 */

import type { ColumnDefinition, ContextMenuItem, ContextMenuContext } from '../types';
import { createElement, addClass } from '../utils/dom';
import type { VeloxGrid } from './VeloxGrid';

export class GridColumnMenu {
  private columnMenuPopup: HTMLElement | null = null;
  private boundHandleOutsideClick: (e: MouseEvent) => void;

  constructor(private grid: VeloxGrid) {
    this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);
  }

  /**
   * Column 메뉴 표시
   */
  showColumnMenu(column: ColumnDefinition, anchor: HTMLElement): void {
    this.closeColumnMenu();

    const grid = this.grid as any;
    const menu = createElement('div', 'velox-column-menu');
    const rect = anchor.getBoundingClientRect();
    const gridRect = grid.rootElement.getBoundingClientRect();

    menu.style.top = `${rect.bottom - gridRect.top + 5}px`;
    menu.style.left = `${rect.left - gridRect.left}px`;

    // Create context for custom menu items
    const context: ContextMenuContext = {
      field: column.field,
      column,
      selectedRows: grid.getSelectedRows(),
      selectedCells: grid.getSelectedCells(),
      grid: this.grid,
    };

    // Get menu items (custom or default)
    const menuConfig = grid.options.contextMenu;
    const showDefault = menuConfig?.showDefaultItems !== false;
    const customItems = menuConfig?.headerItems || [];

    // Default menu items
    const defaultItems: ContextMenuItem[] = [
      { 
        id: 'sort-asc', 
        label: '오름차순 정렬', 
        icon: '↑', 
        action: () => grid.sort(column.field, 'asc') 
      },
      { 
        id: 'sort-desc', 
        label: '내림차순 정렬', 
        icon: '↓', 
        action: () => grid.sort(column.field, 'desc') 
      },
      { 
        id: 'sort-clear', 
        label: '정렬 해제', 
        icon: '✕', 
        action: () => grid.clearSort() 
      },
      { type: 'separator' },
      { 
        id: 'hide', 
        label: '컬럼 숨기기', 
        icon: '👁', 
        action: () => grid.hideColumn(column.field) 
      },
      { 
        id: 'autofit', 
        label: '컬럼 너비 자동', 
        icon: '↔', 
        action: () => grid.autoFitColumn(column.field) 
      },
      { 
        id: 'autofit-all', 
        label: '모든 컬럼 자동', 
        icon: '⇔', 
        action: () => grid.autoFitAllColumns() 
      },
      { type: 'separator' },
      { 
        id: 'fix-left', 
        label: '왼쪽에 고정', 
        icon: '◀', 
        action: () => grid.fixColumn(column.field, 'left') 
      },
      { 
        id: 'unfix', 
        label: '고정 해제', 
        icon: '◇', 
        action: () => grid.fixColumn(column.field, false) 
      },
    ];

    // Combine items
    let items: ContextMenuItem[] = [];
    if (showDefault) {
      items = [...defaultItems];
      if (customItems.length > 0) {
        items.push({ type: 'separator' });
        items.push(...customItems);
      }
    } else {
      items = customItems;
    }

    // Render menu items
    items.forEach(item => {
      // Check visibility
      const isVisible = typeof item.visible === 'function' 
        ? item.visible(context) 
        : item.visible !== false;
      if (!isVisible) return;

      if (item.type === 'separator') {
        const sep = createElement('div', 'velox-column-menu-separator');
        menu.appendChild(sep);
      } else {
        const menuItem = createElement('div', 'velox-column-menu-item');
        if (item.className) addClass(menuItem, item.className);
        
        // Check disabled state
        const isDisabled = typeof item.disabled === 'function'
          ? item.disabled(context)
          : item.disabled === true;
        if (isDisabled) addClass(menuItem, 'velox-column-menu-item--disabled');

        // Build item content
        let html = '';
        if (item.icon) html += `<span class="velox-column-menu-icon">${item.icon}</span>`;
        html += `<span class="velox-column-menu-label">${item.label || ''}</span>`;
        if (item.shortcut) html += `<span class="velox-column-menu-shortcut">${item.shortcut}</span>`;
        menuItem.innerHTML = html;

        if (!isDisabled) {
          menuItem.addEventListener('click', () => {
            item.action?.(context);
            this.closeColumnMenu();
          });
        }
        menu.appendChild(menuItem);
      }
    });

    this.columnMenuPopup = menu;
    grid.rootElement.appendChild(menu);

    // Add outside click listener with delay to avoid immediate close
    setTimeout(() => document.addEventListener('click', this.boundHandleOutsideClick), 0);
  }

  /**
   * Column 메뉴 닫기
   */
  closeColumnMenu(): void {
    if (this.columnMenuPopup) {
      this.columnMenuPopup.remove();
      this.columnMenuPopup = null;
      document.removeEventListener('click', this.boundHandleOutsideClick);
    }
  }

  /**
   * 외부 클릭 핸들러
   */
  private handleOutsideClick(e: MouseEvent): void {
    if (this.columnMenuPopup && !this.columnMenuPopup.contains(e.target as Node)) {
      this.closeColumnMenu();
    }
  }

  /**
   * Column 메뉴가 열려있는지 확인
   */
  isOpen(): boolean {
    return this.columnMenuPopup !== null;
  }
}
