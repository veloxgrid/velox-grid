/**
 * useVeloxGrid Hook
 * @description VeloxGrid 인스턴스를 React에서 편리하게 사용하기 위한 Hook
 * Phase 17: Framework Wrappers (React)
 * 
 * @example
 * ```tsx
 * import { useVeloxGrid } from 'velox-grid/react';
 * 
 * function App() {
 *   const { containerRef, grid } = useVeloxGrid({
 *     columns: [
 *       { field: 'name', header: 'Name' },
 *       { field: 'age', header: 'Age', type: 'number' },
 *     ],
 *     data: [{ name: 'Alice', age: 30 }],
 *     height: 400,
 *     editable: true,
 *     onCellEditEnd: (e) => console.log(e),
 *   });
 * 
 *   return (
 *     <div>
 *       <button onClick={() => grid?.addRow({ name: 'New', age: 0 })}>
 *         Add Row
 *       </button>
 *       <div ref={containerRef} />
 *     </div>
 *   );
 * }
 * ```
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { VeloxGrid } from '../core';
import type { GridOptions, GridEvents, VeloxGridInstance } from '../types';

type UseVeloxGridOptions = GridOptions & Partial<GridEvents>;

interface UseVeloxGridReturn {
  /** 그리드가 마운트될 컨테이너 ref (div에 연결) */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** VeloxGrid 인스턴스 (초기화 전 null) */
  grid: VeloxGridInstance | null;
  /** 그리드 초기화 여부 */
  isReady: boolean;
}

/**
 * useVeloxGrid Hook
 * 
 * GridOptions + GridEvents를 받아서 VeloxGrid 인스턴스를 생성하고 관리합니다.
 * containerRef를 div에 연결하면 자동으로 그리드가 초기화됩니다.
 * 
 * @param options - GridOptions와 GridEvents를 합친 옵션 객체
 * @returns containerRef, grid 인스턴스, isReady 상태
 */
export function useVeloxGrid(options: UseVeloxGridOptions): UseVeloxGridReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<VeloxGridInstance | null>(null);
  const optionsRef = useRef(options);
  const [isReady, setIsReady] = useState(false);

  // 항상 최신 옵션 참조 유지
  optionsRef.current = options;

  // 그리드 인스턴스에 안전하게 접근하는 getter
  const getGrid = useCallback(() => gridRef.current, []);

  // Grid 초기화 (마운트 시 1회)
  useEffect(() => {
    if (!containerRef.current) return;

    gridRef.current = new VeloxGrid(containerRef.current, optionsRef.current);
    setIsReady(true);

    return () => {
      if (gridRef.current) {
        gridRef.current.destroy();
        gridRef.current = null;
        setIsReady(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    containerRef,
    grid: getGrid(),
    isReady,
  };
}
