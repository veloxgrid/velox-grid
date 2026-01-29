# VeloxGrid 작업 진행 상황

> 마지막 업데이트: 2025-01-29

## 📊 프로젝트 개요

- **프로젝트명**: VeloxGrid
- **설명**: 빠르고 가벼운 Framework Agnostic 데이터 그리드 라이브러리
- **현재 버전**: v0.7.0
- **번들 크기**: 69KB (gzip 17.6KB)
- **라이선스**: MIT

---

## 🚨 다음 작업: 코드 구조 최적화 (v0.8.0) - Step 1 완료 ✅

> **작업 목표**: VeloxGrid.ts (2,776줄)와 velox-grid.css (731줄) 파일을 모듈화하여 유지보수성 향상
> **Step 1 완료**: CSS 모듈화 완료 (2025-01-29)
> **다음 단계**: Step 2 - GridRenderer.ts 분리

### 📊 현재 상태 분석

#### VeloxGrid.ts 현황 (94KB, 2,776줄)
파일이 너무 커서 단일 책임 원칙(SRP) 위반. 다음 기능들이 하나의 파일에 혼재:

| 기능 영역 | 예상 라인 | 분리 대상 모듈 |
|----------|----------|---------------|
| 렌더링 (Header, Body, Cell) | ~600줄 | `GridRenderer.ts` |
| 이벤트 핸들링 | ~400줄 | `GridEventManager.ts` |
| Filter 팝업 | ~150줄 | `GridFilterPopup.ts` |
| Column 메뉴 | ~100줄 | `GridColumnMenu.ts` |
| Drag & Drop (Column, Row) | ~200줄 | `GridDragManager.ts` |
| Export/Import | ~100줄 | `GridExportManager.ts` |
| Public API (Data, Selection, Edit 등) | ~800줄 | 유지 (Facade) |
| 나머지 (초기화, 상태관리) | ~400줄 | 유지 |

#### velox-grid.css 현황 (20KB, 731줄)
단일 CSS 파일에 모든 컴포넌트 스타일 포함:

| 스타일 영역 | 예상 라인 | 분리 대상 파일 |
|------------|----------|---------------|
| 기본 구조 (Grid, Wrapper) | ~80줄 | `_base.css` |
| Header 스타일 | ~100줄 | `_header.css` |
| Body/Cell 스타일 | ~120줄 | `_body.css` |
| Selection 스타일 | ~60줄 | `_selection.css` |
| Filter 팝업 | ~80줄 | `_filter.css` |
| Column 메뉴 | ~60줄 | `_column-menu.css` |
| Drag & Drop | ~50줄 | `_drag.css` |
| Editor 스타일 | ~80줄 | `_editor.css` |
| Tooltip | ~40줄 | `_tooltip.css` |
| Loading | ~30줄 | `_loading.css` |

---

### 📁 제안 아키텍처

#### TypeScript 구조 (src/core/)
```
src/core/
├── VeloxGrid.ts           # Facade 클래스 (~800줄 목표)
├── GridRenderer.ts        # NEW: 렌더링 담당
├── GridEventManager.ts    # NEW: 이벤트 통합 관리
├── GridFilterPopup.ts     # NEW: 필터 팝업 UI
├── GridColumnMenu.ts      # NEW: 컬럼 메뉴 UI
├── GridDragManager.ts     # NEW: 드래그 앤 드롭 통합
├── GridExportManager.ts   # NEW: Export/Import 통합
├── GridHistory.ts         # 기존 유지
├── GridSelection.ts       # 기존 유지
├── GridVirtualScroll.ts   # 기존 유지
├── GridEditor.ts          # 기존 유지
├── GridEditorFactory.ts   # 기존 유지
├── GridKeyboard.ts        # 기존 유지
├── GridColumnManager.ts   # 기존 유지
├── GridDataManager.ts     # 기존 유지
├── GridValidator.ts       # 기존 유지
├── GridTooltip.ts         # 기존 유지
└── index.ts               # 모듈 exports
```

#### CSS 구조 (src/styles/)
```
src/styles/
├── velox-grid.css         # 메인 진입점 (@import)
├── _variables.css         # CSS 변수
├── _base.css              # 기본 레이아웃
├── _header.css            # 헤더 스타일
├── _body.css              # 바디/셀 스타일
├── _selection.css         # 선택 스타일
├── _filter.css            # 필터 팝업
├── _column-menu.css       # 컬럼 메뉴
├── _drag.css              # 드래그 앤 드롭
├── _editor.css            # 에디터
├── _tooltip.css           # 툴팁
└── _loading.css           # 로딩
```

---

### 📋 작업 단계 (Sonnet 작업용)

#### Step 1: CSS 모듈화 (완료) ✅
CSS는 상대적으로 안전하게 분리 가능. vite는 CSS @import를 자동 번들링.

1. ✅ `src/styles/_variables.css` 생성 - CSS 변수 분리 (33줄)
2. ✅ `src/styles/_base.css` 생성 - 기본 레이아웃 (61줄)
3. ✅ `src/styles/_header.css` 생성 - 헤더 스타일 (205줄)
4. ✅ `src/styles/_body.css` 생성 - 바디/셀 스타일 (56줄)
5. ✅ `src/styles/_selection.css` 생성 - 선택 스타일 (29줄)
6. ✅ `src/styles/_filter.css` 생성 - 필터 팝업 (96줄)
7. ✅ `src/styles/_column-menu.css` 생성 - 컬럼 메뉴 (102줄)
8. ✅ `src/styles/_drag.css` 생성 - 드래그 앤 드롭 (76줄)
9. ✅ `src/styles/_editor.css` 생성 - 에디터 (182줄)
10. ✅ `src/styles/_tooltip.css` 생성 - 툴팁 (45줄)
11. ✅ `src/styles/_loading.css` 생성 - 로딩 (40줄)
12. ✅ `velox-grid.css`를 @import 모음으로 변경 (40줄)
13. ✅ 빌드 테스트: 번들 크기 15.38KB (gzip 3.06KB) - 기존과 동일
14. ✅ 개발 서버 테스트: 정상 동작 확인

**작업 시간**: 15분
**위험도**: 낮음 (CSS만 분리, 기능 변경 없음)
**번들 크기**: 변화 없음 (Vite가 자동 번들링)

#### Step 2: GridRenderer.ts 분리 (완료) ✅
VeloxGrid.ts에서 렌더링 관련 메서드 추출

**추출 완료 메서드:**
```typescript
// GridRenderer.ts로 이동 완료
- render()
- renderHeader()
- renderBody()
- createHeaderCell()
- createHeaderCheckbarCell()
- createRowBase()
- createCell()
- createCheckbarCell()
- updateLoadingState()
- updateRowValidationState()
```

**작업 시간**: 40분
**위험도**: 중간 (메서드 간 의존성 주의)
**번들 크기**: 변화 없음 (69.01 KB, gzip 17.62 KB)

#### Step 3: GridEventManager.ts 분리 (완료) ✅
이벤트 핸들링 로직 통합

**추출 완료 메서드:**
```typescript
// GridEventManager.ts로 이동 완료
- attachEvents()
- detachEvents()
- handleRowClick()
- handleCellClick()
- handleRowDoubleClick()
- handleKeyDown()
- handleArrowKey()
- handleEnterKey()
- handleTabKey()
- handleResize()
- handleScroll()
- scrollCellIntoView()
- scrollRowIntoView()
```

**작업 시간**: 35분
**위험도**: 중간
**번들 크기**: 변화 없음 (69.01 KB, gzip 17.62 KB)

#### Step 4: GridFilterPopup.ts 분리 (완료) ✅
필터 팝업 UI 독립

**추출 완료 메서드:**
```typescript
// GridFilterPopup.ts로 이동 완료
- showFilterPopup()
- closeFilterPopup()
- applyColumnFilter()
- removeColumnFilter()
- handleOutsideClick() (filter 관련)
- isOpen()
```

**작업 시간**: 25분
**위험도**: 낮음
**번들 크기**: 변화 없음 (69.01 KB, gzip 17.62 KB)

#### Step 5: GridColumnMenu.ts 분리 (완료) ✅
컬럼 메뉴 UI 독립

**추출 완료 메서드:**
```typescript
// GridColumnMenu.ts로 이동 완료
- showColumnMenu()
- closeColumnMenu()
- handleOutsideClick() (menu 관련)
- isOpen()
```

**작업 시간**: 20분
**위험도**: 낮음
**번들 크기**: 변화 없음 (69.01 KB, gzip 17.62 KB)

#### Step 6: GridDragManager.ts 분리 (완료) ✅
드래그 앤 드롭 통합

**추출 완료 메서드:**
```typescript
// GridDragManager.ts로 이동 완료
- startColumnDrag()
- handleColumnDragMove()
- handleColumnDragEnd()
- startRowDrag()
- handleRowDragMove()
- handleRowDragEnd()
- startResize()
- handleResizeMove()
- handleResizeEnd()
- isColumnDragging(), isRowDragging(), isResizing()
- cleanup()
```

**작업 시간**: 40분
**위험도**: 중간
**번들 크기**: 변화 없음 (69.01 KB, gzip 17.62 KB)

---

### 🔧 리팩토링 패턴

#### Facade 패턴 유지
VeloxGrid.ts는 Facade로 유지하며, 내부 모듈을 조율:

```typescript
// VeloxGrid.ts (리팩토링 후)
export class VeloxGrid implements VeloxGridInstance {
  private renderer: GridRenderer;
  private eventManager: GridEventManager;
  private filterPopup: GridFilterPopup;
  private columnMenu: GridColumnMenu;
  private dragManager: GridDragManager;
  private history: GridHistory;
  // ... 기존 모듈들

  constructor(...) {
    // 모듈 초기화
    this.renderer = new GridRenderer(this);
    this.eventManager = new GridEventManager(this);
    this.filterPopup = new GridFilterPopup(this);
    // ...
  }

  // Public API는 VeloxGrid에 유지
  render(): void {
    this.renderer.render();
  }
}
```

#### 컨텍스트 전달 패턴
각 모듈은 VeloxGrid 인스턴스 또는 필요한 컨텍스트만 전달받음:

```typescript
// GridRenderer.ts
export class GridRenderer {
  constructor(private grid: VeloxGrid) {}
  
  render(): void {
    // this.grid.getState(), this.grid.getOptions() 등 사용
  }
}
```

---

### ⚠️ 주의사항

1. **번들 크기 모니터링**
   - 분리 전후 번들 크기 비교 필수
   - Tree-shaking이 제대로 작동하는지 확인

2. **순환 참조 방지**
   - 모듈 간 import 방향 단방향 유지
   - VeloxGrid → 각 모듈 (역방향 금지)

3. **테스트**
   - 각 단계 완료 후 데모 페이지 테스트
   - 기존 기능 regression 확인

4. **Git 커밋**
   - 각 Step 완료 시 커밋
   - 문제 발생 시 롤백 용이하도록

---

### 📈 예상 효과 (유지보수성)

| 지표 | 현재 | 목표 |
|------|------|------|
| VeloxGrid.ts 라인 수 | 2,776줄 | ~800줄 |
| 단일 모듈 최대 라인 | 2,776줄 | ~400줄 |
| CSS 파일 수 | 1개 | 11개 (논리적 분리) |
| 빌드 후 CSS | 1개 | 1개 (자동 번들) |
| 유지보수성 | 낮음 | 높음 |
| 기능 추가 용이성 | 어려움 | 쉬움 |

---

### ❓ 모듈화 vs 경량화: 번들 크기에 미치는 영향

#### 결론: 모듈화는 경량화에 직접적 도움이 되지 않음

**모듈화 후 번들 크기 예상:**
```
현재:  69.01 KB (gzip: 17.62 KB)
예상:  69~70 KB (gzip: 17.5~18 KB) ← 거의 동일 또는 미세 증가
```

#### 이유

1. **Vite/Rollup 번들링 특성**
   - 빌드 시 모든 모듈이 하나의 파일로 합쳐짐
   - 파일 분리는 개발 편의성일 뿐, 최종 번들에는 영향 없음

2. **오히려 미세 증가 가능**
   - 모듈 간 import/export 문 추가
   - 클래스 인스턴스 생성 코드 추가
   - 단, gzip 압축 후에는 차이 미미

3. **Tree-shaking은 현재 구조에서 제한적**
   - VeloxGrid는 단일 클래스로 모든 기능 포함
   - 사용자가 특정 기능만 import하는 구조가 아님
   - 전체 라이브러리를 import하므로 tree-shaking 효과 없음

#### 실제 경량화를 원한다면?

**Option A: 기능별 플러그인 아키텍처 (대규모 리팩토링)**
```typescript
// 핵심만 포함된 VeloxGridCore (~30KB)
import { VeloxGridCore } from 'velox-grid/core';

// 필요한 플러그인만 추가
import { ExcelPlugin } from 'velox-grid/plugins/excel';
import { DragPlugin } from 'velox-grid/plugins/drag';

const grid = new VeloxGridCore('#container', options);
grid.use(ExcelPlugin);
grid.use(DragPlugin);
```

**Option B: 코드 최적화 (중간 수준)**
- 중복 코드 제거
- 불필요한 헬퍼 함수 정리
- SVG 아이콘 최적화 (현재 inline SVG 사용 중)
- 예상 절감: 5~10KB

**Option C: 외부 의존성 분리 (이미 적용됨)**
- SheetJS는 이미 선택적 외부 의존성
- 현재 zero-dependency 구조 유지 중

#### 권장 사항

| 목표 | 권장 작업 | 효과 |
|------|----------|------|
| 유지보수성 향상 | 모듈화 (현재 계획) | ⭐⭐⭐⭐⭐ |
| 번들 크기 감소 (소폭) | 코드 최적화 | 5~10KB 절감 |
| 번들 크기 감소 (대폭) | 플러그인 아키텍처 | 30~50% 절감 가능 |

**현재 번들 크기(69KB, gzip 17KB)는 데이터 그리드 라이브러리로서 매우 경량:**
- AG Grid: ~300KB+
- Handsontable: ~400KB+
- RealGrid: ~200KB+

➡️ **모듈화는 경량화가 아닌 "개발 생산성"을 위한 작업입니다.**

---

### 🚀 작업 시작 방법

```
.claude/PROGRESS.md 읽고 Step 1 CSS 모듈화 시작해줘
```

또는

```
VeloxGrid 최적화 Step 2 GridRenderer 분리 진행해줘
```

---

## ✅ 완료된 작업 (Phase 1-11)

### Phase 1: 기본 기능 (v0.1.0)
- ✅ 테이블 렌더링
- ✅ 컬럼 정의 시스템

### Phase 2: 체크박스/선택 (v0.1.0)
- ✅ 행 선택
- ✅ 다중 선택

### Phase 3: 정렬/필터링 (v0.1.0)
- ✅ 컬럼 정렬
- ✅ 데이터 필터링

### Phase 4: 편집 기능 (v0.1.0)
- ✅ 인라인 편집

### Phase 5: 가상 스크롤 (v0.2.0)
- ✅ 대용량 데이터 처리 (100,000+ 행)

### Phase 6: 컬럼 고급 기능 (v0.2.0)
- ✅ 컬럼 고정
- ✅ 헤더 필터 UI

### Phase 7: Selection 고도화 (v0.3.0)
- ✅ Cell Selection (개별 셀 선택)
- ✅ Block Selection (마우스 드래그 범위 선택)
- ✅ CheckBar 분리 (Selection과 독립)
- ✅ Exclusive Check (라디오 버튼 스타일)
- ✅ Checkable Callback (조건부 체크)
- ✅ Keyboard Navigation (화살표 키)
- ✅ Clipboard (Copy/Paste/Cut)
- ✅ Loading State
- ✅ Auto Fit Column

### Phase 8: Excel Export/Import (v0.4.0) ✅ 완료
- ✅ Excel Export (.xlsx) - SheetJS 사용
- ✅ Excel Import (.xlsx)
- ✅ CSV Export/Import
- ✅ JSON Export
- ✅ Export Options

### Phase 9: 키보드 & Undo/Redo 고도화 (v0.5.0) ✅ 완료
- ✅ Enter/Tab 이동 (편집 완료 후 다음 셀 자동 이동)
- ✅ Delete Key (선택 셀 내용 삭제)
- ✅ Undo/Redo (Ctrl+Z / Ctrl+Y)
- ✅ 키보드 단축키 강화 (Ctrl+C/V/X 직접 처리)

### Phase 10: 컬럼 기능 확장 (v0.6.0) ✅ 완료
- ✅ Column Reorder (드래그로 순서 변경)
- ✅ Column Menu (컨텍스트 메뉴)
- ✅ Column Fix/Unfix (동적 고정)

### Phase 11: 행 기능 확장 (v0.6.0) ✅ 완료
- ✅ Row Drag & Drop (순서 변경)
- ✅ moveRow() API

### Phase 12: 셀 기능 확장 (v0.7.0) ✅ 완료 - 2025-01-29
- ✅ Cell Validation (입력값 검증)
- ✅ Custom Cell Editor (드롭다운, 날짜 등)
- ✅ Cell Tooltip

---

## 🛠️ 코드 모듈화 (v0.6.0)

### 새로운 아키텍처
```
src/core/
├── VeloxGrid.ts           # 메인 Facade 클래스
├── GridHistory.ts         # Undo/Redo 관리 ✅
├── GridSelection.ts       # 선택 관리 ✅
├── GridVirtualScroll.ts   # 가상 스크롤 ✅
├── GridEditor.ts          # 편집 관리 ✅
├── GridKeyboard.ts        # 키보드 핸들링 ✅
├── GridColumnManager.ts   # 컬럼 관리 (캐싱 포함) ✅
├── GridDataManager.ts     # 데이터 관리 ✅
└── index.ts               # 모듈 exports ✅
```

### 모듈화 장점
- **관심사 분리**: 각 모듈이 단일 책임 원칙 준수
- **테스트 용이**: 개별 모듈 단위 테스트 가능
- **재사용성**: 모듈별 독립적 사용 가능
- **유지보수성**: 코드 변경 범위 최소화
- **성능 최적화**: Column 캐싱 시스템 도입

### Column 캐싱 시스템
```typescript
interface ColumnCache {
  visible: ColumnDefinition[] | null;
  fixedLeft: ColumnDefinition[] | null;
  scrollable: ColumnDefinition[] | null;
  dirty: boolean;
}
```
- 컬럼 변경 시만 캐시 무효화
- 반복 조회 시 O(1) 복잡도

---

## 🔜 다음 작업 (우선순위 순)

### 🔴 High Priority

#### Phase 12: 셀 기능 확장 (v0.7.0) 🚧 진행중
```
- ✅ Cell Validation (입력값 검증) - 2025-01-28 완료
- [ ] Custom Cell Editor (드롭다운, 날짜 등)
- [ ] Cell Tooltip
```

#### Phase 13: 합계/집계 (v0.7.0)
```
- [ ] Footer Summary (합계/평균/개수)
- [ ] Group Summary (그룹별 소계)
```

#### Phase 14: React 래퍼 (v0.8.0)
```
- [ ] React Component
- [ ] Hooks (useVeloxGrid)
- [ ] TypeScript 타입 강화
```

### 🟡 Medium Priority

#### Phase 15: 고급 기능
```
- [ ] Column Group (다단계 헤더)
- [ ] Row Grouping (필드 기준 그룹화)
- [ ] Row Detail (행 확장)
```

---

## 📊 빌드 결과 (v0.7.0)

```
velox-grid.js:      69.01 KB (gzip: 17.62 KB)
velox-grid.esm.js:  93.79 KB (gzip: 21.12 KB)
velox-grid.iife.js: 68.85 KB (gzip: 17.54 KB)
velox-grid.css:     15.40 KB (gzip:  3.05 KB)
```

### 번들 크기 변화
| 버전 | UMD | gzip |
|------|-----|------|
| v0.5.0 | 50.5KB | 12.9KB |
| v0.5.1 | 50.7KB | 13.1KB |
| v0.6.0 | 58.9KB | 14.9KB |
| v0.7.0 | 69.0KB | 17.6KB |

> Phase 12 기능 추가로 번들 크기 증가 (~10KB)

---

## 💡 Phase 10-11 상세 (v0.6.0)

### 새로 추가된 기능

#### Phase 10: Column Reorder & Menu
- **Column Drag Handle**: 헤더 셀에 드래그 핸들 추가
- **Column Menu**: 정렬, 숨기기, 자동 너비, 고정 등
- **Column Reorder**: 드래그 앤 드롭으로 컬럼 순서 변경

#### Phase 11: Row Drag & Drop
- **Row Drag Handle**: 행에 드래그 핸들 추가
- **Row Reorder**: 드래그 앤 드롭으로 행 순서 변경

### 새로 추가된 API

```typescript
// Column Methods (Phase 10)
fixColumn(field: string, position: 'left' | 'right' | false): void
reorderColumn(sourceField: string, targetField: string): void

// Row Methods (Phase 11)
moveRow(fromIndex: number, toIndex: number): void
```

### 새로운 모듈 클래스

```typescript
// GridHistory - Undo/Redo 관리
class GridHistory {
  push(action: UndoAction): void
  popUndo(): UndoAction | null
  popRedo(): UndoAction | null
  canUndo(): boolean
  canRedo(): boolean
  clear(): void
}

// GridSelection - 선택 관리
class GridSelection {
  selectRow(index: number, selected: boolean, mode: string): void
  selectCell(rowIndex: number, field: string, selected: boolean): void
  selectCellRange(...): void
  checkItem(index: number, checked: boolean, exclusive: boolean): boolean
  // ... more methods
}

// GridVirtualScroll - 가상 스크롤
class GridVirtualScroll {
  calculate(containerHeight: number, scrollTop: number, totalRows: number): VirtualState
  getVisibleRows<T>(data: T[]): { data: T; index: number }[]
  // ... more methods
}

// GridColumnManager - 컬럼 관리 (캐싱)
class GridColumnManager {
  getVisible(): ColumnDefinition[]  // cached
  getFixedLeft(): ColumnDefinition[] // cached
  getScrollable(): ColumnDefinition[] // cached
  reorder(sourceField: string, targetField: string): { sourceIndex, targetIndex }
  // ... more methods
}

// GridDataManager - 데이터 관리
class GridDataManager {
  setData(data: RowData[]): void
  addRow(row: RowData, index?: number): number
  removeRow(displayIndex: number): RowData | null
  moveRow(fromDisplayIndex: number, toDisplayIndex: number): boolean
  toggleSort(field: string): 'asc' | 'desc' | null
  // ... more methods
}
```

---

## 💡 주요 기술 결정사항

### 아키텍처
- TypeScript 기반
- Zero Dependencies (SheetJS는 선택적 외부 의존성)
- Framework Agnostic (Vanilla JS)
- **Facade Pattern**: VeloxGrid가 내부 모듈 조율

### 빌드 도구
- Vite (빌드 및 개발 서버)
- TypeScript Compiler (타입 생성)

### 테스트
- Vitest

### 번들 출력
- UMD: `dist/velox-grid.js`
- ESM: `dist/velox-grid.esm.js`
- IIFE: `dist/velox-grid.iife.js`
- CSS: `dist/velox-grid.css`
- Types: `dist/types/`

---

## 📁 프로젝트 구조

```
velox-grid/
├── .claude/              # Claude AI 작업 파일
│   └── PROGRESS.md
├── dist/                 # 빌드 출력
├── examples/
│   ├── index.html
│   ├── advanced.html
│   ├── phase7-demo.html
│   ├── phase8-demo.html
│   ├── phase9-demo.html
│   └── phase10-11-demo.html  # Column/Row Drag 데모
├── src/
│   ├── core/
│   │   ├── VeloxGrid.ts       # Facade
│   │   ├── GridHistory.ts     # Undo/Redo
│   │   ├── GridSelection.ts   # Selection
│   │   ├── GridVirtualScroll.ts
│   │   ├── GridEditor.ts
│   │   ├── GridKeyboard.ts
│   │   ├── GridColumnManager.ts
│   │   ├── GridDataManager.ts
│   │   └── index.ts
│   ├── styles/
│   │   └── velox-grid.css
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── data.ts
│   │   ├── dom.ts
│   │   ├── export.ts
│   │   └── index.ts
│   └── index.ts
├── README.md
├── ROADMAP.md
└── package.json
```

---

## 📝 다음 대화 시작 방법

새 대화를 시작할 때:

```
D:\Dev\git\velox-grid\.claude\PROGRESS.md 읽고 Phase 12 시작해줘
```

또는

```
velox-grid 프로젝트 진행상황 파일 읽고 [원하는 작업] 해줘
```

---

## 💡 Phase 12.1 상세: Cell Validation (2025-01-28)

### 구현 내용

#### 1. ValidationRule 타입 추가 (`src/types/index.ts`)
```typescript
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  message: string;
  validator?: (value: CellValue, row: RowData) => boolean | string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}
```

#### 2. GridValidator 모듈 생성 (`src/core/GridValidator.ts`)
- `validate()`: 단일 값 검증
- `validateRow()`: 전체 행 검증
- `validateAll()`: 전체 데이터 검증
- 지원하는 검증 규칙:
  - `required`: 필수 입력
  - `min/max`: 숫자 범위
  - `minLength/maxLength`: 문자열 길이
  - `pattern`: 정규식 패턴
  - `custom`: 커스텀 validator 함수

#### 3. VeloxGrid 통합
- `endEdit()` 메서드에 validation 로직 추가
- 검증 실패 시:
  - 셀에 `.velox-cell--invalid` 클래스 추가 (빨간 테두리)
  - `title` 속성에 에러 메시지 표시 (tooltip)
  - `onValidationError` 이벤트 발생
  - 편집 모드 유지 (저장 취소)

#### 4. CSS 스타일 추가 (`src/styles/velox-grid.css`)
```css
.velox-cell--invalid {
  border: 2px solid #f44336 !important;
  background-color: #ffebee !important;
}

.velox-validation-tooltip {
  /* 에러 메시지 툴팁 스타일 */
}
```

#### 5. 새로운 이벤트
```typescript
interface GridEvents {
  onValidationError?: (event: {
    rowIndex: number;
    field: string;
    value: CellValue;
    errors: string[];
  }) => void;
}
```

### 사용 예제

```typescript
const grid = new VeloxGrid('#grid', {
  columns: [
    {
      field: 'email',
      header: '이메일',
      editable: true,
      validation: [
        { type: 'required', message: '이메일은 필수입니다' },
        { 
          type: 'pattern', 
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
          message: '올바른 이메일 형식이 아닙니다' 
        }
      ]
    },
    {
      field: 'age',
      header: '나이',
      type: 'number',
      editable: true,
      validation: [
        { type: 'min', value: 19, message: '19세 이상만 가능합니다' },
        { type: 'max', value: 65, message: '65세 이하만 가능합니다' }
      ]
    },
    {
      field: 'password',
      header: '비밀번호',
      editable: true,
      validation: [
        { type: 'minLength', value: 8, message: '최소 8자 이상' },
        {
          type: 'custom',
          message: '영문, 숫자, 특수문자 포함 필요',
          validator: (value) => {
            const str = String(value);
            return /[a-zA-Z]/.test(str) && 
                   /[0-9]/.test(str) && 
                   /[!@#$%^&*]/.test(str);
          }
        }
      ]
    }
  ],
  // ...
}, {
  onValidationError: (event) => {
    console.log('Validation failed:', event);
  }
});
```

### 테스트 파일
- `examples/validation-test.html`: 3가지 validation 시나리오 데모
  1. Required & MinLength & Pattern (이메일, 전화번호)
  2. Number Range & Pattern (가격, 수량, 상품코드)
  3. Custom Validator (비밀번호, 비밀번호 확인, 나이)

### 번들 크기 영향
- 약 1.5KB 추가 (GridValidator 모듈)
- 총 번들 크기: ~60KB (gzip ~15KB)

---

## 🔜 Phase 12-15 개발 로드맵

### Phase 12.2: Custom Cell Editor
**우선순위: 높음** | **상태: 계획 중**

```typescript
type EditorType = 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'custom';

interface EditorOptions {
  type: EditorType;
  options?: Array<{ value: CellValue; label: string }>; // select용
  min?: number;
  max?: number;
  step?: number;
  format?: string; // date용
  renderer?: (cell: HTMLElement, value: CellValue, save: (v: CellValue) => void) => void;
}

interface ColumnDefinition {
  editor?: EditorOptions;
}
```

**구현 계획:**
1. `src/core/GridEditorFactory.ts` 생성
   - `createEditor(type, options): HTMLElement`
   - Select, Date, Checkbox 에디터 구현
2. VeloxGrid.ts의 `renderEditCell()` 수정
   - EditorFactory를 사용하여 에디터 생성

### Phase 12.3: Cell Tooltip
**우선순위: 중간** | **상태: 계획 중**

```typescript
interface ColumnDefinition {
  tooltip?: boolean | ((value: CellValue, row: RowData) => string);
}
```

**구현 계획:**
1. 마우스 hover 시 툴팁 표시
2. 긴 텍스트 자동 툴팁
3. 커스텀 툴팁 콜백 지원

---

### Phase 13: Footer Summary & Group Summary
**우선순위: 중간** | **예상 작업량: 높음** | **상태: 계획 중**

#### 13.1 Footer Summary
```typescript
interface FooterOptions {
  visible: boolean;
  height?: number;
}

interface ColumnDefinition {
  footer?: {
    type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
    formatter?: (value: number, data: RowData[]) => string;
    calculator?: (data: RowData[], field: string) => CellValue;
  };
}

interface GridOptions {
  footer?: FooterOptions;
}
```

**구현 계획:**
1. `src/core/GridFooter.ts` 생성 - 집계 계산 로직
2. VeloxGrid.ts에 푸터 영역 추가
3. CSS 스타일 추가

#### 13.2 Row Grouping (선택적)
```typescript
interface GroupOptions {
  field: string;
  collapsed?: boolean;
  aggregates?: Array<{
    field: string;
    type: 'sum' | 'avg' | 'count' | 'min' | 'max';
  }>;
}
```

---

### Phase 14: React Wrapper
**우선순위: 높음** | **예상 작업량: 중간** | **상태: 계획 중**

```typescript
interface VeloxGridProps {
  columns: ColumnDefinition[];
  data: RowData[];
  options?: Partial<GridOptions>;
  onDataChange?: (data: RowData[]) => void;
  onSelectionChange?: (rows: number[]) => void;
  onCellEdit?: (event: CellEditEvent) => void;
}
```

**구현 계획:**
1. `src/react/VeloxGridReact.tsx` 생성
2. `src/react/index.ts` exports
3. React peer dependency 추가
4. 별도 빌드 설정

---

### Phase 15: Performance & Polish
**우선순위: 중간** | **예상 작업량: 중간** | **상태: 계획 중**

**계획:**
1. 성능 최적화 (requestAnimationFrame, 벤치마크)
2. 접근성 (ARIA, 스크린 리더)
3. 테마 시스템 (Dark 테마)
4. 문서화 (API 문서, Storybook)
