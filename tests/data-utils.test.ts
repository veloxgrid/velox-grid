/**
 * Data Utility Functions Tests
 * @description sortData, filterData, matchesFilter, compareValues, formatValue, parseValue 등
 */

import { describe, it, expect } from 'vitest';
import {
  formatValue,
  parseValue,
  compareValues,
  sortData,
  matchesFilter,
  filterData,
  deepClone,
  generateId,
} from '../src/utils/data';
import type { RowData, SortState, FilterCondition, FilterState } from '../src/types';

// ============================================
// deepClone
// ============================================

describe('deepClone', () => {
  it('원시값 복사', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(null)).toBe(null);
    expect(deepClone(true)).toBe(true);
  });

  it('Date 복사', () => {
    const date = new Date('2025-01-01');
    const cloned = deepClone(date);
    expect(cloned).toEqual(date);
    expect(cloned).not.toBe(date); // 참조 다름
  });

  it('배열 깊은 복사', () => {
    const arr = [1, [2, 3], { a: 4 }];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[1]).not.toBe(arr[1]);
  });

  it('객체 깊은 복사', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned.b).not.toBe(obj.b);
  });
});

// ============================================
// generateId
// ============================================

describe('generateId', () => {
  it('기본 prefix로 ID 생성', () => {
    const id = generateId();
    expect(id).toMatch(/^velox-\d+-[a-z0-9]+$/);
  });

  it('커스텀 prefix로 ID 생성', () => {
    const id = generateId('test');
    expect(id).toMatch(/^test-\d+-[a-z0-9]+$/);
  });

  it('고유 ID 생성', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

// ============================================
// formatValue
// ============================================

describe('formatValue', () => {
  it('null/undefined → 빈 문자열', () => {
    expect(formatValue(null)).toBe('');
    expect(formatValue(undefined)).toBe('');
  });

  it('text 타입 기본 변환', () => {
    expect(formatValue('hello', 'text')).toBe('hello');
    expect(formatValue(123, 'text')).toBe('123');
  });

  it('number 타입 로케일 포맷', () => {
    expect(formatValue(1234, 'number')).toBe('1,234');
    expect(formatValue('abc', 'number')).toBe('abc');
  });

  it('boolean 타입 Yes/No 변환', () => {
    expect(formatValue(true, 'boolean')).toBe('Yes');
    expect(formatValue(false, 'boolean')).toBe('No');
  });

  it('date 타입 Date 객체 처리', () => {
    const date = new Date('2025-01-15');
    const result = formatValue(date, 'date');
    expect(result).toBeTruthy();
    expect(result).not.toBe('');
  });

  it('date 타입 문자열 처리', () => {
    expect(formatValue('2025-01-15', 'date')).toBe('2025-01-15');
  });
});

// ============================================
// parseValue
// ============================================

describe('parseValue', () => {
  it('빈 값 → null', () => {
    expect(parseValue('', 'text')).toBe(null);
  });

  it('number 파싱', () => {
    expect(parseValue('123', 'number')).toBe(123);
    expect(parseValue('1,234.5', 'number')).toBe(1234.5);
    expect(parseValue('abc', 'number')).toBe(null);
  });

  it('boolean 파싱', () => {
    expect(parseValue('true', 'boolean')).toBe(true);
    expect(parseValue('1', 'boolean')).toBe(true);
    expect(parseValue('yes', 'boolean')).toBe(true);
    expect(parseValue('false', 'boolean')).toBe(false);
  });

  it('date 파싱', () => {
    const result = parseValue('2025-01-15', 'date');
    expect(result).toBeInstanceOf(Date);
    expect(parseValue('invalid', 'date')).toBe(null);
  });

  it('text 기본 반환', () => {
    expect(parseValue('hello', 'text')).toBe('hello');
  });
});

// ============================================
// compareValues
// ============================================

describe('compareValues', () => {
  it('null/undefined 정렬', () => {
    expect(compareValues(null, null)).toBe(0);
    expect(compareValues(null, 'a')).toBe(-1);
    expect(compareValues('a', null)).toBe(1);
    expect(compareValues(undefined, undefined)).toBe(0);
  });

  it('숫자 비교', () => {
    expect(compareValues(1, 2, 'number')).toBeLessThan(0);
    expect(compareValues(2, 1, 'number')).toBeGreaterThan(0);
    expect(compareValues(1, 1, 'number')).toBe(0);
  });

  it('문자열 비교', () => {
    expect(compareValues('apple', 'banana', 'text')).toBeLessThan(0);
    expect(compareValues('banana', 'apple', 'text')).toBeGreaterThan(0);
    expect(compareValues('same', 'same', 'text')).toBe(0);
  });

  it('boolean 비교', () => {
    expect(compareValues(true, false, 'boolean')).toBeGreaterThan(0);
    expect(compareValues(false, true, 'boolean')).toBeLessThan(0);
    expect(compareValues(true, true, 'boolean')).toBe(0);
  });

  it('날짜 비교', () => {
    const d1 = new Date('2025-01-01');
    const d2 = new Date('2025-06-01');
    expect(compareValues(d1, d2, 'date')).toBeLessThan(0);
    expect(compareValues(d2, d1, 'date')).toBeGreaterThan(0);
  });
});

// ============================================
// sortData
// ============================================

describe('sortData', () => {
  const data: RowData[] = [
    { name: 'Charlie', age: 30, salary: 50000 },
    { name: 'Alice', age: 25, salary: 60000 },
    { name: 'Bob', age: 35, salary: 55000 },
  ];

  it('빈 정렬 상태 → 원본 반환', () => {
    const result = sortData(data, [], {});
    expect(result).toEqual(data);
  });

  it('오름차순 정렬', () => {
    const sortStates: SortState[] = [{ field: 'name', direction: 'asc' }];
    const result = sortData(data, sortStates, { name: 'text' });
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Charlie');
  });

  it('내림차순 정렬', () => {
    const sortStates: SortState[] = [{ field: 'age', direction: 'desc' }];
    const result = sortData(data, sortStates, { age: 'number' });
    expect(result[0].age).toBe(35);
    expect(result[2].age).toBe(25);
  });

  it('다중 컬럼 정렬', () => {
    const sameAgeData: RowData[] = [
      { name: 'Bob', age: 30 },
      { name: 'Alice', age: 30 },
      { name: 'Charlie', age: 25 },
    ];
    const sortStates: SortState[] = [
      { field: 'age', direction: 'asc' },
      { field: 'name', direction: 'asc' },
    ];
    const result = sortData(sameAgeData, sortStates, { age: 'number', name: 'text' });
    expect(result[0].name).toBe('Charlie'); // age 25
    expect(result[1].name).toBe('Alice');   // age 30, A < B
    expect(result[2].name).toBe('Bob');     // age 30
  });

  it('원본 배열 변경하지 않음 (immutable)', () => {
    const original = [...data];
    sortData(data, [{ field: 'name', direction: 'asc' }], { name: 'text' });
    expect(data).toEqual(original);
  });

  it('direction이 null인 정렬 상태 무시', () => {
    const sortStates: SortState[] = [{ field: 'name', direction: null }];
    const result = sortData(data, sortStates, { name: 'text' });
    expect(result).toEqual(data);
  });
});

// ============================================
// matchesFilter
// ============================================

describe('matchesFilter', () => {
  it('equals', () => {
    const cond: FilterCondition = { field: 'name', operator: 'equals', value: 'Alice' };
    expect(matchesFilter('Alice', cond)).toBe(true);
    expect(matchesFilter('alice', cond)).toBe(true); // case-insensitive
    expect(matchesFilter('Bob', cond)).toBe(false);
  });

  it('notEquals', () => {
    const cond: FilterCondition = { field: 'name', operator: 'notEquals', value: 'Alice' };
    expect(matchesFilter('Bob', cond)).toBe(true);
    expect(matchesFilter('Alice', cond)).toBe(false);
  });

  it('contains', () => {
    const cond: FilterCondition = { field: 'name', operator: 'contains', value: 'li' };
    expect(matchesFilter('Alice', cond)).toBe(true);
    expect(matchesFilter('Bob', cond)).toBe(false);
  });

  it('notContains', () => {
    const cond: FilterCondition = { field: 'name', operator: 'notContains', value: 'li' };
    expect(matchesFilter('Bob', cond)).toBe(true);
    expect(matchesFilter('Alice', cond)).toBe(false);
  });

  it('startsWith', () => {
    const cond: FilterCondition = { field: 'name', operator: 'startsWith', value: 'Al' };
    expect(matchesFilter('Alice', cond)).toBe(true);
    expect(matchesFilter('Bob', cond)).toBe(false);
  });

  it('endsWith', () => {
    const cond: FilterCondition = { field: 'name', operator: 'endsWith', value: 'ce' };
    expect(matchesFilter('Alice', cond)).toBe(true);
    expect(matchesFilter('Bob', cond)).toBe(false);
  });

  it('greaterThan / lessThan', () => {
    const gt: FilterCondition = { field: 'age', operator: 'greaterThan', value: 30 };
    expect(matchesFilter(35, gt)).toBe(true);
    expect(matchesFilter(25, gt)).toBe(false);

    const lt: FilterCondition = { field: 'age', operator: 'lessThan', value: 30 };
    expect(matchesFilter(25, lt)).toBe(true);
    expect(matchesFilter(35, lt)).toBe(false);
  });

  it('greaterThanOrEqual / lessThanOrEqual', () => {
    const gte: FilterCondition = { field: 'age', operator: 'greaterThanOrEqual', value: 30 };
    expect(matchesFilter(30, gte)).toBe(true);
    expect(matchesFilter(29, gte)).toBe(false);

    const lte: FilterCondition = { field: 'age', operator: 'lessThanOrEqual', value: 30 };
    expect(matchesFilter(30, lte)).toBe(true);
    expect(matchesFilter(31, lte)).toBe(false);
  });

  it('between', () => {
    const cond: FilterCondition = { field: 'age', operator: 'between', value: 20, value2: 30 };
    expect(matchesFilter(25, cond)).toBe(true);
    expect(matchesFilter(20, cond)).toBe(true);
    expect(matchesFilter(30, cond)).toBe(true);
    expect(matchesFilter(35, cond)).toBe(false);
  });

  it('isEmpty / isNotEmpty', () => {
    const empty: FilterCondition = { field: 'name', operator: 'isEmpty', value: null };
    expect(matchesFilter(null, empty)).toBe(true);
    expect(matchesFilter(undefined, empty)).toBe(true);
    expect(matchesFilter('', empty)).toBe(true);
    expect(matchesFilter('hello', empty)).toBe(false);

    const notEmpty: FilterCondition = { field: 'name', operator: 'isNotEmpty', value: null };
    expect(matchesFilter('hello', notEmpty)).toBe(true);
    expect(matchesFilter(null, notEmpty)).toBe(false);
  });
});

// ============================================
// filterData
// ============================================

describe('filterData', () => {
  const data: RowData[] = [
    { name: 'Alice', age: 25, dept: 'Engineering' },
    { name: 'Bob', age: 35, dept: 'Marketing' },
    { name: 'Charlie', age: 30, dept: 'Engineering' },
    { name: 'Diana', age: 28, dept: 'Design' },
  ];

  it('null 필터 → 전체 반환', () => {
    expect(filterData(data, null)).toEqual(data);
  });

  it('빈 조건 → 전체 반환', () => {
    const state: FilterState = { conditions: [], logic: 'and' };
    expect(filterData(data, state)).toEqual(data);
  });

  it('단일 조건 AND 필터', () => {
    const state: FilterState = {
      conditions: [{ field: 'dept', operator: 'equals', value: 'Engineering' }],
      logic: 'and',
    };
    const result = filterData(data, state);
    expect(result).toHaveLength(2);
    expect(result.every(r => r.dept === 'Engineering')).toBe(true);
  });

  it('다중 조건 AND 필터', () => {
    const state: FilterState = {
      conditions: [
        { field: 'dept', operator: 'equals', value: 'Engineering' },
        { field: 'age', operator: 'greaterThan', value: 26 },
      ],
      logic: 'and',
    };
    const result = filterData(data, state);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('다중 조건 OR 필터', () => {
    const state: FilterState = {
      conditions: [
        { field: 'dept', operator: 'equals', value: 'Marketing' },
        { field: 'dept', operator: 'equals', value: 'Design' },
      ],
      logic: 'or',
    };
    const result = filterData(data, state);
    expect(result).toHaveLength(2);
  });
});
