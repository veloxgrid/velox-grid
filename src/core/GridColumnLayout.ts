/**
 * GridColumnLayout - Column Group Layout Module
 * Phase 19: Column Group (다단계 헤더)
 * 
 * 컬럼 레이아웃(다단계 헤더)의 파싱, 정규화, 헤더 매트릭스 생성을 담당
 * RealGrid의 setColumnLayout 패턴을 참고하여 설계
 */

import type {
  ColumnDefinition,
  ColumnLayoutItem,
  ColumnLayoutItemConfig,
  ColumnGroupHeader,
  NormalizedLayoutNode,
  HeaderMatrix,
} from '../types';

/**
 * 컬럼 레이아웃 아이템을 정규화된 노드 트리로 변환
 */
export function parseColumnLayout(
  layout: ColumnLayoutItem[],
  columns: ColumnDefinition[]
): NormalizedLayoutNode[] {
  const columnMap = new Map<string, ColumnDefinition>();
  columns.forEach(col => columnMap.set(col.field, col));
  
  const usedFields = new Set<string>();
  
  function parseItem(item: ColumnLayoutItem): NormalizedLayoutNode | null {
    // 문자열 → 단일 컬럼 참조
    if (typeof item === 'string') {
      if (!columnMap.has(item)) {
        console.warn(`[VeloxGrid] Column layout: field "${item}" not found in columns`);
        return null;
      }
      usedFields.add(item);
      return {
        type: 'column',
        field: item,
        visible: columnMap.get(item)?.visible !== false,
      };
    }
    
    // 객체: 단일 컬럼 참조 또는 그룹
    const config = item as ColumnLayoutItemConfig;
    
    if (config.visible === false) {
      return null;
    }
    
    // 단일 컬럼 참조 ({ column: "fieldName" })
    if (config.column) {
      if (!columnMap.has(config.column)) {
        console.warn(`[VeloxGrid] Column layout: field "${config.column}" not found in columns`);
        return null;
      }
      usedFields.add(config.column);
      return {
        type: 'column',
        field: config.column,
        widthOverride: config.width,
        visible: columnMap.get(config.column)?.visible !== false,
      };
    }
    
    // 그룹 ({ name: "groupName", items: [...] })
    if (config.items && config.items.length > 0) {
      const children = config.items
        .map(child => parseItem(child))
        .filter((node): node is NormalizedLayoutNode => node !== null);
      
      if (children.length === 0) return null;
      
      const header = normalizeHeader(config.header, config.name);
      
      return {
        type: 'group',
        name: config.name,
        header,
        children,
        hideChildHeaders: config.hideChildHeaders ?? false,
        visible: true,
      };
    }
    
    return null;
  }
  
  const nodes = layout
    .map(item => parseItem(item))
    .filter((node): node is NormalizedLayoutNode => node !== null);
  
  // 레이아웃에 포함되지 않은 visible 컬럼을 끝에 추가
  columns.forEach(col => {
    if (col.visible !== false && !usedFields.has(col.field) && !isSpecialColumn(col.field)) {
      nodes.push({
        type: 'column',
        field: col.field,
        visible: true,
      });
    }
  });
  
  return nodes;
}

/**
 * 헤더 텍스트를 ColumnGroupHeader 객체로 정규화
 */
function normalizeHeader(
  header?: string | ColumnGroupHeader,
  fallbackName?: string
): ColumnGroupHeader {
  if (!header) {
    return { text: fallbackName || '', visible: true };
  }
  if (typeof header === 'string') {
    return { text: header, visible: true };
  }
  return { visible: true, ...header };
}

/**
 * 특수 컬럼 여부 확인
 */
function isSpecialColumn(field: string): boolean {
  return field === '__checkbox' || field === '__rownum' || field === '__drag';
}

/**
 * ColumnLayoutItem에서 field명 추출 (문자열이면 그대로, 객체이면 column 필드)
 */
function getItemField(item: ColumnLayoutItem): string | null {
  if (typeof item === 'string') return item;
  const config = item as ColumnLayoutItemConfig;
  return config.column || null;
}

/**
 * 트리의 최대 깊이 계산 (leaf 컬럼까지의 깊이)
 */
export function calculateMaxDepth(nodes: NormalizedLayoutNode[]): number {
  function getDepth(node: NormalizedLayoutNode): number {
    if (node.type === 'column') return 1;
    if (!node.children || node.children.length === 0) return 1;
    
    let headerRows = 1; // 그룹 자체의 헤더 1행
    if (node.hideChildHeaders) {
      // 자식 헤더가 숨겨진 경우, 자식 중 그룹의 깊이만 계산
      const childGroupDepth = Math.max(
        0,
        ...node.children.map(child => 
          child.type === 'group' ? getDepth(child) : 0
        )
      );
      return headerRows + childGroupDepth;
    }
    
    const maxChildDepth = Math.max(...node.children.map(getDepth));
    return headerRows + maxChildDepth;
  }
  
  if (nodes.length === 0) return 1;
  return Math.max(...nodes.map(getDepth));
}

/**
 * 각 노드의 colSpan, rowSpan, leafColumns, depth를 계산
 */
export function computeSpans(
  nodes: NormalizedLayoutNode[],
  maxDepth: number,
  columns: ColumnDefinition[]
): void {
  const columnMap = new Map<string, ColumnDefinition>();
  columns.forEach(col => columnMap.set(col.field, col));
  
  function compute(node: NormalizedLayoutNode, depth: number): void {
    node.depth = depth;
    
    if (node.type === 'column') {
      node.colSpan = 1;
      node.rowSpan = maxDepth - depth;
      node.leafColumns = node.field ? [node.field] : [];
      return;
    }
    
    // 그룹
    if (!node.children || node.children.length === 0) {
      node.colSpan = 0;
      node.rowSpan = 1;
      node.leafColumns = [];
      return;
    }
    
    // 자식 재귀 계산
    const childDepth = depth + 1;
    node.children.forEach(child => compute(child, childDepth));
    
    // colSpan = 자식들의 colSpan 합
    node.colSpan = node.children.reduce((sum, child) => sum + (child.colSpan || 0), 0);
    
    // rowSpan = 1 (그룹 헤더는 항상 1행 차지)
    node.rowSpan = 1;
    
    // leafColumns = 모든 자식의 leafColumns 합치기
    node.leafColumns = [];
    node.children.forEach(child => {
      if (child.leafColumns) {
        node.leafColumns!.push(...child.leafColumns);
      }
    });
    
    // hideChildHeaders: 직접 자식 leaf 컬럼의 rowSpan 조정
    if (node.hideChildHeaders) {
      node.children.forEach(child => {
        if (child.type === 'column') {
          // 자식 컬럼은 표시하지 않으므로, 그룹이 대신 그 행을 차지
          // 하지만 그룹의 rowSpan은 1로 유지하고, 
          // 자식 컬럼은 매트릭스에서 제외하는 방식으로 처리
        }
      });
    }
  }
  
  nodes.forEach(node => compute(node, 0));
}

/**
 * 헤더 매트릭스 생성 — CSS Grid 렌더링에 사용
 * 각 HeaderCell에 gridRow, gridColumn 위치 정보 포함
 */
export function buildHeaderMatrix(
  nodes: NormalizedLayoutNode[],
  maxDepth: number,
  columns: ColumnDefinition[]
): HeaderMatrix {
  const columnMap = new Map<string, ColumnDefinition>();
  columns.forEach(col => columnMap.set(col.field, col));
  
  const matrix: HeaderMatrix = Array.from({ length: maxDepth }, () => []);
  
  // 현재 grid-column 위치 추적 (1-based for CSS Grid)
  let currentCol = 1;
  
  function traverse(node: NormalizedLayoutNode, depth: number, startCol: number): number {
    if (node.type === 'column') {
      const col = node.field ? columnMap.get(node.field) : undefined;
      const rowSpan = maxDepth - depth;
      
      matrix[depth].push({
        type: 'column',
        text: col?.header || node.field || '',
        field: node.field,
        colSpan: 1,
        rowSpan,
        align: col?.headerAlign || col?.align,
        column: col,
        gridColumn: startCol,
        gridRow: depth + 1, // CSS Grid는 1-based
      });
      
      return startCol + 1;
    }
    
    // 그룹
    if (!node.children || node.children.length === 0) return startCol;
    
    // 그룹 헤더 셀
    const headerVisible = node.header?.visible !== false;
    if (headerVisible) {
      matrix[depth].push({
        type: 'group',
        text: node.header?.text || node.name || '',
        colSpan: node.colSpan || 1,
        rowSpan: node.hideChildHeaders ? (maxDepth - depth) : 1,
        align: node.header?.align || 'center',
        className: node.header?.className,
        gridColumn: startCol,
        gridRow: depth + 1,
        groupName: node.name,
      });
    }
    
    // hideChildHeaders일 때: 그룹 헤더가 전체 높이를 차지하고, 자식 헤더는 생성하지 않음
    if (node.hideChildHeaders) {
      // 자식의 leaf 컬럼 수만큼 currentCol 전진
      let nextCol = startCol;
      node.children.forEach(child => {
        nextCol += child.colSpan || 0;
      });
      return nextCol;
    }
    
    // 자식 노드들을 다음 depth에 배치
    let nextCol = startCol;
    node.children.forEach(child => {
      nextCol = traverse(child, depth + 1, nextCol);
    });
    
    return nextCol;
  }
  
  nodes.forEach(node => {
    currentCol = traverse(node, 0, currentCol);
  });
  
  return matrix;
}

/**
 * 레이아웃 트리에서 leaf 컬럼들의 표시 순서를 추출 (DFS)
 */
export function getLayoutColumnOrder(nodes: NormalizedLayoutNode[]): string[] {
  const order: string[] = [];
  
  function dfs(node: NormalizedLayoutNode): void {
    if (!node.visible) return;
    
    if (node.type === 'column' && node.field) {
      order.push(node.field);
    } else if (node.children) {
      node.children.forEach(dfs);
    }
  }
  
  nodes.forEach(dfs);
  return order;
}

/**
 * GridColumnLayout — 컬럼 레이아웃 매니저
 * VeloxGrid의 모듈로 사용
 */
export class GridColumnLayout {
  private layout: ColumnLayoutItem[] | null = null;
  private normalizedNodes: NormalizedLayoutNode[] | null = null;
  private headerMatrix: HeaderMatrix | null = null;
  private columnOrder: string[] | null = null;
  private maxDepth: number = 1;
  private dirty: boolean = true;
  
  /**
   * 레이아웃 설정
   */
  setLayout(layout: ColumnLayoutItem[] | null): void {
    this.layout = layout;
    this.dirty = true;
    this.normalizedNodes = null;
    this.headerMatrix = null;
    this.columnOrder = null;
  }
  
  /**
   * 현재 레이아웃 반환
   */
  getLayout(): ColumnLayoutItem[] | null {
    return this.layout;
  }
  
  /**
   * 레이아웃 유무 확인
   */
  hasLayout(): boolean {
    return this.layout !== null && this.layout.length > 0;
  }
  
  /**
   * 레이아웃 빌드 (정규화 + span 계산 + 매트릭스 생성)
   * columns가 변경될 때마다 호출 필요
   */
  build(columns: ColumnDefinition[]): void {
    if (!this.layout || this.layout.length === 0) {
      this.normalizedNodes = null;
      this.headerMatrix = null;
      this.columnOrder = null;
      this.maxDepth = 1;
      this.dirty = false;
      return;
    }
    
    // 1. 파싱 및 정규화
    this.normalizedNodes = parseColumnLayout(this.layout, columns);
    
    // 2. 최대 깊이 계산
    this.maxDepth = calculateMaxDepth(this.normalizedNodes);
    
    // 3. colSpan, rowSpan 등 계산
    computeSpans(this.normalizedNodes, this.maxDepth, columns);
    
    // 4. 헤더 매트릭스 생성
    this.headerMatrix = buildHeaderMatrix(this.normalizedNodes, this.maxDepth, columns);
    
    // 5. 컬럼 순서 추출
    this.columnOrder = getLayoutColumnOrder(this.normalizedNodes);
    
    this.dirty = false;
  }
  
  /**
   * 헤더 매트릭스 반환
   */
  getHeaderMatrix(): HeaderMatrix | null {
    return this.headerMatrix;
  }
  
  /**
   * 레이아웃에 따른 컬럼 순서 반환
   */
  getColumnOrder(): string[] | null {
    return this.columnOrder;
  }
  
  /**
   * 최대 헤더 깊이 (행 수)
   */
  getMaxDepth(): number {
    return this.maxDepth;
  }
  
  /**
   * 정규화된 노드 반환
   */
  getNormalizedNodes(): NormalizedLayoutNode[] | null {
    return this.normalizedNodes;
  }
  
  /**
   * 빌드 필요 여부
   */
  isDirty(): boolean {
    return this.dirty;
  }
  
  /**
   * 캐시 무효화
   */
  invalidate(): void {
    this.dirty = true;
  }
  
  /**
   * leaf 컬럼의 전체 개수 반환 (CSS Grid template-columns 용)
   */
  getLeafColumnCount(): number {
    return this.columnOrder?.length || 0;
  }

  /**
   * 특정 컬럼이 속한 직접 부모 그룹의 이름 반환
   * 그룹에 속하지 않으면 null 반환
   */
  getGroupNameFor(field: string): string | null {
    if (!this.normalizedNodes) return null;

    function find(nodes: NormalizedLayoutNode[], parentName: string | null): string | null {
      for (const node of nodes) {
        if (node.type === 'column' && node.field === field) {
          return parentName;
        }
        if (node.type === 'group' && node.children) {
          const result = find(node.children, node.name || null);
          if (result !== null) return result;
        }
      }
      return null;
    }

    return find(this.normalizedNodes, null);
  }

  /**
   * 특정 컬럼이 속한 직접 부모 그룹의 leaf 컬럼 목록 반환
   * 그룹에 속하지 않으면 null 반환
   */
  getGroupColumnsFor(field: string): string[] | null {
    if (!this.normalizedNodes) return null;

    function findInGroup(nodes: NormalizedLayoutNode[], parentLeaves: string[] | null): string[] | null {
      for (const node of nodes) {
        if (node.type === 'column' && node.field === field) {
          return parentLeaves;
        }
        if (node.type === 'group' && node.children) {
          const groupLeaves = node.leafColumns || [];
          const found = findInGroup(node.children, groupLeaves);
          if (found) return found;
        }
      }
      return null;
    }

    return findInGroup(this.normalizedNodes, null);
  }

  /**
   * 특정 그룹(name)의 마지막 leaf 컬럼 field 반환
   * 그룹 헤더 리사이즈 시 사용
   */
  getLastLeafColumnOfGroup(groupName: string): string | null {
    if (!this.normalizedNodes) return null;

    function findGroup(nodes: NormalizedLayoutNode[]): NormalizedLayoutNode | null {
      for (const node of nodes) {
        if (node.type === 'group' && node.name === groupName) return node;
        if (node.children) {
          const found = findGroup(node.children);
          if (found) return found;
        }
      }
      return null;
    }

    const group = findGroup(this.normalizedNodes);
    if (!group?.leafColumns || group.leafColumns.length === 0) return null;
    return group.leafColumns[group.leafColumns.length - 1];
  }

  /**
   * Phase 19: 레이아웃 내에서 컬럼 순서를 변경한다.
   * 같은 부모 그룹 안에서 sourceField와 targetField의 위치를 교환.
   * 변경 후 dirty 플래그를 설정하여 다음 build()에서 재계산되도록 한다.
   */
  reorderInLayout(sourceField: string, targetField: string): boolean {
    if (!this.layout) return false;

    function reorderInItems(items: ColumnLayoutItem[]): boolean {
      // 현재 레벨에서 sourceField와 targetField의 인덱스를 찾는다
      const sourceIdx = items.findIndex(item => getItemField(item) === sourceField);
      const targetIdx = items.findIndex(item => getItemField(item) === targetField);

      if (sourceIdx !== -1 && targetIdx !== -1) {
        // 같은 레벨에서 발견 — 위치 이동
        // state.columns의 reorder splice 패턴과 동일하게 처리:
        // 1) source 제거, 2) 원본 targetIdx에 삽입
        // splice(sourceIdx,1) 후 배열이 하나 줄어들지만 원본 targetIdx를 사용하면
        // 오른쪽 이동 시 target 뒤, 왼쪽 이동 시 target 앞에 자연스럽게 배치됨
        const [removed] = items.splice(sourceIdx, 1);
        items.splice(targetIdx, 0, removed);
        return true;
      }

      // 하위 그룹으로 재귀 탐색
      for (const item of items) {
        if (typeof item !== 'string' && (item as ColumnLayoutItemConfig).items) {
          const config = item as ColumnLayoutItemConfig;
          if (config.items && reorderInItems(config.items)) {
            return true;
          }
        }
      }

      return false;
    }

    const result = reorderInItems(this.layout);
    if (result) {
      this.dirty = true;
      this.normalizedNodes = null;
      this.headerMatrix = null;
      this.columnOrder = null;
    }
    return result;
  }

  /**
   * 특정 그룹이 최상위 레벨 그룹인지 확인
   */
  isTopLevelGroup(groupName: string): boolean {
    if (!this.normalizedNodes) return false;
    return this.normalizedNodes.some(
      node => node.type === 'group' && node.name === groupName
    );
  }

  /**
   * 그룹의 leaf 컬럼 목록 반환
   */
  getGroupLeafColumns(groupName: string): string[] | null {
    if (!this.normalizedNodes) return null;

    function findGroup(nodes: NormalizedLayoutNode[]): NormalizedLayoutNode | null {
      for (const node of nodes) {
        if (node.type === 'group' && node.name === groupName) return node;
        if (node.children) {
          const found = findGroup(node.children);
          if (found) return found;
        }
      }
      return null;
    }

    const group = findGroup(this.normalizedNodes);
    return group?.leafColumns || null;
  }

  /**
   * 최상위 레벨 아이템(그룹/컬럼)의 순서를 변경한다.
   * sourceName: 그룹명 또는 컬럼 field
   * targetName: 그룹명 또는 컬럼 field
   */
  reorderTopLevel(sourceName: string, targetName: string): boolean {
    if (!this.layout) return false;

    // 최상위 레벨에서 source와 target의 인덱스를 찾는다
    const sourceIdx = this.layout.findIndex(item => {
      if (typeof item === 'string') return item === sourceName;
      const config = item as ColumnLayoutItemConfig;
      return config.name === sourceName || config.column === sourceName;
    });
    const targetIdx = this.layout.findIndex(item => {
      if (typeof item === 'string') return item === targetName;
      const config = item as ColumnLayoutItemConfig;
      return config.name === targetName || config.column === targetName;
    });

    if (sourceIdx === -1 || targetIdx === -1 || sourceIdx === targetIdx) return false;

    const [removed] = this.layout.splice(sourceIdx, 1);
    this.layout.splice(targetIdx, 0, removed);

    this.dirty = true;
    this.normalizedNodes = null;
    this.headerMatrix = null;
    this.columnOrder = null;
    return true;
  }
}
