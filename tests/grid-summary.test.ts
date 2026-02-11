/**
 * GridSummary Tests
 * @description Summary/Aggregation 계산 로직 테스트 (GridContext mock 사용)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GridSummary } from '../src/core/GridSummary';
import type { GridContext, RowData, ColumnDefinition, GridOptions, GridState } from '../src/types';

// ============================================
// Mock GridContext
// ============================================

function createMockContext(data: RowData[], columns: ColumnDefinition[], footerSummaryVisible = true): GridContext {
  const state: Partial<GridState> = {
    data,
    displayData: data,
    columns,
  };

  const options: Partial<GridOptions> = {
    columns,
    footerSummary: {
      visible: footerSummaryVisible,
    },
  };

  return {
    getOptions: () => options as GridOptions,
    getState: () => state as GridState,
    getDisplayData: () => data,
    getVisibleColumns: () => columns.filter(c => c.visible !== false),
    // 나머지 메서드는 테스트에서 사용하지 않으므로 빈 함수
  } as unknown as GridContext;
}

// ============================================
// 테스트 데이터
// ============================================

const COLUMNS: ColumnDefinition[] = [
  { field: 'name', header: 'Name', type: 'text', width: 120 },
  {
    field: 'salary',
    header: 'Salary',
    type: 'number',
    width: 100,
    summary: { function: 'sum' },
  },
  {
    field: 'age',
    header: 'Age',
    type: 'number',
    width: 80,
    summary: { function: 'avg' },
  },
  {
    field: 'score',
    header: 'Score',
    type: 'number',
    width: 80,
    summary: { function: 'count' },
  },
  {
    field: 'bonus',
    header: 'Bonus',
    type: 'number',
    width: 80,
    summary: { function: 'min' },
  },
  {
    field: 'rating',
    header: 'Rating',
    type: 'number',
    width: 80,
    summary: { function: 'max' },
  },
];

const DATA: RowData[] = [
  { name: 'Alice', salary: 60000, age: 25, score: 90, bonus: 5000, rating: 4.5 },
  { name: 'Bob', salary: 55000, age: 35, score: 85, bonus: 3000, rating: 3.8 },
  { name: 'Charlie', salary: 70000, age: 30, score: 92, bonus: 7000, rating: 4.9 },
  { name: 'Diana', salary: 50000, age: 28, score: 88, bonus: 2000, rating: 4.2 },
];

// ============================================
// Tests
// ============================================

describe('GridSummary', () => {
  let summary: GridSummary;

  beforeEach(() => {
    const context = createMockContext(DATA, COLUMNS);
    summary = new GridSummary(context);
  });

  describe('집계 함수', () => {
    it('sum: 합계 계산', () => {
      const value = summary.getSummaryValue('salary');
      expect(value).toBe(235000); // 60000 + 55000 + 70000 + 50000
    });

    it('avg: 평균 계산', () => {
      const value = summary.getSummaryValue('age');
      expect(value).toBe(29.5); // (25 + 35 + 30 + 28) / 4
    });

    it('count: 개수 계산', () => {
      const value = summary.getSummaryValue('score');
      expect(value).toBe(4);
    });

    it('min: 최소값 계산', () => {
      const value = summary.getSummaryValue('bonus');
      expect(value).toBe(2000);
    });

    it('max: 최대값 계산', () => {
      const value = summary.getSummaryValue('rating');
      expect(value).toBe(4.9);
    });
  });

  describe('summary 미설정 컬럼', () => {
    it('summary 없는 컬럼 → null', () => {
      const value = summary.getSummaryValue('name');
      expect(value).toBeNull();
    });
  });

  describe('빈 데이터', () => {
    it('빈 데이터셋에서 sum → 0', () => {
      const context = createMockContext([], COLUMNS);
      const emptySummary = new GridSummary(context);
      expect(emptySummary.getSummaryValue('salary')).toBe(0);
    });

    it('빈 데이터셋에서 avg → null', () => {
      const context = createMockContext([], COLUMNS);
      const emptySummary = new GridSummary(context);
      expect(emptySummary.getSummaryValue('age')).toBeNull();
    });

    it('빈 데이터셋에서 count → 0', () => {
      const context = createMockContext([], COLUMNS);
      const emptySummary = new GridSummary(context);
      expect(emptySummary.getSummaryValue('score')).toBe(0);
    });

    it('빈 데이터셋에서 min/max → null', () => {
      const context = createMockContext([], COLUMNS);
      const emptySummary = new GridSummary(context);
      expect(emptySummary.getSummaryValue('bonus')).toBeNull();
      expect(emptySummary.getSummaryValue('rating')).toBeNull();
    });
  });

  describe('null 값 포함 데이터', () => {
    it('null 값은 집계에서 제외', () => {
      const dataWithNull: RowData[] = [
        { name: 'A', salary: 100 },
        { name: 'B', salary: null },
        { name: 'C', salary: 200 },
      ];
      const cols: ColumnDefinition[] = [
        { field: 'salary', header: 'Salary', summary: { function: 'sum' } },
      ];
      const ctx = createMockContext(dataWithNull, cols);
      const s = new GridSummary(ctx);

      expect(s.getSummaryValue('salary')).toBe(300); // null 제외
    });
  });

  describe('캐시', () => {
    it('같은 필드 두 번 호출 시 캐시 사용', () => {
      const v1 = summary.getSummaryValue('salary');
      const v2 = summary.getSummaryValue('salary');
      expect(v1).toBe(v2);
    });

    it('invalidateCache 후 재계산', () => {
      summary.getSummaryValue('salary'); // 캐시 생성
      summary.invalidateCache();
      // 캐시 비워진 후에도 정상 동작
      expect(summary.getSummaryValue('salary')).toBe(235000);
    });

    it('invalidateFieldCache 특정 필드만 초기화', () => {
      summary.getSummaryValue('salary');
      summary.getSummaryValue('age');
      summary.invalidateFieldCache('salary');
      // salary만 재계산, age는 캐시 유지
      expect(summary.getSummaryValue('salary')).toBe(235000);
      expect(summary.getSummaryValue('age')).toBe(29.5);
    });
  });

  describe('getAllSummaryValues', () => {
    it('모든 summary 값 반환', () => {
      const values = summary.getAllSummaryValues();
      expect(values.salary).toBe(235000);
      expect(values.age).toBe(29.5);
      expect(values.score).toBe(4);
      expect(values.bonus).toBe(2000);
      expect(values.rating).toBe(4.9);
    });
  });

  describe('커스텀 함수', () => {
    it('custom function 실행', () => {
      const cols: ColumnDefinition[] = [{
        field: 'salary',
        header: 'Salary',
        summary: {
          function: 'custom',
          customFunction: (values) => {
            const nums = values.filter(v => typeof v === 'number') as number[];
            return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
          },
        },
      }];
      const ctx = createMockContext(DATA, cols);
      const s = new GridSummary(ctx);
      expect(s.getSummaryValue('salary')).toBe(58750); // avg(60k, 55k, 70k, 50k)
    });
  });

  describe('문자열 숫자 변환', () => {
    it('콤마 포함 문자열 → 숫자 변환', () => {
      const data: RowData[] = [
        { amount: '1,000' },
        { amount: '2,500' },
      ];
      const cols: ColumnDefinition[] = [{
        field: 'amount',
        header: 'Amount',
        summary: { function: 'sum' },
      }];
      const ctx = createMockContext(data, cols);
      const s = new GridSummary(ctx);
      expect(s.getSummaryValue('amount')).toBe(3500);
    });
  });
});
