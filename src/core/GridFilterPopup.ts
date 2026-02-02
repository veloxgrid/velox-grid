/**
 * GridFilterPopup - Filter Popup Module
 * Phase 8: Code Structure Optimization (Step 4)
 * 
 * VeloxGrid의 필터 팝업 UI를 담당하는 모듈
 * - Filter 팝업 표시/숨김
 * - Filter 조건 적용/제거
 */

import type { ColumnDefinition, FilterOperator, CellValue, FilterCondition, GridContext } from '../types';
import { createElement } from '../utils/dom';
import { formatValue } from '../utils/data';
import type { VeloxGrid } from './VeloxGrid';

// VeloxGrid는 GridContext를 구현하므로, 타입 안전성을 위해 GridContext 사용
type GridInstance = VeloxGrid & GridContext;

export class GridFilterPopup {
  private filterPopup: HTMLElement | null = null;
  private boundHandleOutsideClick: (e: MouseEvent) => void;

  constructor(private ctx: GridInstance) {
    this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);
  }

  /**
   * Filter 팝업 표시
   */
  showFilterPopup(column: ColumnDefinition, anchor: HTMLElement): void {
    this.closeFilterPopup();

    const ctx = this.ctx;
    const state = ctx.getState();
    const popup = createElement('div', 'velox-filter-popup');
    const rect = anchor.getBoundingClientRect();
    const gridRect = ctx.rootElement.getBoundingClientRect();

    popup.style.top = `${rect.bottom - gridRect.top + 5}px`;
    popup.style.left = `${Math.max(0, rect.left - gridRect.left - 100)}px`;

    const uniqueValues = [...new Set(state.data.map((row: any) => row[column.field]))]
      .filter((v: any) => v !== null && v !== undefined)
      .sort();

    const currentFilter = state.filter?.conditions.find((c: FilterCondition) => c.field === column.field);

    // Operator select
    const operatorSelect = createElement('select', 'velox-filter-operator') as HTMLSelectElement;
    const operators: { value: FilterOperator; label: string }[] = [
      { value: 'contains', label: '포함' },
      { value: 'equals', label: '같음' },
      { value: 'notEquals', label: '같지 않음' },
      { value: 'startsWith', label: '시작' },
      { value: 'endsWith', label: '끝' },
      { value: 'greaterThan', label: '>' },
      { value: 'lessThan', label: '<' },
      { value: 'greaterThanOrEqual', label: '>=' },
      { value: 'lessThanOrEqual', label: '<=' },
      { value: 'isEmpty', label: '비어있음' },
      { value: 'isNotEmpty', label: '비어있지 않음' },
    ];

    operators.forEach(op => {
      const option = createElement('option') as HTMLOptionElement;
      option.value = op.value;
      option.textContent = op.label;
      if (currentFilter?.operator === op.value) option.selected = true;
      operatorSelect.appendChild(option);
    });
    popup.appendChild(operatorSelect);

    // Value input
    const valueInput = createElement('input', 'velox-filter-input') as HTMLInputElement;
    valueInput.type = column.type === 'number' ? 'number' : 'text';
    valueInput.placeholder = '값 입력...';
    if (currentFilter?.value !== undefined) valueInput.value = String(currentFilter.value);
    popup.appendChild(valueInput);

    // Quick select list
    if (uniqueValues.length > 0 && uniqueValues.length <= 15) {
      const listContainer = createElement('div', 'velox-filter-list');
      const listLabel = createElement('div', 'velox-filter-list-label');
      listLabel.textContent = '빠른 선택:';
      listContainer.appendChild(listLabel);

      uniqueValues.slice(0, 10).forEach((value: any) => {
        const item = createElement('div', 'velox-filter-list-item');
        item.textContent = formatValue(value, column.type);
        item.addEventListener('click', () => {
          this.applyColumnFilter(column.field, 'equals', value);
          this.closeFilterPopup();
        });
        listContainer.appendChild(item);
      });
      popup.appendChild(listContainer);
    }

    // Buttons
    const btnContainer = createElement('div', 'velox-filter-buttons');
    
    const applyBtn = createElement('button', 'velox-filter-apply');
    applyBtn.textContent = '적용';
    applyBtn.addEventListener('click', () => {
      const operator = operatorSelect.value as FilterOperator;
      const value = column.type === 'number' ? parseFloat(valueInput.value) : valueInput.value;
      this.applyColumnFilter(column.field, operator, value);
      this.closeFilterPopup();
    });
    btnContainer.appendChild(applyBtn);

    const clearBtn = createElement('button', 'velox-filter-clear');
    clearBtn.textContent = '해제';
    clearBtn.addEventListener('click', () => {
      this.removeColumnFilter(column.field);
      this.closeFilterPopup();
    });
    btnContainer.appendChild(clearBtn);

    popup.appendChild(btnContainer);
    this.filterPopup = popup;
    ctx.rootElement.appendChild(popup);

    setTimeout(() => document.addEventListener('click', this.boundHandleOutsideClick), 0);
    valueInput.focus();
  }

  /**
   * Filter 팝업 닫기
   */
  closeFilterPopup(): void {
    if (this.filterPopup) {
      this.filterPopup.remove();
      this.filterPopup = null;
      document.removeEventListener('click', this.boundHandleOutsideClick);
    }
  }

  /**
   * 외부 클릭 핸들러
   */
  private handleOutsideClick(e: MouseEvent): void {
    if (this.filterPopup && !this.filterPopup.contains(e.target as Node)) {
      this.closeFilterPopup();
    }
  }

  /**
   * Column filter 적용
   */
  applyColumnFilter(field: string, operator: FilterOperator, value: CellValue): void {
    const ctx = this.ctx;
    const state = ctx.getState();
    const newCondition: FilterCondition = { field, operator, value };
    
    if (state.filter) {
      const conditions = state.filter.conditions.filter((c: FilterCondition) => c.field !== field);
      conditions.push(newCondition);
      state.filter = { conditions, logic: 'and' };
    } else {
      state.filter = { conditions: [newCondition], logic: 'and' };
    }
    
    ctx.clearSelectionState();
    ctx.applyDataTransformations();
    ctx.render();
    ctx.emitEvent('onFilter', state.filter);
  }

  /**
   * Column filter 제거
   */
  removeColumnFilter(field: string): void {
    const ctx = this.ctx;
    const state = ctx.getState();
    
    if (state.filter) {
      const conditions = state.filter.conditions.filter((c: FilterCondition) => c.field !== field);
      state.filter = conditions.length === 0 ? null : { conditions, logic: 'and' };
      
      ctx.clearSelectionState();
      ctx.applyDataTransformations();
      ctx.render();
      
      if (state.filter) {
        ctx.emitEvent('onFilter', state.filter);
      }
    }
  }

  /**
   * Filter 팝업이 열려있는지 확인
   */
  isOpen(): boolean {
    return this.filterPopup !== null;
  }
}
