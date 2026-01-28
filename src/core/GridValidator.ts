/**
 * VeloxGrid - GridValidator
 * @description Cell validation logic
 * Phase 12.1: Cell Validation
 */

import type { CellValue, RowData, ValidationRule, ValidationResult, ColumnDefinition } from '../types';

export class GridValidator {
  /**
   * 단일 값에 대한 유효성 검사
   * @param value - 검사할 값
   * @param rules - 유효성 규칙 배열
   * @param row - 전체 행 데이터 (custom validator용)
   * @returns 검사 결과
   */
  static validate(value: CellValue, rules: ValidationRule[], row?: RowData): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    for (const rule of rules) {
      const error = this.validateRule(value, rule, row);
      if (error) {
        errors.push({ field: '', message: error });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 단일 규칙 검사
   * @param value - 검사할 값
   * @param rule - 유효성 규칙
   * @param row - 전체 행 데이터
   * @returns 에러 메시지 또는 null
   */
  private static validateRule(value: CellValue, rule: ValidationRule, row?: RowData): string | null {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value) ? null : rule.message;

      case 'min':
        return this.validateMin(value, rule.value as number) ? null : rule.message;

      case 'max':
        return this.validateMax(value, rule.value as number) ? null : rule.message;

      case 'minLength':
        return this.validateMinLength(value, rule.value as number) ? null : rule.message;

      case 'maxLength':
        return this.validateMaxLength(value, rule.value as number) ? null : rule.message;

      case 'pattern':
        return this.validatePattern(value, rule.value as RegExp | string) ? null : rule.message;

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value, row || {});
          if (typeof result === 'boolean') {
            return result ? null : rule.message;
          } else {
            return result || null;
          }
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Required 검사 - null, undefined, 빈 문자열 체크
   */
  private static validateRequired(value: CellValue): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return false;
    }
    return true;
  }

  /**
   * Min 검사 - 숫자 최소값
   */
  private static validateMin(value: CellValue, min: number): boolean {
    if (value === null || value === undefined) {
      return true; // required가 아니면 빈 값은 통과
    }
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return !isNaN(num) && num >= min;
  }

  /**
   * Max 검사 - 숫자 최대값
   */
  private static validateMax(value: CellValue, max: number): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return !isNaN(num) && num <= max;
  }

  /**
   * MinLength 검사 - 문자열 최소 길이
   */
  private static validateMinLength(value: CellValue, minLength: number): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    return String(value).length >= minLength;
  }

  /**
   * MaxLength 검사 - 문자열 최대 길이
   */
  private static validateMaxLength(value: CellValue, maxLength: number): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    return String(value).length <= maxLength;
  }

  /**
   * Pattern 검사 - 정규식 매칭
   */
  private static validatePattern(value: CellValue, pattern: RegExp | string): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(String(value));
  }

  /**
   * 전체 행 유효성 검사
   * @param row - 검사할 행 데이터
   * @param columns - 컬럼 정의 (validation 규칙 포함)
   * @returns 검사 결과
   */
  static validateRow(row: RowData, columns: ColumnDefinition[]): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    for (const column of columns) {
      if (column.validation && column.validation.length > 0) {
        const value = row[column.field];
        const result = this.validate(value, column.validation, row);
        
        if (!result.valid) {
          for (const error of result.errors) {
            errors.push({
              field: column.field,
              message: error.message
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 전체 데이터 유효성 검사
   * @param data - 검사할 데이터 배열
   * @param columns - 컬럼 정의
   * @returns 행별 검사 결과 배열
   */
  static validateAll(data: RowData[], columns: ColumnDefinition[]): ValidationResult[] {
    return data.map(row => this.validateRow(row, columns));
  }
}
