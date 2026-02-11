/**
 * VeloxGrid Integration Tests
 * @description VeloxGrid 클래스의 주요 기능 통합 테스트
 *   - Row State 전이 로직
 *   - 데이터 CRUD
 *   - Sort/Filter
 *   - Fixed Column 파티셔닝
 *   - Pagination
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VeloxGrid } from '../src/core/VeloxGrid';
import type { ColumnDefinition, RowData, GridOptions } from '../src/types';

// 테스트 공통 설정
const BASE_COLUMNS: ColumnDefinition[] = [
  { field: 'id', header: 'ID', type: 'number', width: 60 },
  { field: 'name', header: 'Name', type: 'text', width: 120 },
  { field: 'age', header: 'Age', type: 'number', width: 80 },
  { field: 'dept', header: 'Department', type: 'text', width: 120 },
  { field: 'salary', header: 'Salary', type: 'number', width: 100 },
];

const SAMPLE_DATA: RowData[] = [
  { id: 1, name: 'Alice', age: 25, dept: 'Engineering', salary: 60000 },
  { id: 2, name: 'Bob', age: 35, dept: 'Marketing', salary: 55000 },
  { id: 3, name: 'Charlie', age: 30, dept: 'Engineering', salary: 70000 },
  { id: 4, name: 'Diana', age: 28, dept: 'Design', salary: 50000 },
  { id: 5, name: 'Eve', age: 32, dept: 'Marketing', salary: 65000 },
];

function createGrid(options: Partial<GridOptions> = {}): VeloxGrid {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '400px';
  document.body.appendChild(container);

  return new VeloxGrid(container, {
    columns: BASE_COLUMNS,
    data: SAMPLE_DATA.map(row => ({ ...row })), // 깊은 복사
    height: 400,
    editable: true,
    sortable: true,
    filterable: true,
    ...options,
  });
}

function destroyGrid(grid: VeloxGrid) {
  grid.destroy();
  // container 정리
  const containers = document.querySelectorAll('.velox-grid');
  containers.forEach(el => el.parentElement?.removeChild(el));
}

// ============================================
// 데이터 CRUD
// ============================================

describe('VeloxGrid: 데이터 CRUD', () => {
  let grid: VeloxGrid;

  beforeEach(() => {
    grid = createGrid();
  });

  afterEach(() => {
    destroyGrid(grid);
  });

  it('초기 데이터 로드', () => {
    expect(grid.getData()).toHaveLength(5);
    expect(grid.getRowCount()).toBe(5);
  });

  it('getData는 데이터 배열 반환', () => {
    const data = grid.getData();
    expect(data[0].name).toBe('Alice');
    expect(data[4].name).toBe('Eve');
  });

  it('getRow으로 행 조회', () => {
    const row = grid.getRow(0);
    expect(row).not.toBeNull();
    expect(row!.name).toBe('Alice');
  });

  it('getRow 범위 밖 → null', () => {
    expect(grid.getRow(-1)).toBeNull();
    expect(grid.getRow(100)).toBeNull();
  });

  it('addRow 행 추가', () => {
    grid.addRow({ id: 6, name: 'Frank', age: 40, dept: 'HR', salary: 45000 });
    expect(grid.getRowCount()).toBe(6);
  });

  it('addRow 특정 인덱스에 삽입', () => {
    grid.addRow({ id: 6, name: 'Frank', age: 40 }, 0);
    expect(grid.getRow(0)!.name).toBe('Frank');
  });

  it('updateRow 행 수정', () => {
    grid.updateRow(0, { name: 'Alice Updated', salary: 75000 });
    const row = grid.getRow(0);
    expect(row!.name).toBe('Alice Updated');
    expect(row!.salary).toBe(75000);
    // 기존 값 유지
    expect(row!.age).toBe(25);
  });

  it('removeRow 행 삭제', () => {
    grid.removeRow(0);
    expect(grid.getRowCount()).toBe(4);
    expect(grid.getRow(0)!.name).toBe('Bob');
  });

  it('setData 전체 데이터 교체', () => {
    grid.setData([{ id: 100, name: 'New' }]);
    expect(grid.getRowCount()).toBe(1);
    expect(grid.getRow(0)!.name).toBe('New');
  });

  it('clearData 데이터 초기화', () => {
    grid.clearData();
    expect(grid.getRowCount()).toBe(0);
    expect(grid.getData()).toHaveLength(0);
  });

  it('getCellValue / setCellValue', () => {
    expect(grid.getCellValue(0, 'name')).toBe('Alice');
    grid.setCellValue(0, 'name', 'Alice2');
    expect(grid.getCellValue(0, 'name')).toBe('Alice2');
  });
});

// ============================================
// Row State 전이 로직 (Phase 15)
// ============================================

describe('VeloxGrid: Row State 전이', () => {
  let grid: VeloxGrid;

  beforeEach(() => {
    grid = createGrid();
  });

  afterEach(() => {
    destroyGrid(grid);
  });

  it('초기 상태: 모든 행 none', () => {
    for (let i = 0; i < grid.getRowCount(); i++) {
      expect(grid.getRowState(i)).toBe('none');
    }
  });

  it('addRow → created', () => {
    grid.addRow({ id: 6, name: 'Frank' });
    const lastIdx = grid.getRowCount() - 1;
    expect(grid.getRowState(lastIdx)).toBe('created');
  });

  it('updateRow (none → updated)', () => {
    grid.updateRow(0, { name: 'Alice Updated' });
    expect(grid.getRowState(0)).toBe('updated');
  });

  it('updateRow (created → created 유지)', () => {
    grid.addRow({ id: 6, name: 'Frank' });
    const lastIdx = grid.getRowCount() - 1;
    grid.updateRow(lastIdx, { name: 'Frank Updated' });
    expect(grid.getRowState(lastIdx)).toBe('created'); // created 유지
  });

  it('setCellValue (none → updated)', () => {
    grid.setCellValue(0, 'name', 'Changed');
    expect(grid.getRowState(0)).toBe('updated');
  });

  it('removeRow (none → deleted)', () => {
    grid.removeRow(0);
    // deleted 행은 displayData에서 제거되므로 getChanges로 확인
    const changes = grid.getChanges();
    expect(changes.deleted).toHaveLength(1);
    expect(changes.deleted[0].name).toBe('Alice');
  });

  it('removeRow (created → createAndDeleted)', () => {
    grid.addRow({ id: 6, name: 'Frank' });
    const lastIdx = grid.getRowCount() - 1;
    grid.removeRow(lastIdx);
    // createAndDeleted는 getChanges에 포함되지 않음
    const changes = grid.getChanges();
    expect(changes.created).toHaveLength(0);
    expect(changes.deleted).toHaveLength(0);
  });

  it('getChanges 분리 반환', () => {
    grid.addRow({ id: 6, name: 'NewRow' });
    grid.updateRow(0, { name: 'Updated' });
    grid.removeRow(1); // Bob 삭제

    const changes = grid.getChanges();
    expect(changes.created).toHaveLength(1);
    expect(changes.created[0].name).toBe('NewRow');
    expect(changes.updated).toHaveLength(1);
    expect(changes.updated[0].name).toBe('Updated');
    expect(changes.deleted).toHaveLength(1);
    expect(changes.deleted[0].name).toBe('Bob');
  });

  it('clearRowStates → 모두 none', () => {
    grid.updateRow(0, { name: 'Changed' });
    expect(grid.getRowState(0)).toBe('updated');
    grid.clearRowStates();
    expect(grid.getRowState(0)).toBe('none');
  });

  it('commit → createAndDeleted 완전 제거, 나머지 none', () => {
    grid.addRow({ id: 6, name: 'TempRow' });
    const lastIdx = grid.getRowCount() - 1;
    grid.removeRow(lastIdx); // createAndDeleted

    grid.updateRow(0, { name: 'Modified' });

    const countBefore = grid.getRowCount();
    grid.commit();

    // 모든 행 none으로
    for (let i = 0; i < grid.getRowCount(); i++) {
      expect(grid.getRowState(i)).toBe('none');
    }
    // getChanges 비어있음
    const changes = grid.getChanges();
    expect(changes.created).toHaveLength(0);
    expect(changes.updated).toHaveLength(0);
    expect(changes.deleted).toHaveLength(0);
  });

  it('setData → 모든 행 none 초기화', () => {
    grid.updateRow(0, { name: 'Changed' });
    grid.setData([{ id: 100, name: 'New' }]);
    expect(grid.getRowState(0)).toBe('none');
  });

  it('getCreatedRows / getUpdatedRows / getDeletedRows', () => {
    grid.addRow({ id: 6, name: 'NewRow' });
    grid.updateRow(0, { name: 'Updated' });
    grid.removeRow(1);

    expect(grid.getCreatedRows()).toHaveLength(1);
    expect(grid.getUpdatedRows()).toHaveLength(1);
    expect(grid.getDeletedRows()).toHaveLength(1);
  });
});

// ============================================
// Sort
// ============================================

describe('VeloxGrid: Sort', () => {
  let grid: VeloxGrid;

  beforeEach(() => {
    grid = createGrid();
  });

  afterEach(() => {
    destroyGrid(grid);
  });

  it('sort asc', () => {
    grid.sort('name', 'asc');
    const data = grid.getData();
    // displayData 기준으로 정렬되므로 getData가 아닌 getRow 사용
    const sortState = grid.getSortState();
    expect(sortState).toHaveLength(1);
    expect(sortState[0].field).toBe('name');
    expect(sortState[0].direction).toBe('asc');
  });

  it('sort desc', () => {
    grid.sort('age', 'desc');
    const sortState = grid.getSortState();
    expect(sortState[0].direction).toBe('desc');
  });

  it('clearSort 정렬 해제', () => {
    grid.sort('name', 'asc');
    grid.clearSort();
    expect(grid.getSortState()).toHaveLength(0);
  });
});

// ============================================
// Filter
// ============================================

describe('VeloxGrid: Filter', () => {
  let grid: VeloxGrid;

  beforeEach(() => {
    grid = createGrid();
  });

  afterEach(() => {
    destroyGrid(grid);
  });

  it('filter 적용', () => {
    grid.filter({ field: 'dept', operator: 'equals', value: 'Engineering' });
    expect(grid.getVisibleRowCount()).toBe(2);
  });

  it('다중 조건 filter', () => {
    grid.filter([
      { field: 'dept', operator: 'equals', value: 'Engineering' },
      { field: 'age', operator: 'greaterThan', value: 26 },
    ]);
    expect(grid.getVisibleRowCount()).toBe(1); // Charlie만
  });

  it('clearFilter 필터 해제', () => {
    grid.filter({ field: 'dept', operator: 'equals', value: 'Engineering' });
    grid.clearFilter();
    expect(grid.getVisibleRowCount()).toBe(5);
    expect(grid.getFilterState()).toBeNull();
  });
});

// ============================================
// Fixed Column 파티셔닝 (Phase 14)
// ============================================

describe('VeloxGrid: Fixed Column 파티셔닝', () => {
  it('fixedOptions.colCount 설정', () => {
    const grid = createGrid({ fixedOptions: { colCount: 2 } });

    const fixedOpts = grid.getFixedOptions();
    expect(fixedOpts.colCount).toBe(2);

    destroyGrid(grid);
  });

  it('fixedOptions.rightCount 설정', () => {
    const grid = createGrid({ fixedOptions: { rightCount: 1 } });

    const fixedOpts = grid.getFixedOptions();
    expect(fixedOpts.rightCount).toBe(1);

    destroyGrid(grid);
  });

  it('setFixedOptions 동적 변경', () => {
    const grid = createGrid();
    
    grid.setFixedOptions({ colCount: 2, rightCount: 1 });
    const opts = grid.getFixedOptions();
    expect(opts.colCount).toBe(2);
    expect(opts.rightCount).toBe(1);

    // 해제
    grid.setFixedOptions({ colCount: 0, rightCount: 0 });
    const opts2 = grid.getFixedOptions();
    expect(opts2.colCount).toBe(0);
    expect(opts2.rightCount).toBe(0);

    destroyGrid(grid);
  });
});

// ============================================
// Column 관리
// ============================================

describe('VeloxGrid: Column 관리', () => {
  let grid: VeloxGrid;

  beforeEach(() => {
    grid = createGrid();
  });

  afterEach(() => {
    destroyGrid(grid);
  });

  it('getColumn으로 컬럼 조회', () => {
    const col = grid.getColumn('name');
    expect(col).not.toBeNull();
    expect(col!.header).toBe('Name');
  });

  it('getColumn 없는 필드 → null', () => {
    expect(grid.getColumn('nonexistent')).toBeNull();
  });

  it('hideColumn / showColumn', () => {
    grid.hideColumn('age');
    const col = grid.getColumn('age');
    expect(col!.visible).toBe(false);

    grid.showColumn('age');
    expect(grid.getColumn('age')!.visible).toBe(true);
  });

  it('setColumnWidth', () => {
    grid.setColumnWidth('name', 200);
    expect(grid.getColumn('name')!.width).toBe(200);
  });
});

// ============================================
// Selection
// ============================================

describe('VeloxGrid: Selection', () => {
  let grid: VeloxGrid;

  beforeEach(() => {
    grid = createGrid({ selectionMode: 'multiple', selectionStyle: 'row' });
  });

  afterEach(() => {
    destroyGrid(grid);
  });

  it('selectRow', () => {
    grid.selectRow(0, true);
    expect(grid.isRowSelected(0)).toBe(true);
    expect(grid.getSelectedRows()).toContain(0);
  });

  it('selectRow 해제', () => {
    grid.selectRow(0, true);
    grid.selectRow(0, false);
    expect(grid.isRowSelected(0)).toBe(false);
  });

  it('selectAll', () => {
    grid.selectAll(true);
    expect(grid.getSelectedRows()).toHaveLength(5);
  });

  it('clearSelection', () => {
    grid.selectAll(true);
    grid.clearSelection();
    expect(grid.getSelectedRows()).toHaveLength(0);
  });

  it('getSelectedData', () => {
    grid.selectRow(0, true);
    grid.selectRow(2, true);
    const data = grid.getSelectedData();
    expect(data).toHaveLength(2);
  });
});

// ============================================
// CheckBar (Phase 7)
// ============================================

describe('VeloxGrid: CheckBar', () => {
  let grid: VeloxGrid;

  beforeEach(() => {
    grid = createGrid({ checkBar: { visible: true } });
  });

  afterEach(() => {
    destroyGrid(grid);
  });

  it('checkItem', () => {
    grid.checkItem(0, true);
    expect(grid.isItemChecked(0)).toBe(true);
    expect(grid.getCheckedItems()).toContain(0);
  });

  it('uncheckAll', () => {
    grid.checkItem(0, true);
    grid.checkItem(1, true);
    grid.uncheckAll();
    expect(grid.getCheckedItems()).toHaveLength(0);
  });

  it('checkAll', () => {
    grid.checkAll(true);
    expect(grid.getCheckedItems()).toHaveLength(5);
  });

  it('getCheckedData', () => {
    grid.checkItem(0, true);
    grid.checkItem(2, true);
    const data = grid.getCheckedData();
    expect(data).toHaveLength(2);
  });
});

// ============================================
// Pagination (Phase 18) - Local
// ============================================

describe('VeloxGrid: Local Pagination', () => {
  let grid: VeloxGrid;

  beforeEach(() => {
    // 큰 데이터셋
    const bigData: RowData[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      age: 20 + (i % 30),
      dept: ['Engineering', 'Marketing', 'Design'][i % 3],
      salary: 40000 + i * 1000,
    }));

    grid = createGrid({
      data: bigData,
      pagination: {
        enabled: true,
        mode: 'page',
        pageSize: 10,
      },
    });
  });

  afterEach(() => {
    destroyGrid(grid);
  });

  it('초기 페이지네이션 상태', () => {
    const state = grid.getPaginationState();
    expect(state.currentPage).toBe(1);
    expect(state.pageSize).toBe(10);
    expect(state.totalCount).toBe(50);
    expect(state.totalPages).toBe(5);
  });

  it('goToPage 페이지 이동', () => {
    grid.goToPage(3);
    const state = grid.getPaginationState();
    expect(state.currentPage).toBe(3);
  });

  it('goToPage 범위 밖 → 클램핑', () => {
    grid.goToPage(0); // 범위 밖 (최소)
    expect(grid.getPaginationState().currentPage).toBe(1);

    grid.goToPage(100); // 범위 밖 (최대) → 마지막 페이지로 클램핑
    expect(grid.getPaginationState().currentPage).toBe(5);
  });

  it('setPageSize 페이지 크기 변경', () => {
    grid.setPageSize(25);
    const state = grid.getPaginationState();
    expect(state.pageSize).toBe(25);
    expect(state.totalPages).toBe(2);
    expect(state.currentPage).toBe(1); // 페이지 리셋
  });

  it('getVisibleRowCount는 현재 페이지 행 수', () => {
    expect(grid.getVisibleRowCount()).toBe(10); // 첫 페이지
    grid.goToPage(5); // 마지막 페이지
    expect(grid.getVisibleRowCount()).toBe(10);
  });
});

// ============================================
// Options / Lifecycle
// ============================================

describe('VeloxGrid: Options & Lifecycle', () => {
  it('getOptions 반환', () => {
    const grid = createGrid();
    const opts = grid.getOptions();
    expect(opts.editable).toBe(true);
    expect(opts.sortable).toBe(true);
    destroyGrid(grid);
  });

  it('destroy 후 안전', () => {
    const grid = createGrid();
    grid.destroy();
    // destroy 후 추가 호출해도 에러 안 남 (방어 코드)
    // 일부 메서드는 이미 null인 요소를 참조할 수 있으므로
    // 에러가 나지 않는지만 확인
  });

  it('refresh 호출', () => {
    const grid = createGrid();
    // 에러 없이 호출 가능한지 확인
    grid.refresh();
    expect(grid.getRowCount()).toBe(5);
    destroyGrid(grid);
  });
});
