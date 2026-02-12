/**
 * useVeloxGrid Composable (Vue 3)
 * @description Vue 3 Composition API로 VeloxGrid를 사용하기 위한 Composable
 * Phase 17: Framework Wrappers (Vue)
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="grid?.addRow({ name: 'New', age: 0 })">Add Row</button>
 *     <div ref="containerRef" />
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * import { useVeloxGrid } from 'velox-grid/vue';
 * 
 * const { containerRef, grid, isReady } = useVeloxGrid({
 *   columns: [
 *     { field: 'name', header: 'Name' },
 *     { field: 'age', header: 'Age', type: 'number' },
 *   ],
 *   data: [{ name: 'Alice', age: 30 }],
 *   height: 400,
 *   onCellEditEnd: (e) => console.log(e),
 * });
 * </script>
 * ```
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { VeloxGrid } from '../core';
import type { GridOptions, GridEvents, VeloxGridInstance } from '../types';

type UseVeloxGridOptions = GridOptions & Partial<GridEvents>;

interface UseVeloxGridReturn {
  /** 그리드가 마운트될 컨테이너 ref (template ref로 연결) */
  containerRef: Ref<HTMLDivElement | null>;
  /** VeloxGrid 인스턴스 (초기화 전 null) */
  grid: Ref<VeloxGridInstance | null>;
  /** 그리드 초기화 여부 */
  isReady: Ref<boolean>;
}

/**
 * useVeloxGrid Composable
 * 
 * @param options - GridOptions와 GridEvents를 합친 옵션 객체
 * @returns containerRef, grid 인스턴스, isReady 상태
 */
export function useVeloxGrid(options: UseVeloxGridOptions): UseVeloxGridReturn {
  const containerRef = ref<HTMLDivElement | null>(null);
  const grid = ref<VeloxGridInstance | null>(null) as Ref<VeloxGridInstance | null>;
  const isReady = ref(false);

  onMounted(() => {
    if (!containerRef.value) return;

    grid.value = new VeloxGrid(containerRef.value, options);
    isReady.value = true;
  });

  onUnmounted(() => {
    if (grid.value) {
      grid.value.destroy();
      grid.value = null;
      isReady.value = false;
    }
  });

  return {
    containerRef,
    grid,
    isReady,
  };
}
