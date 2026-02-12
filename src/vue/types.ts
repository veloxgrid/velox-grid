/**
 * VeloxGrid Vue Wrapper Types
 * Phase 17: Framework Wrappers (Vue)
 */

import type { GridOptions, GridEvents } from '../types';

/**
 * VeloxGridVue 컴포넌트 Props
 * GridOptions를 직접 전달합니다.
 * 
 * @example
 * ```vue
 * <VeloxGridVue
 *   :columns="columns"
 *   :data="data"
 *   :height="400"
 *   :editable="true"
 *   @cell-edit-end="onCellEditEnd"
 * />
 * ```
 */
export interface VeloxGridVueProps extends GridOptions {
  /** 컨테이너에 적용할 CSS 클래스 */
  wrapperClass?: string;
}

/**
 * VeloxGridVue 컴포넌트 Emits
 * GridEvents의 이벤트를 kebab-case로 emit합니다.
 * 
 * 예: onCellClick → cell-click
 *     onDataChange → data-change
 */
export interface VeloxGridVueEmits {
  (e: 'data-change', ...args: Parameters<NonNullable<GridEvents['onDataChange']>>): void;
  (e: 'row-add', ...args: Parameters<NonNullable<GridEvents['onRowAdd']>>): void;
  (e: 'row-remove', ...args: Parameters<NonNullable<GridEvents['onRowRemove']>>): void;
  (e: 'row-update', ...args: Parameters<NonNullable<GridEvents['onRowUpdate']>>): void;
  (e: 'selection-change', ...args: Parameters<NonNullable<GridEvents['onSelectionChange']>>): void;
  (e: 'row-select', ...args: Parameters<NonNullable<GridEvents['onRowSelect']>>): void;
  (e: 'all-select', ...args: Parameters<NonNullable<GridEvents['onAllSelect']>>): void;
  (e: 'cell-click', ...args: Parameters<NonNullable<GridEvents['onCellClick']>>): void;
  (e: 'cell-double-click', ...args: Parameters<NonNullable<GridEvents['onCellDoubleClick']>>): void;
  (e: 'row-click', ...args: Parameters<NonNullable<GridEvents['onRowClick']>>): void;
  (e: 'row-double-click', ...args: Parameters<NonNullable<GridEvents['onRowDoubleClick']>>): void;
  (e: 'cell-select', ...args: Parameters<NonNullable<GridEvents['onCellSelect']>>): void;
  (e: 'cell-selection-change', ...args: Parameters<NonNullable<GridEvents['onCellSelectionChange']>>): void;
  (e: 'check-change', ...args: Parameters<NonNullable<GridEvents['onCheckChange']>>): void;
  (e: 'check-all-change', ...args: Parameters<NonNullable<GridEvents['onCheckAllChange']>>): void;
  (e: 'sort', ...args: Parameters<NonNullable<GridEvents['onSort']>>): void;
  (e: 'filter', ...args: Parameters<NonNullable<GridEvents['onFilter']>>): void;
  (e: 'cell-edit-start', ...args: Parameters<NonNullable<GridEvents['onCellEditStart']>>): void;
  (e: 'cell-edit-end', ...args: Parameters<NonNullable<GridEvents['onCellEditEnd']>>): void;
  (e: 'cell-edit-cancel', ...args: Parameters<NonNullable<GridEvents['onCellEditCancel']>>): void;
  (e: 'validation-error', ...args: Parameters<NonNullable<GridEvents['onValidationError']>>): void;
  (e: 'copy', ...args: Parameters<NonNullable<GridEvents['onCopy']>>): void;
  (e: 'paste', ...args: Parameters<NonNullable<GridEvents['onPaste']>>): void;
  (e: 'cut', ...args: Parameters<NonNullable<GridEvents['onCut']>>): void;
  (e: 'key-down', ...args: Parameters<NonNullable<GridEvents['onKeyDown']>>): void;
  (e: 'undo', ...args: Parameters<NonNullable<GridEvents['onUndo']>>): void;
  (e: 'redo', ...args: Parameters<NonNullable<GridEvents['onRedo']>>): void;
  (e: 'scroll', ...args: Parameters<NonNullable<GridEvents['onScroll']>>): void;
  (e: 'column-resize', ...args: Parameters<NonNullable<GridEvents['onColumnResize']>>): void;
  (e: 'column-reorder', ...args: Parameters<NonNullable<GridEvents['onColumnReorder']>>): void;
  (e: 'ready', ...args: Parameters<NonNullable<GridEvents['onReady']>>): void;
  (e: 'destroy'): void;
  (e: 'page-change', ...args: Parameters<NonNullable<GridEvents['onPageChange']>>): void;
  (e: 'page-size-change', ...args: Parameters<NonNullable<GridEvents['onPageSizeChange']>>): void;
}
