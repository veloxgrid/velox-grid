/**
 * Data Utility Functions
 */

import type { CellValue, RowData, SortState, FilterCondition, FilterState, ValueType } from '../types';

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'velox'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Format cell value based on type
 */
export function formatValue(value: CellValue, type: ValueType = 'text'): string {
  if (value === null || value === undefined) {
    return '';
  }

  switch (type) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return String(value);
    case 'datetime':
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return String(value);
    case 'text':
    default:
      return String(value);
  }
}

/**
 * Parse value to specific type
 */
export function parseValue(value: string, type: ValueType): CellValue {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case 'number':
      const num = parseFloat(value.replace(/,/g, ''));
      return isNaN(num) ? null : num;
    case 'boolean':
      return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
    case 'date':
    case 'datetime':
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    case 'text':
    default:
      return value;
  }
}

/**
 * Compare two values
 */
export function compareValues(a: CellValue, b: CellValue, type: ValueType = 'text'): number {
  // Handle null/undefined
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
  if (b === null || b === undefined) return 1;

  switch (type) {
    case 'number':
      return (a as number) - (b as number);
    case 'boolean':
      return (a as boolean) === (b as boolean) ? 0 : (a as boolean) ? 1 : -1;
    case 'date':
    case 'datetime':
      const dateA = a instanceof Date ? a : new Date(a as string);
      const dateB = b instanceof Date ? b : new Date(b as string);
      return dateA.getTime() - dateB.getTime();
    case 'text':
    default:
      return String(a).localeCompare(String(b));
  }
}

/**
 * Sort data by multiple columns
 */
export function sortData(
  data: RowData[],
  sortStates: SortState[],
  columnTypes: Record<string, ValueType>
): RowData[] {
  if (!sortStates.length) return data;

  return [...data].sort((a, b) => {
    for (const { field, direction } of sortStates) {
      if (!direction) continue;
      
      const type = columnTypes[field] || 'text';
      const comparison = compareValues(a[field], b[field], type);
      
      if (comparison !== 0) {
        return direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Check if value matches filter condition
 */
export function matchesFilter(value: CellValue, condition: FilterCondition): boolean {
  const { operator, value: filterValue, value2 } = condition;

  // Handle empty checks first
  if (operator === 'isEmpty') {
    return value === null || value === undefined || value === '';
  }
  if (operator === 'isNotEmpty') {
    return value !== null && value !== undefined && value !== '';
  }

  // For other operators, convert to strings for comparison
  const strValue = String(value ?? '').toLowerCase();
  const strFilterValue = String(filterValue ?? '').toLowerCase();

  switch (operator) {
    case 'equals':
      return strValue === strFilterValue;
    case 'notEquals':
      return strValue !== strFilterValue;
    case 'contains':
      return strValue.includes(strFilterValue);
    case 'notContains':
      return !strValue.includes(strFilterValue);
    case 'startsWith':
      return strValue.startsWith(strFilterValue);
    case 'endsWith':
      return strValue.endsWith(strFilterValue);
    case 'greaterThan':
      return Number(value) > Number(filterValue);
    case 'lessThan':
      return Number(value) < Number(filterValue);
    case 'greaterThanOrEqual':
      return Number(value) >= Number(filterValue);
    case 'lessThanOrEqual':
      return Number(value) <= Number(filterValue);
    case 'between':
      const numValue = Number(value);
      return numValue >= Number(filterValue) && numValue <= Number(value2);
    default:
      return true;
  }
}

/**
 * Filter data by conditions
 */
export function filterData(data: RowData[], filterState: FilterState | null): RowData[] {
  if (!filterState || !filterState.conditions.length) {
    return data;
  }

  const { conditions, logic } = filterState;

  return data.filter((row) => {
    const results = conditions.map((condition) => 
      matchesFilter(row[condition.field], condition)
    );

    return logic === 'and' 
      ? results.every(Boolean) 
      : results.some(Boolean);
  });
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
