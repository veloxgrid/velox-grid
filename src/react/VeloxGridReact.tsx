/**
 * VeloxGrid React Component
 * @description React wrapper for VeloxGrid
 * Phase 17: Framework Wrappers (React)
 * 
 * GridOptions를 Props로 전달하고, GridEvents를 콜백으로 바인딩합니다.
 * ref를 통해 VeloxGrid 인스턴스의 모든 public 메서드에 접근할 수 있습니다.
 */

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  type CSSProperties,
} from 'react';
import { VeloxGrid } from '../core';
import type { GridOptions, GridEvents, VeloxGridInstance } from '../types';
import type { VeloxGridReactProps, VeloxGridReactRef } from './types';

/**
 * GridEvents의 모든 키 목록
 * Props에서 이벤트를 분리하기 위해 사용
 */
const EVENT_KEYS: (keyof GridEvents)[] = [
  'onDataChange',
  'onRowAdd',
  'onRowRemove',
  'onRowUpdate',
  'onSelectionChange',
  'onRowSelect',
  'onAllSelect',
  'onCellClick',
  'onCellDoubleClick',
  'onRowClick',
  'onRowDoubleClick',
  'onCellSelect',
  'onCellSelectionChange',
  'onCheckChange',
  'onCheckAllChange',
  'onSort',
  'onFilter',
  'onCellEditStart',
  'onCellEditEnd',
  'onCellEditCancel',
  'onValidationError',
  'onCopy',
  'onPaste',
  'onCut',
  'onKeyDown',
  'onUndo',
  'onRedo',
  'onScroll',
  'onColumnResize',
  'onColumnReorder',
  'onReady',
  'onDestroy',
  'onPageChange',
  'onPageSizeChange',
];

/**
 * Props에서 GridOptions와 GridEvents를 분리
 */
function separateProps(props: VeloxGridReactProps): {
  options: GridOptions;
  events: Partial<GridEvents>;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
} {
  const events: Partial<GridEvents> = {};
  const options: Record<string, unknown> = {};
  let wrapperClassName: string | undefined;
  let wrapperStyle: CSSProperties | undefined;

  for (const [key, value] of Object.entries(props)) {
    if (key === 'wrapperClassName') {
      wrapperClassName = value as string;
    } else if (key === 'wrapperStyle') {
      wrapperStyle = value as CSSProperties;
    } else if (EVENT_KEYS.includes(key as keyof GridEvents)) {
      (events as Record<string, unknown>)[key] = value;
    } else {
      options[key] = value;
    }
  }

  return {
    options: options as unknown as GridOptions,
    events,
    wrapperClassName,
    wrapperStyle,
  };
}

/**
 * VeloxGridReact 컴포넌트
 * 
 * @example
 * ```tsx
 * import { VeloxGridReact } from 'velox-grid/react';
 * 
 * function App() {
 *   const gridRef = useRef<VeloxGridReactRef>(null);
 * 
 *   return (
 *     <VeloxGridReact
 *       ref={gridRef}
 *       columns={[
 *         { field: 'name', header: 'Name', width: 150 },
 *         { field: 'age', header: 'Age', type: 'number', width: 80 },
 *       ]}
 *       data={[
 *         { name: 'Alice', age: 30 },
 *         { name: 'Bob', age: 25 },
 *       ]}
 *       height={400}
 *       editable={true}
 *       onCellEditEnd={(e) => console.log('Edit:', e)}
 *     />
 *   );
 * }
 * ```
 */
export const VeloxGridReact = forwardRef<VeloxGridReactRef, VeloxGridReactProps>(
  function VeloxGridReact(props, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<VeloxGridInstance | null>(null);
    const eventsRef = useRef<Partial<GridEvents>>({});

    // 이벤트 레퍼런스를 항상 최신 상태로 유지 (리렌더 시 이벤트 갱신)
    const { options, events, wrapperClassName, wrapperStyle } = separateProps(props);
    eventsRef.current = events;

    // Grid 초기화 (마운트 시 1회)
    useEffect(() => {
      if (!containerRef.current) return;

      // 이벤트를 프록시로 바인딩 (항상 최신 콜백 참조)
      const eventProxy: Partial<GridEvents> = {};
      for (const key of EVENT_KEYS) {
        (eventProxy as Record<string, unknown>)[key] = (...args: unknown[]) => {
          const handler = eventsRef.current[key];
          if (handler) {
            (handler as (...a: unknown[]) => void)(...args);
          }
        };
      }

      const gridOptions: GridOptions & Partial<GridEvents> = {
        ...options,
        ...eventProxy,
      };

      gridRef.current = new VeloxGrid(containerRef.current, gridOptions);

      return () => {
        if (gridRef.current) {
          gridRef.current.destroy();
          gridRef.current = null;
        }
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 마운트/언마운트 시에만 실행

    // data prop 변경 시 setData 호출
    useEffect(() => {
      if (gridRef.current && options.data) {
        gridRef.current.setData(options.data);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.data]);

    // columns prop 변경 시 setColumns 호출
    useEffect(() => {
      if (gridRef.current && options.columns) {
        gridRef.current.setColumns(options.columns);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.columns]);

    // loading prop 변경 시 setOptions 호출
    useEffect(() => {
      if (gridRef.current && options.loading !== undefined) {
        gridRef.current.setOptions({ loading: options.loading });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.loading]);

    // ref를 통해 VeloxGrid 인스턴스 메서드 노출
    useImperativeHandle(ref, () => ({
      // Lifecycle
      destroy: () => gridRef.current?.destroy(),
      refresh: () => gridRef.current?.refresh(),

      // Data methods
      getData: () => gridRef.current?.getData() ?? [],
      setData: (data) => gridRef.current?.setData(data),
      getRow: (index) => gridRef.current?.getRow(index) ?? null,
      addRow: (row, index?) => gridRef.current?.addRow(row, index),
      updateRow: (index, data) => gridRef.current?.updateRow(index, data),
      removeRow: (index) => gridRef.current?.removeRow(index),
      clearData: () => gridRef.current?.clearData(),

      // Row Selection methods
      getSelectedRows: () => gridRef.current?.getSelectedRows() ?? [],
      getSelectedData: () => gridRef.current?.getSelectedData() ?? [],
      selectRow: (index, selected?) => gridRef.current?.selectRow(index, selected),
      selectAll: (selected?) => gridRef.current?.selectAll(selected),
      clearSelection: () => gridRef.current?.clearSelection(),
      isRowSelected: (index) => gridRef.current?.isRowSelected(index) ?? false,

      // Cell Selection methods
      selectCell: (rowIndex, field, selected?) => gridRef.current?.selectCell(rowIndex, field, selected),
      getSelectedCells: () => gridRef.current?.getSelectedCells() ?? [],
      setFocusedCell: (rowIndex, field) => gridRef.current?.setFocusedCell(rowIndex, field),
      getFocusedCell: () => gridRef.current?.getFocusedCell() ?? null,
      setSelection: (selection) => gridRef.current?.setSelection(selection),
      getSelection: () => gridRef.current?.getSelection() ?? null,
      getSelectionData: () => gridRef.current?.getSelectionData() ?? [],

      // CheckBar methods
      checkItem: (index, checked?) => gridRef.current?.checkItem(index, checked),
      checkItems: (indices, checked?) => gridRef.current?.checkItems(indices, checked),
      checkAll: (checked?) => gridRef.current?.checkAll(checked),
      uncheckAll: () => gridRef.current?.uncheckAll(),
      getCheckedItems: () => gridRef.current?.getCheckedItems() ?? [],
      getCheckedData: () => gridRef.current?.getCheckedData() ?? [],
      isItemChecked: (index) => gridRef.current?.isItemChecked(index) ?? false,
      isItemCheckable: (index) => gridRef.current?.isItemCheckable(index) ?? false,

      // Legacy checkbox aliases
      checkRow: (index, checked?) => gridRef.current?.checkRow(index, checked),
      getCheckedRows: () => gridRef.current?.getCheckedRows() ?? [],

      // Sort methods
      sort: (field, direction?) => gridRef.current?.sort(field, direction),
      clearSort: () => gridRef.current?.clearSort(),
      getSortState: () => gridRef.current?.getSortState() ?? [],

      // Filter methods
      filter: (conditions) => gridRef.current?.filter(conditions),
      clearFilter: () => gridRef.current?.clearFilter(),
      getFilterState: () => gridRef.current?.getFilterState() ?? null,

      // Edit methods
      startEdit: (rowIndex, field) => gridRef.current?.startEdit(rowIndex, field),
      endEdit: (save?) => gridRef.current?.endEdit(save),
      cancelEdit: () => gridRef.current?.cancelEdit(),
      isEditing: () => gridRef.current?.isEditing() ?? false,

      // Column methods
      getColumn: (field) => gridRef.current?.getColumn(field) ?? null,
      setColumnWidth: (field, width) => gridRef.current?.setColumnWidth(field, width),
      showColumn: (field) => gridRef.current?.showColumn(field),
      hideColumn: (field) => gridRef.current?.hideColumn(field),
      setColumns: (columns) => gridRef.current?.setColumns(columns),
      autoFitColumn: (field) => gridRef.current?.autoFitColumn(field),
      autoFitAllColumns: () => gridRef.current?.autoFitAllColumns(),

      // Scroll methods
      scrollToRow: (index) => gridRef.current?.scrollToRow(index),
      scrollToTop: () => gridRef.current?.scrollToTop(),
      scrollToBottom: () => gridRef.current?.scrollToBottom(),
      scrollToCell: (rowIndex, field) => gridRef.current?.scrollToCell(rowIndex, field),

      // Clipboard methods
      copy: () => gridRef.current?.copy(),
      paste: () => gridRef.current?.paste(),
      cut: () => gridRef.current?.cut(),

      // Undo/Redo methods
      undo: () => gridRef.current?.undo() ?? false,
      redo: () => gridRef.current?.redo() ?? false,
      canUndo: () => gridRef.current?.canUndo() ?? false,
      canRedo: () => gridRef.current?.canRedo() ?? false,
      clearHistory: () => gridRef.current?.clearHistory(),

      // Delete methods
      deleteSelectedCells: () => gridRef.current?.deleteSelectedCells(),
      deleteSelectedRows: () => gridRef.current?.deleteSelectedRows(),

      // Export methods
      exportToExcel: (opts?) => gridRef.current?.exportToExcel(opts),
      exportToCSV: (opts?) => gridRef.current?.exportToCSV(opts) ?? '',
      downloadCSV: (opts?) => gridRef.current?.downloadCSV(opts),
      exportToJSON: (opts?) => gridRef.current?.exportToJSON(opts) ?? '[]',
      downloadJSON: (opts?) => gridRef.current?.downloadJSON(opts),

      // Import methods
      importFromCSV: (csvString, hasHeader?) => 
        gridRef.current?.importFromCSV(csvString, hasHeader) ?? { data: [], headers: [], errors: [] },
      importFromExcel: (file, sheetIndex?) =>
        gridRef.current?.importFromExcel(file, sheetIndex) ?? Promise.resolve({ data: [], headers: [], errors: [] }),

      // Utility methods
      getRowCount: () => gridRef.current?.getRowCount() ?? 0,
      getVisibleRowCount: () => gridRef.current?.getVisibleRowCount() ?? 0,
      getCellValue: (rowIndex, field) => gridRef.current?.getCellValue(rowIndex, field),
      setCellValue: (rowIndex, field, value) => gridRef.current?.setCellValue(rowIndex, field, value),

      // Summary methods
      getSummaryValue: (field) => gridRef.current?.getSummaryValue(field),
      getSummaryValues: () => gridRef.current?.getSummaryValues() ?? {},
      refreshSummary: () => gridRef.current?.refreshSummary(),

      // Row State methods
      getRowState: (index) => gridRef.current?.getRowState(index) ?? 'none',
      getRowStateByData: (row) => gridRef.current?.getRowStateByData(row) ?? 'none',
      setRowState: (index, state) => gridRef.current?.setRowState(index, state),
      getChanges: () => gridRef.current?.getChanges() ?? { created: [], updated: [], deleted: [] },
      getCreatedRows: () => gridRef.current?.getCreatedRows() ?? [],
      getUpdatedRows: () => gridRef.current?.getUpdatedRows() ?? [],
      getDeletedRows: () => gridRef.current?.getDeletedRows() ?? [],
      clearRowStates: () => gridRef.current?.clearRowStates(),
      commit: () => gridRef.current?.commit(),

      // Column Layout (Phase 19)
      setColumnLayout: (layout) => gridRef.current?.setColumnLayout(layout),
      getColumnLayout: () => gridRef.current?.getColumnLayout() ?? null,
      clearColumnLayout: () => gridRef.current?.clearColumnLayout(),

      // Options
      setOptions: (opts) => gridRef.current?.setOptions(opts),
      getOptions: () => gridRef.current?.getOptions() ?? ({} as GridOptions),

      // Pagination methods
      goToPage: (page) => gridRef.current?.goToPage(page),
      setPageSize: (pageSize) => gridRef.current?.setPageSize(pageSize),
      getPaginationState: () => gridRef.current?.getPaginationState() ?? {
        currentPage: 1, pageSize: 20, totalCount: 0, totalPages: 0, loading: false,
      },
      fetchData: () => gridRef.current?.fetchData() ?? Promise.resolve(),

      // 내부 인스턴스 직접 접근
      getGridInstance: () => gridRef.current,
    }), []);

    return (
      <div
        ref={containerRef}
        className={wrapperClassName}
        style={wrapperStyle}
      />
    );
  }
);
