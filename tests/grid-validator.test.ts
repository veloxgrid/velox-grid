/**
 * GridValidator Tests
 * @description 셀 검증 로직 테스트
 */

import { describe, it, expect } from 'vitest';
import { GridValidator } from '../src/core/GridValidator';
import type { ValidationRule, ColumnDefinition, RowData } from '../src/types';

// ============================================
// 단일 규칙 검증
// ============================================

describe('GridValidator.validate', () => {
  describe('required', () => {
    const rules: ValidationRule[] = [{ type: 'required', message: '필수 입력' }];

    it('null → 실패', () => {
      const result = GridValidator.validate(null, rules);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBe('필수 입력');
    });

    it('undefined → 실패', () => {
      expect(GridValidator.validate(undefined, rules).valid).toBe(false);
    });

    it('빈 문자열 → 실패', () => {
      expect(GridValidator.validate('', rules).valid).toBe(false);
      expect(GridValidator.validate('  ', rules).valid).toBe(false);
    });

    it('값 있음 → 성공', () => {
      expect(GridValidator.validate('hello', rules).valid).toBe(true);
      expect(GridValidator.validate(0, rules).valid).toBe(true);
      expect(GridValidator.validate(false, rules).valid).toBe(true);
    });
  });

  describe('min / max', () => {
    it('min: 값이 최소값 이상이면 성공', () => {
      const rules: ValidationRule[] = [{ type: 'min', value: 10, message: '최소 10' }];
      expect(GridValidator.validate(10, rules).valid).toBe(true);
      expect(GridValidator.validate(15, rules).valid).toBe(true);
      expect(GridValidator.validate(5, rules).valid).toBe(false);
    });

    it('max: 값이 최대값 이하이면 성공', () => {
      const rules: ValidationRule[] = [{ type: 'max', value: 100, message: '최대 100' }];
      expect(GridValidator.validate(100, rules).valid).toBe(true);
      expect(GridValidator.validate(50, rules).valid).toBe(true);
      expect(GridValidator.validate(150, rules).valid).toBe(false);
    });

    it('null 값은 min/max 통과 (required 아니면)', () => {
      const rules: ValidationRule[] = [{ type: 'min', value: 10, message: '최소 10' }];
      expect(GridValidator.validate(null, rules).valid).toBe(true);
    });

    it('문자열 숫자 파싱', () => {
      const rules: ValidationRule[] = [{ type: 'min', value: 10, message: '최소 10' }];
      expect(GridValidator.validate('15', rules).valid).toBe(true);
      expect(GridValidator.validate('5', rules).valid).toBe(false);
    });
  });

  describe('minLength / maxLength', () => {
    it('minLength 검증', () => {
      const rules: ValidationRule[] = [{ type: 'minLength', value: 3, message: '최소 3자' }];
      expect(GridValidator.validate('abc', rules).valid).toBe(true);
      expect(GridValidator.validate('ab', rules).valid).toBe(false);
    });

    it('maxLength 검증', () => {
      const rules: ValidationRule[] = [{ type: 'maxLength', value: 5, message: '최대 5자' }];
      expect(GridValidator.validate('abc', rules).valid).toBe(true);
      expect(GridValidator.validate('abcdef', rules).valid).toBe(false);
    });

    it('null 값 통과', () => {
      const rules: ValidationRule[] = [{ type: 'minLength', value: 3, message: '최소 3자' }];
      expect(GridValidator.validate(null, rules).valid).toBe(true);
    });
  });

  describe('pattern', () => {
    it('RegExp 패턴 검증', () => {
      const rules: ValidationRule[] = [{ type: 'pattern', value: /^[A-Z]+$/, message: '대문자만' }];
      expect(GridValidator.validate('ABC', rules).valid).toBe(true);
      expect(GridValidator.validate('abc', rules).valid).toBe(false);
    });

    it('문자열 패턴 검증', () => {
      const rules: ValidationRule[] = [{ type: 'pattern', value: '^\\d+$', message: '숫자만' }];
      expect(GridValidator.validate('123', rules).valid).toBe(true);
      expect(GridValidator.validate('abc', rules).valid).toBe(false);
    });

    it('null 값 통과', () => {
      const rules: ValidationRule[] = [{ type: 'pattern', value: /^[A-Z]+$/, message: '대문자만' }];
      expect(GridValidator.validate(null, rules).valid).toBe(true);
    });
  });

  describe('custom', () => {
    it('커스텀 validator 함수 (boolean 반환)', () => {
      const rules: ValidationRule[] = [{
        type: 'custom',
        message: '짝수만',
        validator: (value) => typeof value === 'number' && value % 2 === 0,
      }];
      expect(GridValidator.validate(4, rules).valid).toBe(true);
      expect(GridValidator.validate(3, rules).valid).toBe(false);
    });

    it('커스텀 validator 함수 (문자열 반환 = 에러 메시지)', () => {
      const rules: ValidationRule[] = [{
        type: 'custom',
        message: '기본 메시지',
        validator: (value) => {
          if (typeof value === 'number' && value < 0) return '음수 불가';
          return true;
        },
      }];
      const result = GridValidator.validate(-1, rules);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBe('음수 불가');
    });

    it('row 데이터 참조 가능', () => {
      const rules: ValidationRule[] = [{
        type: 'custom',
        message: '급여는 나이보다 커야 합니다',
        validator: (value, row) => (value as number) > (row.age as number),
      }];
      expect(GridValidator.validate(50000, rules, { age: 30 }).valid).toBe(true);
      expect(GridValidator.validate(20, rules, { age: 30 }).valid).toBe(false);
    });
  });

  describe('다중 규칙', () => {
    it('모든 규칙 통과해야 valid', () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: '필수' },
        { type: 'minLength', value: 3, message: '최소 3자' },
        { type: 'maxLength', value: 10, message: '최대 10자' },
      ];
      expect(GridValidator.validate('hello', rules).valid).toBe(true);
      expect(GridValidator.validate('hi', rules).valid).toBe(false);
      expect(GridValidator.validate(null, rules).valid).toBe(false);
    });

    it('여러 에러 동시 반환', () => {
      const rules: ValidationRule[] = [
        { type: 'required', message: '필수' },
        { type: 'minLength', value: 3, message: '최소 3자' },
      ];
      const result = GridValidator.validate('', rules);
      expect(result.errors.length).toBe(2);
    });
  });
});

// ============================================
// validateRow
// ============================================

describe('GridValidator.validateRow', () => {
  const columns: ColumnDefinition[] = [
    {
      field: 'name',
      header: 'Name',
      validation: [
        { type: 'required', message: '이름 필수' },
        { type: 'minLength', value: 2, message: '2자 이상' },
      ],
    },
    {
      field: 'age',
      header: 'Age',
      validation: [
        { type: 'min', value: 0, message: '0 이상' },
        { type: 'max', value: 150, message: '150 이하' },
      ],
    },
    {
      field: 'email',
      header: 'Email',
      // validation 없음
    },
  ];

  it('모든 필드 유효 → valid', () => {
    const row: RowData = { name: 'Alice', age: 25, email: 'alice@test.com' };
    const result = GridValidator.validateRow(row, columns);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('name 누락 → 에러', () => {
    const row: RowData = { name: '', age: 25 };
    const result = GridValidator.validateRow(row, columns);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'name')).toBe(true);
  });

  it('age 범위 초과 → 에러', () => {
    const row: RowData = { name: 'Alice', age: 200 };
    const result = GridValidator.validateRow(row, columns);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'age')).toBe(true);
  });

  it('validation 없는 컬럼은 검사 안 함', () => {
    const row: RowData = { name: 'Alice', age: 25, email: null };
    expect(GridValidator.validateRow(row, columns).valid).toBe(true);
  });
});

// ============================================
// validateAll
// ============================================

describe('GridValidator.validateAll', () => {
  const columns: ColumnDefinition[] = [
    { field: 'name', header: 'Name', validation: [{ type: 'required', message: '필수' }] },
  ];

  it('전체 데이터 검증', () => {
    const data: RowData[] = [
      { name: 'Alice' },
      { name: '' },
      { name: 'Charlie' },
    ];
    const results = GridValidator.validateAll(data, columns);
    expect(results).toHaveLength(3);
    expect(results[0].valid).toBe(true);
    expect(results[1].valid).toBe(false);
    expect(results[2].valid).toBe(true);
  });
});
