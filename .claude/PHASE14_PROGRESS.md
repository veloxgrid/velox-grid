# VeloxGrid Phase 14: Fixed Columns 구현 진행 상황

> **작업 시작**: 2025-02-05  
> **현재 상태**: 컬럼 파티션 로직 완료 (60%), DOM 구조 변경 진행 중

---

## ✅ 완료된 작업 (60%)

### 1. FixedOptions 타입 정의 ✅

**파일**: `src/types/index.ts`

```typescript
/**
 * Column fixed options (RealGrid style)
 */
export interface FixedOptions {
  /** Number of columns to fix from left */
  colCount?: number;
  /** Number of columns to fix from right */
  rightCount?: number;
}
```

### 2. ColumnCache 인터페이스 확장 ✅

**파일**: `src/core/VeloxGrid.ts`

```typescript
interface ColumnCache {
  visible: ColumnDefinition[] | null;
  fixedLeft: ColumnDefinition[] | null;
  fixedLeftData: ColumnDefinition[] | null;  // Phase 14: 새로 추가
  scrollable: ColumnDefinition[] | null;
  fixedRight: ColumnDefinition[] | null;     // Phase 14: 새로 추가
  dirty: boolean;
}

// 초기화
private columnCache: ColumnCache = {
  visible: null,
  fixedLeft: null,
  fixedLeftData: null,  // Phase 14
  scrollable: null,
  fixedRight: null,     // Phase 14
  dirty: true,
};
```

### 3. invalidateColumnCache 수정 ✅

```typescript
invalidateColumnCache(): void {
  this.columnCache.dirty = true;
  this.columnCache.visible = null;
  this.columnCache.fixedLeft = null;
  this.columnCache.fixedLeftData = null;  // 추가
  this.columnCache.scrollable = null;
  this.columnCache.fixedRight = null;     // 추가
}
```

### 4. API 메서드 구현 ✅

```typescript
setFixedOptions(options: FixedOptions): void {
  this.options.fixedOptions = {
    colCount: options.colCount ?? this.options.fixedOptions?.colCount ?? 0,
    rightCount: options.rightCount ?? this.options.fixedOptions?.rightCount ?? 0,
  };
  
  this.invalidateColumnCache();
  this.render();
}

getFixedOptions(): FixedOptions {
  return this.options.fixedOptions || { colCount: 0, rightCount: 0 };
}
```

### 5. 컬럼 파티션 로직 구현 ✅

**구현된 메서드**:

```typescript
/**
 * Get fixed left columns (special columns only: CheckBar, RowNumbers, DragHandle)
 * Phase 14: Changed to only return special columns
 */
getFixedLeftColumns(): ColumnDefinition[] {
  if (this.columnCache.dirty || !this.columnCache.fixedLeft) {
    this.columnCache.fixedLeft = this.state.columns.filter(
      col => this.isSpecialColumn(col) && col.visible !== false
    );
  }
  return this.columnCache.fixedLeft;
}

/**
 * Get data columns fixed to left (based on fixedOptions.colCount)
 */
getFixedLeftDataColumns(): ColumnDefinition[] {
  if (this.columnCache.dirty || !this.columnCache.fixedLeftData) {
    const { colCount = 0 } = this.options.fixedOptions || {};
    const dataColumns = this.getDataColumns();
    this.columnCache.fixedLeftData = colCount > 0 ? dataColumns.slice(0, colCount) : [];
  }
  return this.columnCache.fixedLeftData;
}

/**
 * Get columns fixed to right (based on fixedOptions.rightCount)
 */
getFixedRightColumns(): ColumnDefinition[] {
  if (this.columnCache.dirty || !this.columnCache.fixedRight) {
    const { rightCount = 0 } = this.options.fixedOptions || {};
    const dataColumns = this.getDataColumns();
    const totalCount = dataColumns.length;
    this.columnCache.fixedRight = rightCount > 0 ? dataColumns.slice(totalCount - rightCount) : [];
  }
  return this.columnCache.fixedRight;
}

/**
 * Get scrollable columns (middle area between fixed left and fixed right)
 */
getScrollableColumns(): ColumnDefinition[] {
  if (this.columnCache.dirty || !this.columnCache.scrollable) {
    const { colCount = 0, rightCount = 0 } = this.options.fixedOptions || {};
    const dataColumns = this.getDataColumns();
    const totalCount = dataColumns.length;
    
    // Calculate scrollable range: colCount ~ (totalCount - rightCount)
    const startIndex = colCount;
    const endIndex = totalCount - rightCount;
    
    this.columnCache.scrollable = startIndex < endIndex 
      ? dataColumns.slice(startIndex, endIndex)
      : [];
    
    this.columnCache.dirty = false;
  }
  return this.columnCache.scrollable;
}

/**
 * Get data columns (exclude special columns)
 */
private getDataColumns(): ColumnDefinition[] {
  return this.state.columns.filter(
    col => col.visible !== false && !this.isSpecialColumn(col)
  );
}

/**
 * Check if column is special (CheckBar, RowNumbers, DragHandle)
 */
private isSpecialColumn(col: ColumnDefinition): boolean {
  return col.field === '__checkbox' || 
         col.field === '__rownum' || 
         col.field === '__drag';
}
```

**빌드 결과**:
```
✓ TypeScript 컴파일 성공
✓ 번들 크기: UMD 82.48 KB, ESM 114.58 KB
```

---

## 🚧 다음 작업 (40%)

### 6. DOM 구조 변경

**파일**: `src/core/VeloxGrid.ts - build()` 메서드

**필요한 변경**:

```typescript
// DOM 요소 추가 (클래스 상단)
public fixedRightContainer: HTMLElement | null = null;
public fixedRightHeader: HTMLElement | null = null;
public fixedRightBody: HTMLElement | null = null;
public fixedRightBodyInner: HTMLElement | null = null;
public fixedRightFooter: HTMLElement | null = null;

// build() 메서드에 Fixed Right 컨테이너 추가
private build(): void {
  // ... 기존 코드 (Fixed Left 부분)

  // Fixed Right Container 추가
  if (this.hasFixedRight()) {
    this.fixedRightContainer = createElement('div', 'velox-fixed-right');
    this.fixedRightHeader = createElement('div', 'velox-header velox-header--fixed-right');
    this.fixedRightBody = createElement('div', 'velox-body velox-body--fixed-right');
    this.fixedRightBodyInner = createElement('div', 'velox-body-inner');
    this.fixedRightBody.appendChild(this.fixedRightBodyInner);
    this.fixedRightContainer.appendChild(this.fixedRightHeader);
    this.fixedRightContainer.appendChild(this.fixedRightBody);
    
    if (this.options.footerSummary?.visible) {
      this.fixedRightFooter = createElement('div', 'velox-footer velox-footer--fixed-right');
      this.fixedRightContainer.appendChild(this.fixedRightFooter);
    }
    
    wrapper.appendChild(this.fixedRightContainer);
  }
}

// hasFixedRight() 메서드 추가
hasFixedRight(): boolean {
  const { rightCount = 0 } = this.options.fixedOptions || {};
  return rightCount > 0;
}
```

### 7. GridRenderer 수정

**파일**: `src/core/GridRenderer.ts`

**수정 필요한 메서드**:

1. **renderHeader()** - Fixed Right 헤더 렌더링 추가
2. **renderBody()** - Fixed Right 바디 렌더링 추가  
3. **renderFooter()** - Fixed Right 푸터 렌더링 추가 (if footerSummary enabled)

```typescript
renderHeader(): void {
  // 1. Fixed Left Header (Special + Fixed Left Data)
  if (this.grid.fixedLeftHeader) {
    const fixedLeftColumns = [
      ...this.grid.getFixedLeftColumns(),      // Special columns
      ...this.grid.getFixedLeftDataColumns()   // Data columns (Phase 14)
    ];
    this.renderHeaderSection(this.grid.fixedLeftHeader, fixedLeftColumns);
  }

  // 2. Scrollable Header
  const scrollableColumns = this.grid.getScrollableColumns();
  this.renderHeaderSection(this.grid.headerElement, scrollableColumns);

  // 3. Fixed Right Header (NEW)
  if (this.grid.fixedRightHeader) {
    const fixedRightColumns = this.grid.getFixedRightColumns();
    this.renderHeaderSection(this.grid.fixedRightHeader, fixedRightColumns);
  }
}

// renderBody(), renderFooter()도 동일한 패턴으로 수정
```

### 8. CSS 스타일 추가

**파일**: `src/styles/velox-grid.css`

```css
/* Fixed Right Container */
.velox-fixed-right {
  flex-shrink: 0;
  overflow: hidden;
  border-left: 1px solid var(--velox-border-color);
  z-index: 2;
}

.velox-header--fixed-right,
.velox-body--fixed-right,
.velox-footer--fixed-right {
  overflow: hidden;
}

.velox-body--fixed-right {
  overflow-y: hidden;
}

/* Sync scroll with main body */
.velox-body--fixed-right .velox-body-inner {
  transform: translateY(var(--scroll-offset, 0));
}
```

### 9. 스크롤 동기화

**파일**: `src/core/VeloxGrid.ts - attachEvents()`

Fixed Right의 세로 스크롤을 메인 body와 동기화:

```typescript
const handleScroll = throttle(() => {
  const scrollTop = this.bodyElement.scrollTop;
  this.state.scroll.top = scrollTop;
  this.state.scroll.left = this.bodyElement.scrollLeft;
  
  // Sync fixed left scroll
  if (this.fixedLeftBody) {
    this.fixedLeftBody.scrollTop = scrollTop;
  }
  
  // Sync fixed right scroll (NEW)
  if (this.fixedRightBody) {
    this.fixedRightBody.scrollTop = scrollTop;
  }
  
  if (this.options.virtualScroll) this.renderBody();
  this.events.onScroll?.(this.state.scroll.top, this.state.scroll.left);
}, 16);
```

### 10. 데모 페이지 작성

**파일**: `examples/phase14-fixed-demo.html`

3가지 시나리오 데모:
1. Left Fixed (colCount: 2)
2. Right Fixed (rightCount: 1)
3. Both Fixed (colCount: 2, rightCount: 1)

### 11. 문서 업데이트

- **README.md**: Fixed Columns 섹션 추가
- **PROGRESS.md**: Phase 14 완료 기록
- **CHANGELOG.md**: v0.8.0 릴리스 노트

---

## 🎯 현재 진행률

```
[████████████░░░░░░░░] 60%

✅ 타입 정의 및 API (20%)
✅ ColumnCache 확장 (20%)
✅ 컬럼 파티션 로직 (20%)
⏭️ DOM 구조 변경 (10%)
⏭️ GridRenderer 수정 (10%)
⏭️ CSS 스타일 (5%)
⏭️ 스크롤 동기화 (5%)
⏭️ 데모 페이지 (5%)
⏭️ 문서 업데이트 (5%)
```

---

## 📌 주의사항

### 1. 특수 컬럼 처리
- CheckBar, RowNumbers, DragHandle은 항상 왼쪽 고정
- `fixedOptions.colCount`는 **데이터 컬럼만** 계산
- 특수 컬럼과 데이터 컬럼을 명확히 구분

### 2. 컬럼 인덱스 계산 예시
```
Total Columns: 10개
fixedOptions: { colCount: 2, rightCount: 1 }

구조:
[Special Cols] [Fixed Left Data (0-1)] [Scrollable (2-8)] [Fixed Right (9)]
    ↑                   ↑                      ↑                  ↑
 CheckBar,          colCount: 2           중앙 스크롤      rightCount: 1
 RowNum,                                  (7개)
 DragHandle

getFixedLeftColumns() → Special columns only
getFixedLeftDataColumns() → [0, 1] (first 2 data columns)
getScrollableColumns() → [2, 3, 4, 5, 6, 7, 8] (middle 7 columns)
getFixedRightColumns() → [9] (last 1 column)
```

### 3. 기존 fixed 속성 호환성
- ❌ ColumnDefinition.fixed ('left' | 'right')는 **Phase 14에서 제거됨**
- ✅ fixedOptions만 사용 (RealGrid 스타일)

### 4. 성능 고려사항
- ✅ 컬럼 캐시 활용으로 재계산 최소화
- ✅ DOM 요소는 한 번만 생성
- ✅ Virtual Scroll 유지

---

## 🐛 예상 이슈 및 해결 방법

### Issue 1: 컬럼 순서 변경 시 Fixed 영역 깨짐
**해결**: 컬럼 재정렬 후 `invalidateColumnCache()` 호출

### Issue 2: 편집 모드에서 Fixed Right 영역 클릭 이벤트
**해결**: GridRenderer에서 Fixed Right 영역 이벤트 핸들러 추가

### Issue 3: Horizontal Scroll 시 Fixed 영역 동기화
**해결**: Fixed Left/Right는 scroll 이벤트 무시 (이미 구현됨)

---

## 📝 다음 작업 시작 명령

```
.claude/PHASE14_PROGRESS.md 읽고 Phase 14 계속해줘 - DOM 구조 변경부터
```

---

*마지막 업데이트: 2025-02-05 (60% 완료)*
