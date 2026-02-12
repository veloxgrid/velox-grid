/**
 * VeloxGrid React Wrapper Types
 * Phase 17: Framework Wrappers (React)
 */

import type { GridOptions, GridEvents, VeloxGridInstance } from '../types';

/**
 * VeloxGridReact 컴포넌트 Props
 * GridOptions의 모든 옵션을 Props로 전달할 수 있으며,
 * GridEvents의 모든 이벤트를 콜백 Props로 전달할 수 있습니다.
 * 
 * @example
 * ```tsx
 * <VeloxGridReact
 *   columns={columns}
 *   data={data}
 *   height={400}
 *   editable={true}
 *   onCellEditEnd={(e) => console.log(e)}
 * />
 * ```
 */
export interface VeloxGridReactProps extends GridOptions, GridEvents {
  /** 
   * 컨테이너에 적용할 CSS 클래스 
   * GridOptions.className과 별개로 wrapper div에 적용됩니다.
   */
  wrapperClassName?: string;
  /**
   * 컨테이너에 적용할 인라인 스타일
   */
  wrapperStyle?: React.CSSProperties;
}

/**
 * VeloxGridReact ref를 통해 접근 가능한 메서드
 * VeloxGridInstance의 모든 메서드를 포함합니다.
 * 
 * @example
 * ```tsx
 * const gridRef = useRef<VeloxGridReactRef>(null);
 * 
 * // 데이터 조회
 * const data = gridRef.current?.getData();
 * 
 * // 행 추가
 * gridRef.current?.addRow({ name: 'New', value: 100 });
 * ```
 */
export interface VeloxGridReactRef extends VeloxGridInstance {
  /**
   * 내부 VeloxGrid 인스턴스에 직접 접근
   * 일반적으로 ref 메서드를 사용하되, 고급 시나리오에서 사용
   */
  getGridInstance(): VeloxGridInstance | null;
}
