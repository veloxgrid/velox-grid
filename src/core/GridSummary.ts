/**
 * VeloxGrid - GridSummary
 * @description Summary/Aggregation calculation module
 * Phase 13: Summary/Aggregation
 */

import type {
  GridContext,
  RowData,
  CellValue,
  SummaryConfig,
  SummaryResult,
  ColumnDefinition,
} from '../types';

/**
 * GridSummary 클래스
 * 
 * Footer Summary와 Group Summary 계산 담당
 */
export class GridSummary {
  private context: GridContext;
  private summaryCache: Map<string, SummaryResult>;

  constructor(context: GridContext) {
    this.context = context;
    this.summaryCache = new Map();
  }

  /**
   * Footer Summary 값 계산
   * @param field 컬럼 필드명
   * @returns 계산된 집계 값
   */
  public calculateFooterSummary(field: string): SummaryResult | null {
    const options = this.context.getOptions();
    const column = this.context.getState().columns.find(col => col.field === field);
    
    if (!column) return null;

    // 컬럼별 summary 설정 우선, 없으면 footerSummary.columns에서 찾기
    const summaryConfig = column.summary || options.footerSummary?.columns?.[field];
    
    if (!summaryConfig) return null;

    // 캐시 키
    const cacheKey = `footer:${field}`;
    
    // 캐시된 값이 있으면 반환
    if (this.summaryCache.has(cacheKey)) {
      return this.summaryCache.get(cacheKey)!;
    }

    // 표시 데이터에서 해당 컬럼 값 추출
    const displayData = this.context.getDisplayData();
    const values = displayData.map(row => row[field]);

    // 집계 함수 실행
    const value = this.executeAggregation(summaryConfig, values, displayData);

    // 포맷팅
    const formattedValue = this.formatSummaryValue(value, summaryConfig, column);

    const result: SummaryResult = {
      field,
      function: summaryConfig.function,
      value,
      formattedValue,
    };

    // 캐시 저장
    this.summaryCache.set(cacheKey, result);

    return result;
  }

  /**
   * 모든 Footer Summary 값 계산
   * @returns field -> SummaryResult 맵
   */
  public calculateAllFooterSummaries(): Map<string, SummaryResult> {
    const options = this.context.getOptions();
    const results = new Map<string, SummaryResult>();

    if (!options.footerSummary?.visible) {
      return results;
    }

    const columns = this.context.getVisibleColumns();

    columns.forEach(column => {
      const result = this.calculateFooterSummary(column.field);
      if (result) {
        results.set(column.field, result);
      }
    });

    return results;
  }

  /**
   * Group Summary 값 계산
   * @param field 컬럼 필드명
   * @param _groupValue 그룹 값 (reserved for future use)
   * @param groupData 그룹 데이터
   * @returns 계산된 집계 값
   */
  public calculateGroupSummary(
    field: string,
    _groupValue: CellValue,
    groupData: RowData[]
  ): SummaryResult | null {
    const options = this.context.getOptions();
    const column = this.context.getState().columns.find(col => col.field === field);

    if (!column || !options.groupSummary?.enabled) return null;

    const summaryConfig = options.groupSummary.columns?.[field];
    
    if (!summaryConfig) return null;

    // 그룹 데이터에서 해당 컬럼 값 추출
    const values = groupData.map(row => row[field]);

    // 집계 함수 실행
    const value = this.executeAggregation(summaryConfig, values, groupData);

    // 포맷팅
    const formattedValue = this.formatSummaryValue(value, summaryConfig, column);

    return {
      field,
      function: summaryConfig.function,
      value,
      formattedValue,
    };
  }

  /**
   * 집계 함수 실행
   * @param config Summary 설정
   * @param values 값 배열
   * @param data 원본 데이터 배열
   * @returns 집계된 값
   */
  private executeAggregation(
    config: SummaryConfig,
    values: CellValue[],
    data: RowData[]
  ): CellValue {
    // null/undefined 필터링
    const validValues = values.filter(v => v !== null && v !== undefined);

    switch (config.function) {
      case 'sum':
        return this.calculateSum(validValues);
      
      case 'avg':
        return this.calculateAverage(validValues);
      
      case 'count':
        return this.calculateCount(validValues);
      
      case 'min':
        return this.calculateMin(validValues);
      
      case 'max':
        return this.calculateMax(validValues);
      
      case 'custom':
        if (config.customFunction) {
          return config.customFunction(values, data);
        }
        return null;
      
      default:
        return null;
    }
  }

  /**
   * 합계 계산
   */
  private calculateSum(values: CellValue[]): number {
    return values.reduce((sum: number, val) => {
      const num = this.toNumber(val);
      return sum + (num !== null ? num : 0);
    }, 0);
  }

  /**
   * 평균 계산
   */
  private calculateAverage(values: CellValue[]): number | null {
    if (values.length === 0) return null;
    
    const sum = this.calculateSum(values);
    const count = values.filter(v => this.toNumber(v) !== null).length;
    
    return count > 0 ? sum / count : null;
  }

  /**
   * 개수 계산
   */
  private calculateCount(values: CellValue[]): number {
    return values.length;
  }

  /**
   * 최소값 계산
   */
  private calculateMin(values: CellValue[]): number | null {
    const numbers = values
      .map(v => this.toNumber(v))
      .filter(n => n !== null) as number[];
    
    return numbers.length > 0 ? Math.min(...numbers) : null;
  }

  /**
   * 최대값 계산
   */
  private calculateMax(values: CellValue[]): number | null {
    const numbers = values
      .map(v => this.toNumber(v))
      .filter(n => n !== null) as number[];
    
    return numbers.length > 0 ? Math.max(...numbers) : null;
  }

  /**
   * CellValue를 숫자로 변환
   */
  private toNumber(value: CellValue): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // 콤마 제거 후 변환
      const cleaned = value.replace(/,/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
    return null;
  }

  /**
   * Summary 값 포맷팅
   */
  private formatSummaryValue(
    value: CellValue,
    config: SummaryConfig,
    column: ColumnDefinition
  ): string {
    // 커스텀 포맷터가 있으면 사용
    if (config.formatter) {
      return config.formatter(value);
    }

    // 컬럼 포맷터가 있으면 사용
    if (column.formatter) {
      return column.formatter(value, {} as RowData, column);
    }

    // 기본 포맷팅
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'number') {
      // config.format 적용 (예: '0,0.00')
      if (config.format) {
        return this.applyNumberFormat(value, config.format);
      }
      // 기본 숫자 포맷
      return this.formatNumber(value);
    }

    return String(value);
  }

  /**
   * 숫자 포맷 적용
   * @param value 숫자 값
   * @param format 포맷 문자열 (예: '0,0.00')
   */
  private applyNumberFormat(value: number, format: string): string {
    // 간단한 포맷 파싱
    const hasComma = format.includes(',');
    const decimalMatch = format.match(/\.(\d+)/);
    const decimalPlaces = decimalMatch ? decimalMatch[1].length : 0;

    let result = value.toFixed(decimalPlaces);

    if (hasComma) {
      // 천 단위 콤마 추가
      const parts = result.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      result = parts.join('.');
    }

    return result;
  }

  /**
   * 기본 숫자 포맷팅
   */
  private formatNumber(value: number): string {
    // 정수면 그대로, 소수면 소수점 2자리까지
    if (Number.isInteger(value)) {
      return value.toLocaleString('en-US');
    }
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  /**
   * 캐시 무효화
   */
  public invalidateCache(): void {
    this.summaryCache.clear();
  }

  /**
   * 특정 필드의 캐시만 무효화
   */
  public invalidateFieldCache(field: string): void {
    this.summaryCache.delete(`footer:${field}`);
  }

  /**
   * Summary 값 가져오기 (캐시 우선)
   */
  public getSummaryValue(field: string): CellValue {
    const result = this.calculateFooterSummary(field);
    return result?.value ?? null;
  }

  /**
   * 모든 Summary 값 가져오기
   */
  public getAllSummaryValues(): Record<string, CellValue> {
    const results = this.calculateAllFooterSummaries();
    const values: Record<string, CellValue> = {};
    
    results.forEach((result, field) => {
      values[field] = result.value;
    });

    return values;
  }
}
