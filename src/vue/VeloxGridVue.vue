<!--
  VeloxGridVue.vue
  Vue 3 Component for VeloxGrid
  Phase 17: Framework Wrappers (Vue)
  
  Usage:
  ```vue
  <template>
    <VeloxGridVue
      ref="gridRef"
      :columns="columns"
      :data="data"
      :height="400"
      :editable="true"
      @cell-edit-end="onCellEditEnd"
    />
  </template>

  <script setup lang="ts">
  import { ref } from 'vue';
  import { VeloxGridVue } from 'velox-grid/vue';
  import type { ColumnDefinition, CellEditEvent } from 'velox-grid';

  const gridRef = ref<InstanceType<typeof VeloxGridVue>>();

  const columns: ColumnDefinition[] = [
    { field: 'name', header: 'Name', width: 150 },
    { field: 'age', header: 'Age', type: 'number', width: 80 },
  ];

  const data = ref([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ]);

  function onCellEditEnd(e: CellEditEvent) {
    console.log('Edit:', e);
  }

  // 인스턴스 메서드 호출
  function addRow() {
    gridRef.value?.addRow({ name: 'New', age: 0 });
  }
  </script>
  ```
-->
<template>
  <div ref="containerRef" :class="wrapperClass" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, toRefs } from 'vue';
import { VeloxGrid } from '../core';
import type {
  GridOptions,
  GridEvents,
  VeloxGridInstance,
  RowData,
  ColumnDefinition,
  SortDirection,
  FilterCondition,
  Selection,
  CellValue,
  ExportOptions,
  RowStateType,
  ChangesResult,
  PaginationState,
  CellIndex,
} from '../types';

/**
 * Props 정의
 * GridOptions의 모든 옵션을 Props로 전달할 수 있습니다.
 */
const props = withDefaults(defineProps<GridOptions & { wrapperClass?: string }>(), {
  data: () => [],
  rowHeight: 40,
  headerHeight: 44,
  showRowNumbers: false,
  rowDraggable: false,
  selectable: true,
  sortable: true,
  filterable: false,
  editable: false,
  resizable: true,
  virtualScroll: true,
  bufferSize: 10,
  theme: 'default',
  emptyMessage: 'No data',
  loading: false,
});

/**
 * Emit 정의
 * GridEvents의 이벤트를 kebab-case로 emit합니다.
 */
const emit = defineEmits<{
  'data-change': [data: RowData[]];
  'row-add': [row: RowData, index: number];
  'row-remove': [row: RowData, index: number];
  'row-update': [row: RowData, index: number, changes: Partial<RowData>];
  'selection-change': [selectedRows: number[]];
  'row-select': [rowIndex: number, selected: boolean];
  'all-select': [selected: boolean];
  'cell-click': [rowIndex: number, field: string, value: CellValue];
  'cell-double-click': [rowIndex: number, field: string, value: CellValue];
  'row-click': [rowIndex: number, row: RowData];
  'row-double-click': [rowIndex: number, row: RowData];
  'cell-select': [cell: CellIndex, selected: boolean];
  'cell-selection-change': [cells: CellIndex[]];
  'check-change': [rowIndex: number, checked: boolean];
  'check-all-change': [checked: boolean];
  'sort': [sortState: import('../types').SortState[]];
  'filter': [filterState: import('../types').FilterState];
  'cell-edit-start': [rowIndex: number, field: string, value: CellValue];
  'cell-edit-end': [event: import('../types').CellEditEvent];
  'cell-edit-cancel': [rowIndex: number, field: string];
  'validation-error': [event: { rowIndex: number; field: string; value: CellValue; errors: string[] }];
  'copy': [data: string[][]];
  'paste': [data: string[][], startCell: CellIndex];
  'cut': [data: string[][]];
  'key-down': [event: KeyboardEvent, cell: CellIndex | null];
  'undo': [action: import('../types').UndoAction];
  'redo': [action: import('../types').UndoAction];
  'scroll': [scrollTop: number, scrollLeft: number];
  'column-resize': [field: string, width: number];
  'column-reorder': [field: string, fromIndex: number, toIndex: number];
  'ready': [grid: VeloxGridInstance];
  'destroy': [];
  'page-change': [page: number, pageSize: number];
  'page-size-change': [pageSize: number];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
let gridInstance: VeloxGridInstance | null = null;

/**
 * Props에서 GridOptions 추출 (wrapperClass 제외)
 */
function buildGridOptions(): GridOptions & Partial<GridEvents> {
  const { wrapperClass: _wrapperClass, ...gridProps } = props;

  const events: Partial<GridEvents> = {
    onDataChange: (...args) => emit('data-change', ...args),
    onRowAdd: (...args) => emit('row-add', ...args),
    onRowRemove: (...args) => emit('row-remove', ...args),
    onRowUpdate: (...args) => emit('row-update', ...args),
    onSelectionChange: (...args) => emit('selection-change', ...args),
    onRowSelect: (...args) => emit('row-select', ...args),
    onAllSelect: (...args) => emit('all-select', ...args),
    onCellClick: (...args) => emit('cell-click', ...args),
    onCellDoubleClick: (...args) => emit('cell-double-click', ...args),
    onRowClick: (...args) => emit('row-click', ...args),
    onRowDoubleClick: (...args) => emit('row-double-click', ...args),
    onCellSelect: (...args) => emit('cell-select', ...args),
    onCellSelectionChange: (...args) => emit('cell-selection-change', ...args),
    onCheckChange: (...args) => emit('check-change', ...args),
    onCheckAllChange: (...args) => emit('check-all-change', ...args),
    onSort: (...args) => emit('sort', ...args),
    onFilter: (...args) => emit('filter', ...args),
    onCellEditStart: (...args) => emit('cell-edit-start', ...args),
    onCellEditEnd: (...args) => emit('cell-edit-end', ...args),
    onCellEditCancel: (...args) => emit('cell-edit-cancel', ...args),
    onValidationError: (...args) => emit('validation-error', ...args),
    onCopy: (...args) => emit('copy', ...args),
    onPaste: (...args) => emit('paste', ...args),
    onCut: (...args) => emit('cut', ...args),
    onKeyDown: (...args) => emit('key-down', ...args),
    onUndo: (...args) => emit('undo', ...args),
    onRedo: (...args) => emit('redo', ...args),
    onScroll: (...args) => emit('scroll', ...args),
    onColumnResize: (...args) => emit('column-resize', ...args),
    onColumnReorder: (...args) => emit('column-reorder', ...args),
    onReady: (...args) => emit('ready', ...args),
    onDestroy: () => emit('destroy'),
    onPageChange: (...args) => emit('page-change', ...args),
    onPageSizeChange: (...args) => emit('page-size-change', ...args),
  };

  return {
    ...gridProps,
    ...events,
  };
}

onMounted(() => {
  if (!containerRef.value) return;
  gridInstance = new VeloxGrid(containerRef.value, buildGridOptions());
});

onUnmounted(() => {
  if (gridInstance) {
    gridInstance.destroy();
    gridInstance = null;
  }
});

// data prop 변경 감시
watch(() => props.data, (newData) => {
  if (gridInstance && newData) {
    gridInstance.setData(newData);
  }
});

// columns prop 변경 감시
watch(() => props.columns, (newColumns) => {
  if (gridInstance && newColumns) {
    gridInstance.setColumns(newColumns);
  }
});

// loading prop 변경 감시
watch(() => props.loading, (newLoading) => {
  if (gridInstance && newLoading !== undefined) {
    gridInstance.setOptions({ loading: newLoading });
  }
});

// ============================================
// Public API (defineExpose)
// ============================================

/** VeloxGrid 인스턴스에 직접 접근 */
function getGridInstance(): VeloxGridInstance | null {
  return gridInstance;
}

// Lifecycle
function destroy() { gridInstance?.destroy(); }
function refresh() { gridInstance?.refresh(); }

// Data methods
function getData(): RowData[] { return gridInstance?.getData() ?? []; }
function setData(data: RowData[]) { gridInstance?.setData(data); }
function getRow(index: number): RowData | null { return gridInstance?.getRow(index) ?? null; }
function addRow(row: RowData, index?: number) { gridInstance?.addRow(row, index); }
function updateRow(index: number, data: Partial<RowData>) { gridInstance?.updateRow(index, data); }
function removeRow(index: number) { gridInstance?.removeRow(index); }
function clearData() { gridInstance?.clearData(); }

// Row Selection
function getSelectedRows(): number[] { return gridInstance?.getSelectedRows() ?? []; }
function getSelectedData(): RowData[] { return gridInstance?.getSelectedData() ?? []; }
function selectRow(index: number, selected?: boolean) { gridInstance?.selectRow(index, selected); }
function selectAll(selected?: boolean) { gridInstance?.selectAll(selected); }
function clearSelection() { gridInstance?.clearSelection(); }
function isRowSelected(index: number): boolean { return gridInstance?.isRowSelected(index) ?? false; }

// Cell Selection
function selectCell(rowIndex: number, field: string, selected?: boolean) { gridInstance?.selectCell(rowIndex, field, selected); }
function getSelectedCells(): CellIndex[] { return gridInstance?.getSelectedCells() ?? []; }
function setFocusedCell(rowIndex: number, field: string) { gridInstance?.setFocusedCell(rowIndex, field); }
function getFocusedCell(): CellIndex | null { return gridInstance?.getFocusedCell() ?? null; }
function setSelection(selection: Selection) { gridInstance?.setSelection(selection); }
function getSelection(): Selection | null { return gridInstance?.getSelection() ?? null; }
function getSelectionData(): CellValue[][] { return gridInstance?.getSelectionData() ?? []; }

// CheckBar
function checkItem(index: number, checked?: boolean) { gridInstance?.checkItem(index, checked); }
function checkItems(indices: number[], checked?: boolean) { gridInstance?.checkItems(indices, checked); }
function checkAll(checked?: boolean) { gridInstance?.checkAll(checked); }
function uncheckAll() { gridInstance?.uncheckAll(); }
function getCheckedItems(): number[] { return gridInstance?.getCheckedItems() ?? []; }
function getCheckedData(): RowData[] { return gridInstance?.getCheckedData() ?? []; }
function isItemChecked(index: number): boolean { return gridInstance?.isItemChecked(index) ?? false; }
function isItemCheckable(index: number): boolean { return gridInstance?.isItemCheckable(index) ?? false; }
function checkRow(index: number, checked?: boolean) { gridInstance?.checkRow(index, checked); }
function getCheckedRows(): number[] { return gridInstance?.getCheckedRows() ?? []; }

// Sort
function sort(field: string, direction?: SortDirection) { gridInstance?.sort(field, direction); }
function clearSort() { gridInstance?.clearSort(); }
function getSortState() { return gridInstance?.getSortState() ?? []; }

// Filter
function filter(conditions: FilterCondition | FilterCondition[]) { gridInstance?.filter(conditions); }
function clearFilter() { gridInstance?.clearFilter(); }
function getFilterState() { return gridInstance?.getFilterState() ?? null; }

// Edit
function startEdit(rowIndex: number, field: string) { gridInstance?.startEdit(rowIndex, field); }
function endEdit(save?: boolean) { gridInstance?.endEdit(save); }
function cancelEdit() { gridInstance?.cancelEdit(); }
function isEditing(): boolean { return gridInstance?.isEditing() ?? false; }

// Column
function getColumn(field: string) { return gridInstance?.getColumn(field) ?? null; }
function setColumnWidth(field: string, width: number) { gridInstance?.setColumnWidth(field, width); }
function showColumn(field: string) { gridInstance?.showColumn(field); }
function hideColumn(field: string) { gridInstance?.hideColumn(field); }
function setColumns(columns: ColumnDefinition[]) { gridInstance?.setColumns(columns); }
function autoFitColumn(field: string) { gridInstance?.autoFitColumn(field); }
function autoFitAllColumns() { gridInstance?.autoFitAllColumns(); }

// Scroll
function scrollToRow(index: number) { gridInstance?.scrollToRow(index); }
function scrollToTop() { gridInstance?.scrollToTop(); }
function scrollToBottom() { gridInstance?.scrollToBottom(); }
function scrollToCell(rowIndex: number, field: string) { gridInstance?.scrollToCell(rowIndex, field); }

// Clipboard
function copy() { gridInstance?.copy(); }
function paste() { gridInstance?.paste(); }
function cut() { gridInstance?.cut(); }

// Undo/Redo
function undo(): boolean { return gridInstance?.undo() ?? false; }
function redo(): boolean { return gridInstance?.redo() ?? false; }
function canUndo(): boolean { return gridInstance?.canUndo() ?? false; }
function canRedo(): boolean { return gridInstance?.canRedo() ?? false; }
function clearHistory() { gridInstance?.clearHistory(); }

// Delete
function deleteSelectedCells() { gridInstance?.deleteSelectedCells(); }
function deleteSelectedRows() { gridInstance?.deleteSelectedRows(); }

// Export
function exportToExcel(options?: ExportOptions) { gridInstance?.exportToExcel(options); }
function exportToCSV(options?: ExportOptions): string { return gridInstance?.exportToCSV(options) ?? ''; }
function downloadCSV(options?: ExportOptions) { gridInstance?.downloadCSV(options); }
function exportToJSON(options?: ExportOptions): string { return gridInstance?.exportToJSON(options) ?? '[]'; }
function downloadJSON(options?: ExportOptions) { gridInstance?.downloadJSON(options); }

// Import
function importFromCSV(csvString: string, hasHeader?: boolean) {
  return gridInstance?.importFromCSV(csvString, hasHeader) ?? { data: [], headers: [], errors: [] };
}
function importFromExcel(file: File, sheetIndex?: number) {
  return gridInstance?.importFromExcel(file, sheetIndex) ?? Promise.resolve({ data: [], headers: [], errors: [] });
}

// Utility
function getRowCount(): number { return gridInstance?.getRowCount() ?? 0; }
function getVisibleRowCount(): number { return gridInstance?.getVisibleRowCount() ?? 0; }
function getCellValue(rowIndex: number, field: string): CellValue { return gridInstance?.getCellValue(rowIndex, field); }
function setCellValue(rowIndex: number, field: string, value: CellValue) { gridInstance?.setCellValue(rowIndex, field, value); }

// Summary
function getSummaryValue(field: string): CellValue { return gridInstance?.getSummaryValue(field); }
function getSummaryValues(): Record<string, CellValue> { return gridInstance?.getSummaryValues() ?? {}; }
function refreshSummary() { gridInstance?.refreshSummary(); }

// Row State
function getRowState(index: number): RowStateType { return gridInstance?.getRowState(index) ?? 'none'; }
function getRowStateByData(row: RowData): RowStateType { return gridInstance?.getRowStateByData(row) ?? 'none'; }
function setRowState(index: number, state: RowStateType) { gridInstance?.setRowState(index, state); }
function getChanges(): ChangesResult { return gridInstance?.getChanges() ?? { created: [], updated: [], deleted: [] }; }
function getCreatedRows(): RowData[] { return gridInstance?.getCreatedRows() ?? []; }
function getUpdatedRows(): RowData[] { return gridInstance?.getUpdatedRows() ?? []; }
function getDeletedRows(): RowData[] { return gridInstance?.getDeletedRows() ?? []; }
function clearRowStates() { gridInstance?.clearRowStates(); }
function commit() { gridInstance?.commit(); }

// Options
function setOptions(options: Partial<GridOptions>) { gridInstance?.setOptions(options); }
function getOptions() { return gridInstance?.getOptions(); }

// Pagination
function goToPage(page: number) { gridInstance?.goToPage(page); }
function setPageSize(pageSize: number) { gridInstance?.setPageSize(pageSize); }
function getPaginationState(): PaginationState {
  return gridInstance?.getPaginationState() ?? {
    currentPage: 1, pageSize: 20, totalCount: 0, totalPages: 0, loading: false,
  };
}
function fetchData() { return gridInstance?.fetchData() ?? Promise.resolve(); }

defineExpose({
  getGridInstance,
  destroy, refresh,
  getData, setData, getRow, addRow, updateRow, removeRow, clearData,
  getSelectedRows, getSelectedData, selectRow, selectAll, clearSelection, isRowSelected,
  selectCell, getSelectedCells, setFocusedCell, getFocusedCell, setSelection, getSelection, getSelectionData,
  checkItem, checkItems, checkAll, uncheckAll, getCheckedItems, getCheckedData, isItemChecked, isItemCheckable,
  checkRow, getCheckedRows,
  sort, clearSort, getSortState,
  filter, clearFilter, getFilterState,
  startEdit, endEdit, cancelEdit, isEditing,
  getColumn, setColumnWidth, showColumn, hideColumn, setColumns, autoFitColumn, autoFitAllColumns,
  scrollToRow, scrollToTop, scrollToBottom, scrollToCell,
  copy, paste, cut,
  undo, redo, canUndo, canRedo, clearHistory,
  deleteSelectedCells, deleteSelectedRows,
  exportToExcel, exportToCSV, downloadCSV, exportToJSON, downloadJSON,
  importFromCSV, importFromExcel,
  getRowCount, getVisibleRowCount, getCellValue, setCellValue,
  getSummaryValue, getSummaryValues, refreshSummary,
  getRowState, getRowStateByData, setRowState, getChanges, getCreatedRows, getUpdatedRows, getDeletedRows, clearRowStates, commit,
  setOptions, getOptions,
  goToPage, setPageSize, getPaginationState, fetchData,
});
</script>
