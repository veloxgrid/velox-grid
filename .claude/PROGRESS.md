# VeloxGrid 작업 진행 상황

> 마지막 업데이트: 2025-02-12 (Phase 17 완료)

---

## 📊 프로젝트 현황

### 기본 정보
- **프로젝트명**: VeloxGrid
- **설명**: 빠르고 가벼운 Framework Agnostic 데이터 그리드 라이브러리
- **현재 버전**: v0.11.0
- **라이선스**: MIT
- **🌐 Live Demo**: https://bart-idea.github.io/velox-grid/

### 빌드 정보
- **번들 크기**: 100.20KB (gzip 24.69KB)
- **VeloxGrid.ts**: ~3,148줄
- **Core 모듈**: 11개
- **CSS 모듈**: 12개

### 프로젝트 구조
```
velox-grid/
├── README.md            # 프로젝트 소개 및 API 문서 (한글)
├── CHANGELOG.md         # 버전 변경 이력 (한글)
├── package.json         # NPM 패키지 정보
├── .claude/             # Claude AI 작업 파일
│   ├── PROGRESS.md     # 이 문서 - 개발 진행 상황
│   └── RULES.md        # 개발 규칙 및 작업 가이드
├── dist/               # 빌드 출력
│   ├── react/         # React 래퍼 빌드
│   └── vue/           # Vue 래퍼 빌드
├── docs/               # GitHub Pages 배포용
├── examples/           # 데모 페이지
├── tests/              # 단위 테스트 (Vitest)
└── src/
    ├── core/          # 핵심 모듈 (11개)
    ├── react/         # React 래퍼 (Phase 17)
    ├── vue/           # Vue 3 래퍼 (Phase 17)
    ├── styles/        # CSS 모듈 (12개)
    ├── types/         # TypeScript 타입
    └── utils/         # 유틸리티
```

---

## 🎯 현재 상태

### 완료된 기능 (Phase 1-13)

#### Phase 1-4: 핵심 기능 (v0.1.0)
- ✅ 테이블 렌더링, 컬럼 정의
- ✅ 행 선택, 다중 선택
- ✅ 컬럼 정렬, 데이터 필터링
- ✅ 인라인 편집

#### Phase 5-6: 고급 기능 (v0.2.0)
- ✅ 가상 스크롤 (100,000+ 행)
- ✅ 컬럼 고정, 헤더 필터 UI

#### Phase 7: Selection 고도화 (v0.3.0)
- ✅ Cell/Block Selection
- ✅ CheckBar 분리, Exclusive Check
- ✅ Keyboard Navigation, Clipboard
- ✅ Loading State, Auto Fit Column

#### Phase 8: Excel Export/Import (v0.4.0)
- ✅ Excel/CSV/JSON Export/Import

#### Phase 9: 키보드 & Undo/Redo (v0.5.0)
- ✅ Enter/Tab 이동, Delete Key
- ✅ Undo/Redo (Ctrl+Z/Y)

#### Phase 10-11: 컬럼/행 기능 (v0.6.0)
- ✅ Column Reorder, Menu, Fix/Unfix
- ✅ Row Drag & Drop

#### Phase 12: 셀 기능 확장 (v0.7.0)
- ✅ Cell Validation
- ✅ Custom Cell Editor
- ✅ Cell Tooltip

#### Phase 13: Summary/Aggregation (v0.7.1)
- ✅ GridSummary 모듈
- ✅ Footer Summary 렌더링
- ✅ 5가지 내장 함수 (sum, avg, count, min, max)
- ✅ 커스텀 함수 지원
- ✅ Map 기반 캐싱
- ✅ 자동 업데이트

#### Phase 14: Fixed Columns (v0.8.0)
- ✅ fixedOptions API (colCount, rightCount)
- ✅ 특수 컬럼 자동 처리
- ✅ Fixed Left/Right 렌더링
- ✅ 스크롤 동기화
- ✅ 데모 페이지 (4가지 시나리오)

#### Phase 14.1: Special Column Display Order (v0.8.1)
- ✅ displayOrder 옵션 추가
- ✅ CheckBar.displayOrder
- ✅ RowNumbersOptions with displayOrder
- ✅ RowDragOptions with displayOrder
- ✅ 특수 컬럼 정렬 로직 구현
- ✅ 데모 페이지 (4가지 시나리오)

#### Phase 15: Row State Management (v0.9.0)
- ✅ RowState 타입 정의 (none, created, updated, deleted, createAndDeleted)
- ✅ GridState.rowStates Map 추가
- ✅ addRow/updateRow/removeRow/setCellValue 자동 상태 관리
- ✅ getChanges() API (created, updated, deleted 분리)
- ✅ commit() 메서드 (변경사항 확정)
- ✅ clearRowStates() 메서드
- ✅ 데모 페이지 (statistics, visual indicators)

#### Phase 15.1: Keyboard Enhancement (v0.9.1)
- ✅ Quick Edit (바로 타이핑으로 편집 시작)
- ✅ Enter/Shift+Enter (아래/위로 이동)
- ✅ Tab/Shift+Tab (오른쪽/왼쪽으로 이동)
- ✅ 모든 Editor 타입에서 키보드 동작 통일
- ✅ 데모 페이지 (3가지 시나리오)

#### Phase 18: Server-Side Data & Pagination (v0.10.0)
- ✅ DataSource 옵션 (`local` / `remote`)
- ✅ Remote fetch (정렬/필터/페이징 파라미터 자동 전달)
- ✅ Pagination UI (페이지 네비게이션 바)
- ✅ 페이지 정보 표시, 페이지 크기 변경 셀렉터
- ✅ Local Pagination (클라이언트 데이터 페이지 분할)
- ✅ API: goToPage(), setPageSize(), fetchData(), getPaginationState()
- ✅ 이벤트: onPageChange, onPageSizeChange
- ✅ Infinite Scroll 모드 (local/remote, 자동 다음 페이지 로드)
- ✅ CSS 모듈: _pagination.css
- ✅ 데모 페이지 (3가지 시나리오: Local, Remote, PageSizeChanger)

#### Phase 17: Framework Wrappers (v0.11.0)
- ✅ React: VeloxGridReact 컴포넌트 (forwardRef, useImperativeHandle)
- ✅ React: useVeloxGrid Hook (containerRef + grid + isReady)
- ✅ Vue 3: VeloxGridVue SFC (script setup, defineExpose)
- ✅ Vue 3: useVeloxGrid Composable (containerRef + grid ref)
- ✅ Pass-through 패턴 (코어 확장 시 래퍼 수정 불필요)
- ✅ 이벤트 프록시 (항상 최신 콜백 참조)
- ✅ 별도 빌드 설정 (vite.config.react.ts, vite.config.vue.ts)
- ✅ package.json exports (velox-grid/react, velox-grid/vue, velox-grid/css)
- ✅ 데모 페이지

### 계획된 기능 (Phase 16~25)

> 아래 Phase 번호는 기존 완료된 Phase 15.1 이후로 순차 배정

#### 🔴 v1.0 이전 필수 (높은 우선순위)

**Phase 16: 단위 테스트 도입** ✅ 완료
- [x] Vitest 환경 설정 (vitest.config.ts, jsdom, setup.ts)
- [x] 데이터 유틸리티 테스트 (sortData, filterData, matchesFilter, compareValues, formatValue, parseValue, deepClone)
- [x] GridHistory 테스트 (Undo/Redo 스택, maxSize, enabled, 헬퍼 메서드)
- [x] GridValidator 테스트 (required, min/max, minLength/maxLength, pattern, custom, validateRow, validateAll)
- [x] GridSummary 테스트 (sum/avg/count/min/max, 캐시, 빈 데이터, null 처리, 커스텀 함수)
- [x] VeloxGrid 통합 테스트 (CRUD, Row State 전이, Sort/Filter, Selection, CheckBar, Pagination, Fixed Columns, Column 관리)
- [ ] CI 연동 (GitHub Actions) - 추후 진행

**Phase 17: Framework Wrappers (React + Vue)** ✅ 완료 (v0.11.0)
- [x] 공통 래퍼 인터페이스 설계 (Props, Events, Ref 패턴)
- [x] 빌드 구조 분리 (`velox-grid/react`, `velox-grid/vue`)
- [x] React Component (`<VeloxGridReact />`) - forwardRef + useImperativeHandle
- [x] React Hook (`useVeloxGrid`) - containerRef + grid + isReady
- [x] Vue 3 Component (`<VeloxGridVue />`) - script setup + defineExpose
- [x] Vue 3 Composable (`useVeloxGrid`) - containerRef + grid ref + isReady
- [x] TypeScript 타입 지원 (VeloxGridReactRef, VeloxGridVueEmits 등)
- [x] 데모 페이지 (React + Vue 코드 예시 + 시뮬레이션)
- [x] package.json exports (velox-grid/react, velox-grid/vue, velox-grid/css)
- [x] peerDependencies (react >=16.8, vue >=3.0, optional)

**Phase 18: Server-Side Data + Pagination** ✅ 완료 (v0.10.0)
- [x] DataSource 인터페이스 (`local` / `remote`)
- [x] Remote fetch (정렬/필터/페이징 파라미터)
- [x] Pagination UI (Footer 페이지 네비게이션)
- [x] Infinite Scroll 모드 (선택적) → ✅ 구현 완료
- [x] Loading State 통합

**Phase 19: Column Group (다단계 헤더)**
- [ ] ColumnGroup 타입 정의
- [ ] 2~3단계 헤더 렌더링
- [ ] 그룹 컬럼 리사이즈
- [ ] Fixed Column과 통합

**Phase 20: Cell Merge (셀 병합)**
- [ ] rowSpan / colSpan 기반 병합
- [ ] 자동 병합 (동일 값 인접 행)
- [ ] 수동 병합 API
- [ ] 가상 스크롤과 통합

#### 🟡 v1.0 안정화 (중간 우선순위)

**Phase 21: 접근성 (A11y) 기본 적용**
- [ ] ARIA 역할 (`role="grid"`, `role="row"`, `role="gridcell"`)
- [ ] ARIA 상태 (`aria-selected`, `aria-sort`, `aria-readonly`)
- [ ] 포커스 관리 (tabIndex, focus trap)
- [ ] 스크린 리더 기본 지원
- [ ] 고대비 모드

**Phase 22: Conditional Formatting (조건부 서식)**
- [ ] 선언적 조건부 서식 API
- [ ] 내장 프리셋 (colorScale, dataBar, iconSet)
- [ ] 셀 스타일 동적 적용
- [ ] 숫자 음수 빨간색 등 일반 시나리오

**Phase 23: 국제화 (i18n) 기본 구조**
- [ ] Locale 설정 인터페이스
- [ ] 내장 텍스트 외부화 (emptyMessage, loading, filter 레이블 등)
- [ ] 한글/영어 기본 locale
- [ ] 커스텀 locale 등록 API

**Phase 24: Row Grouping (행 그룹화)**
- [ ] 필드 기준 행 그룹화
- [ ] 접기/펼치기
- [ ] Group Summary (그룹별 소계)
- [ ] 다단계 그룹
- [ ] Sub-total rows

**Phase 25: 필터 고도화**
- [ ] 다중 조건 필터 (AND/OR 조합)
- [ ] 날짜 범위 필터 (from ~ to)
- [ ] 숫자 범위 필터 (이상/이하/사이)
- [ ] 필터 프리셋 저장/불러오기

#### 🟢 v1.0 릴리스 및 이후 (낮은 우선순위)

**Phase 26: 플러그인 아키텍처 / Tree-Shakable 구조**
> 번들 크기가 100KB를 넘기 전에 핵심/확장 기능을 분리하는 구조적 전환 필요

- [ ] 핵심 모듈(Core) 정의: 렌더링, 선택, 정렬, 필터, 편집, 가상 스크롤
- [ ] 확장 모듈(Plugin) 분리 대상:
  - Excel Export/Import → `velox-grid/excel`
  - Summary/Aggregation → `velox-grid/summary`
  - Validation → `velox-grid/validation`
  - Row Grouping → `velox-grid/grouping`
  - Cell Merge → `velox-grid/merge`
- [ ] 플러그인 등록 API 설계:
  ```typescript
  import { VeloxGrid } from 'velox-grid';
  import { ExcelPlugin } from 'velox-grid/excel';
  import { SummaryPlugin } from 'velox-grid/summary';
  
  VeloxGrid.use(ExcelPlugin);
  VeloxGrid.use(SummaryPlugin);
  ```
- [ ] 빌드 설정 분리 (각 플러그인 별도 엔트리 포인트)
- [ ] Core만 import 시 번들 크기 목표: ~50KB (gzip ~13KB)
- [ ] 기존 올인원 빌드도 유지 (`velox-grid/all`)

**도입 시점 판단 기준**:
- UMD 번들이 **120KB를 초과**하면 즉시 착수
- Phase 20(Cell Merge) 완료 후 자연스럽게 전환 권장
- 기존 사용자의 import 방식에 breaking change 최소화

**v1.0 안정화 작업**
- [ ] API 문서 사이트 (TypeDoc 또는 별도 문서)
- [ ] 테마 시스템 (Dark, Compact, Material)
- [ ] 성능 벤치마크
- [ ] 번들 크기 최적화 (Tree-shakable 플러그인 구조)

**v2.0+ 장기 비전**
- [ ] Row Detail (행 확장/상세)
- [ ] 차트 통합 (인라인 차트, 스파크라인)
- [ ] 수식 지원 (Excel-like)
- [ ] 실시간 데이터 (WebSocket)
- [ ] 모바일 터치 최적화
- [ ] 플러그인 시스템

#### 📋 Phase 우선순위 요약

| 순서 | Phase | 기능 | 난이도 | 번들 영향 |
|------|-------|------|--------|-----------|
| 1 | **16** | 단위 테스트 (Vitest) | 중 | 없음 |
| 2 | **17** | Framework Wrappers (React + Vue) | 중 | 각 별도 ~10KB |
| 3 | **18** | Server-Side Data + Pagination | 중~높 | +5~8KB |
| 4 | **19** | Column Group (다단계 헤더) | 높 | +5~7KB |
| 5 | **20** | Cell Merge (셀 병합) | 높 | +3~5KB |
| 6 | **21** | 접근성 (A11y) | 낮~중 | +1~2KB |
| 7 | **22** | Conditional Formatting | 중 | +2~3KB |
| 8 | **23** | i18n 기본 구조 | 낮 | +1~2KB |
| 9 | **24** | Row Grouping | 높 | +8~12KB |
| 10 | **25** | 필터 고도화 | 중 | +3~5KB |
| 11 | **26** | 플러그인 아키텍처 (Tree-Shakable) | 높 | Core ~50KB 목표 |

---

## 📋 최근 작업 이력 (최신순)

### 📦 Phase 16: 단위 테스트 도입 (Vitest) 완료 (2025-02-11)

**테스트 프레임워크**: Vitest 1.6.1 + jsdom + @vitest/coverage-v8
**테스트 결과**: 155/155 통과 (2.4초)

#### 구현 내용

**1. 환경 구성**:
- `vitest.config.ts`: jsdom 환경, path alias, coverage 설정 (v8 provider)
- `tests/setup.ts`: CSS.supports, requestAnimationFrame, ResizeObserver polyfill
- `tsconfig.json`: tests 폴더 exclude 추가

**2. 테스트 스위트 (5개 파일)**:
- `tests/data-utils.test.ts` (44 tests) - deepClone, generateId, formatValue, parseValue, compareValues, sortData, matchesFilter, filterData
- `tests/grid-history.test.ts` (17 tests) - push/pop, maxSize, enabled, 헬퍼 메서드, clear, 연속 undo/redo
- `tests/grid-validator.test.ts` (24 tests) - required, min/max, minLength/maxLength, pattern, custom, 다중 규칙, validateRow, validateAll
- `tests/grid-summary.test.ts` (17 tests) - sum/avg/count/min/max, 빈 데이터, null, 캐시, 커스텀 함수
- `tests/velox-grid.test.ts` (53 tests) - CRUD, Row State 전이, Sort/Filter, Fixed Columns, Column 관리, Selection, CheckBar, Pagination, Lifecycle

**3. 커버리지 영역**:
- 데이터 유틸리티 (12개 함수)
- GridHistory (Undo/Redo 스택, maxSize, enabled)
- GridValidator (6종 규칙 + 행/전체 검증)
- GridSummary (5종 집계 + 캐시 + 엣지 케이스)
- VeloxGrid 통합 API (Row State FSM, CRUD, Sort, Filter, Selection, CheckBar, Pagination, Fixed Columns)

**수정 파일**:
- `vitest.config.ts` (신규)
- `tests/setup.ts` (신규)
- `tests/data-utils.test.ts` (신규)
- `tests/grid-history.test.ts` (신규)
- `tests/grid-validator.test.ts` (신규)
- `tests/grid-summary.test.ts` (신규)
- `tests/velox-grid.test.ts` (신규)
- `tsconfig.json`: tests exclude 추가

**Git**: 커밋 예정

---

### ✨ Phase 18: Server-Side Data & Pagination 완료 (2025-02-09)

**버전**: v0.10.0  
**번들 크기**: UMD 100.20 KB (gzip: 24.69 KB), ESM 139.67 KB, CSS 21.61 KB

#### 구현 내용

**1. 타입 정의** (`src/types/index.ts`):
- `DataSourceOptions`: `local` / `remote` 데이터 소스 타입
- `DataRequestParams`: 서버 요청 파라미터 (page, pageSize, sort, filter)
- `DataResponseResult`: 서버 응답 (data, totalCount)
- `PaginationState`: 페이지네이션 상태 (currentPage, pageSize, totalCount, totalPages, loading)
- `PaginationOptions`: 페이지네이션 옵션 (enabled, pageSize, pageSizeOptions, maxPageButtons, showInfo, showSizeChanger)
- `GridOptions.dataSource`, `GridOptions.pagination` 추가
- `GridEvents.onPageChange`, `GridEvents.onPageSizeChange` 추가
- `GridState.pagination` 추가
- `GridContext.goToPage()`, `setPageSize()`, `getPaginationState()`, `fetchData()`, `isRemoteDataSource()` 추가

**2. 핵심 로직** (`src/core/VeloxGrid.ts`):
- `state.pagination` 초기화 (생성자)
- `isRemoteDataSource()`: remote 모드 판별
- `goToPage(page)`: 페이지 이동 (local/remote 자동 분기)
- `setPageSize(pageSize)`: 페이지 크기 변경
- `fetchData()`: 서버 데이터 요청 (loading 상태 관리, row state 초기화)
- `applyLocalPagination()`: 로컬 데이터 sort/filter 후 페이지 슬라이싱
- `applyDataTransformations()`: pagination 활성화 시 별도 분기 (remote → fetchData, local → applyLocalPagination)
- `setData()`: local pagination 시 totalCount 자동 업데이트
- 정렬 시 remote 모드 분기 (render 스킵, fetchData 내에서 처리)
- 생성자에서 초기 데이터 로드 (remote: fetchData 호출, local: applyLocalPagination)

**3. Pagination UI** (`src/core/VeloxGrid.ts`):
- `renderPagination()`: 페이지 네비게이션 바 렌더링
  - 좌측: 페이지 정보 ("1-20 / 500")
  - 중앙: 처음/이전/페이지번호/다음/마지막 버튼 + 말줄임표
  - 우측: 페이지 크기 셀렉터 (optional)
- `createPageButton()`: 버튼 생성 헬퍼
- `paginationContainer` DOM 요소 (wrapper 아래에 위치)
- `render()` 호출 시 자동으로 pagination UI 갱신

**5. Infinite Scroll** (`src/core/VeloxGrid.ts`):
- `PaginationOptions.mode`: `'page'` (기본) / `'infinite'` 모드
- `checkInfiniteScroll()`: 스크롤 바닥 감지 (threshold 기반)
- `loadNextPage()`: 다음 페이지 데이터 로드 (remote: fetch append, local: slice 확장)
- `applyLocalInfiniteScroll()`: 로컬 데이터 누적 슬라이싱
- `renderInfiniteScrollStatus()`: "Loading..." / "All N items loaded" 상태 표시
- `infiniteScrollThreshold` 옵션 (바닥 여유 px, 기본 100)
- sort/filter 변경 시 infinite scroll 상태 자동 리셋

**4. CSS** (`src/styles/_pagination.css`):
- `.velox-pagination`: flexbox 레이아웃, 좌/중/우 정렬
- `.velox-pagination-btn`: 호버/active/disabled 스타일
- `.velox-pagination-select`: 페이지 크기 셀렉터
- CSS Variables 활용 (primary-color, border-color, hover-bg 등)

**데모 페이지** (`examples/phase18-pagination-demo.html`):
1. Local Pagination: 500건 클라이언트 데이터, Add/Remove Row
2. Remote Pagination: 1000건 Mock API, 서버 측 sort/filter, 페이지 크기 변경
3. Page Size Changer: 다양한 크기 옵션 (5/10/25/50/100)
4. Infinite Scroll Local: 500건, 50건씩 자동 로드
5. Infinite Scroll Remote: 1000건 Mock API, 30건씩 자동 로드

**번들 크기 변화**:
- UMD: 92.19 KB → 100.20 KB (+8.01 KB)
- ESM: 132.98 KB → 139.67 KB (+6.69 KB)
- CSS: 19.52 KB → 21.61 KB (+2.09 KB)
- gzip: 22.86 KB → 24.69 KB (+1.83 KB)

**수정 파일**:
- `src/types/index.ts`: Phase 18 타입 정의 추가
- `src/core/VeloxGrid.ts`: Pagination 로직 + UI 렌더링
- `src/styles/_pagination.css`: 신규 CSS 모듈
- `src/styles/velox-grid.css`: _pagination.css import 추가
- `examples/phase18-pagination-demo.html`: 데모 페이지
- `package.json`: v0.10.0
- `src/index.ts`: v0.10.0

**Git**: 커밋 예정

### ✨ Phase 15.1: Keyboard Enhancement 완료 (2025-02-09)

**버전**: v0.9.1  
**번들 크기**: UMD 91.56 KB (gzip: 22.74 KB), ESM 128.25 KB

#### 구현 내용

**1. Quick Edit (바로 타이핑으로 편집 시작)**:
- 셀 선택 후 바로 타이핑하면 편집 모드 진입
- 기존 값 자동 지우기
- Excel/Google Sheets 스타일 편집

**구현 위치**: `VeloxGrid.ts` - `handleKeyDown()` 메서드
```typescript
// Phase 15.1: Quick Edit - typing starts editing immediately
if (!this.state.edit.editing && this.options.editable && focusedCell) {
  const column = this.state.columns.find(c => c.field === focusedCell.field);
  
  if (column?.editable !== false && 
      e.key.length === 1 && 
      !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    this.startEdit(focusedCell.rowIndex, focusedCell.field);
    
    setTimeout(() => {
      const input = document.querySelector('.velox-edit-input') as HTMLInputElement;
      if (input) {
        input.value = e.key;
        input.setSelectionRange(1, 1);
      }
    }, 0);
    
    return;
  }
}
```

**2. Enter/Tab 키 동작 통일**:
모든 Custom Editor에서 일관된 키보드 동작 제공

| 키 | 동작 |
|---|---|
| Enter | 저장 + 아래로 이동 |
| Shift+Enter | 저장 + 위로 이동 |
| Tab | 저장 + 오른쪽 이동 |
| Shift+Tab | 저장 + 왼쪽 이동 |
| Escape | 취소 + 편집 종료 |

**구현 위치**: `GridEditorFactory.ts` - 모든 editor 메서드

**3. stopPropagation 추가**:
Editor 내부에서 키 이벤트가 Grid로 전파되지 않도록 차단
```typescript
e.preventDefault();
e.stopPropagation();  // Phase 15.1
```

**4. onMove 콜백**:
Editor에서 저장 후 이동 방향을 Grid에 전달
```typescript
GridEditorFactory.createEditor(
  value,
  column.editor,
  (newValue) => { /* save */ },
  () => { /* cancel */ },
  (direction: 'up' | 'down' | 'left' | 'right') => {
    this.endEditAndMove(direction);  // Phase 15.1
  }
);
```

**데모 페이지** (`examples/phase15-1-keyboard-demo.html`):
1. Quick Edit (바로 타이핑)
2. Enter/Tab Navigation
3. Custom Editors with Keyboard

**번들 크기 변화**:
- UMD: 91.56 KB (이전: 91.56 KB, 변화 없음)
- ESM: 128.25 KB (이전: 128.25 KB, 변화 없음)  
- gzip: 22.74 KB (이전: 22.74 KB, 변화 없음)
- 코드 최적화로 크기 증가 없음

**수정 파일**:
- `src/core/GridEditorFactory.ts`: Enter/Tab/Escape 키 처리 통일, onMove 콜백 추가
- `src/core/VeloxGrid.ts`: Quick Edit 기능 추가, renderEditCell에 onMove 연결
- `package.json`: v0.9.1
- `src/index.ts`: v0.9.1

**Git**: ✅ 커밋 완료 (commit: 89fca2b)

### 🔧 Phase 15.1 후속: 키보드 네비게이션 버그 수정 (2025-02-09)

**버전**: v0.9.1 (유지)  
**이슈**: Enter 키 편집 종료 미동작, Tab 키 Read 모드 미지원, Focus 손실

#### 수정 내용

**1. Enter 키 편집 종료 문제 해결**:

**문제**: Cell 모드에서 Enter 키를 눌러도 편집이 종료되지 않음

**원인**: 기본 input editor에서 `endEdit(true)` 호출 후 `endEditAndMove()` 호출
```typescript
// ❌ 잘못된 순서
this.endEdit(true);              // state.edit = null
this.endEditAndMove('down');     // state.edit.rowIndex는 이미 null!
```

**해결**: `endEditAndMove`만 호출 (내부적으로 endEdit 호출)
```typescript
// ✅ 올바른 순서
this.endEditAndMove(e.shiftKey ? 'up' : 'down');  // 내부에서 endEdit 호출
```

**2. Tab 키 Read 모드 지원 추가**:

**문제**: 편집 모드가 아닐 때 Tab 키가 동작하지 않음

**원인**: `handleKeyDown`의 read 모드 키보드 네비게이션에 Tab 케이스 누락

**해결**: Tab/Shift+Tab 케이스 추가 (행 래핑 지원)
```typescript
case 'Tab':
  if (e.shiftKey) {
    // 왼쪽 이동 (이전 행 끝으로 래핑)
    if (newColIndex > 0) { newColIndex--; }
    else if (newRowIndex > 0) { newRowIndex--; newColIndex = columns.length - 1; }
  } else {
    // 오른쪽 이동 (다음 행 시작으로 래핑)
    if (newColIndex < columns.length - 1) { newColIndex++; }
    else if (newRowIndex < this.state.displayData.length - 1) { newRowIndex++; newColIndex = 0; }
  }
  handled = true;
  break;
```

**3. Focus 복원 문제 해결**:

**문제**: Enter로 편집 종료 후 focus가 사라져서 방향키가 동작하지 않음

**원인**: `endEditAndMove` 후 grid에 focus 복원하지 않음

**해결**: `rootElement.focus()` 추가
```typescript
private endEditAndMove(direction: 'up' | 'down' | 'left' | 'right'): void {
  // ... 이동 로직
  this.render();
  this.rootElement.focus();  // ✅ Focus 복원
}
```

**4. Shift+Enter 지원 추가**:

**문제**: Edit 모드에서 Shift+Enter가 위로 이동하지 않음

**원인**: `handleKeyDown`에서 Shift 키 체크 누락

**해결**: Shift 키 체크 추가
```typescript
// Edit 모드
else if (e.key === 'Enter') {
  e.preventDefault();
  this.endEditAndMove(e.shiftKey ? 'up' : 'down');  // ✅ Shift 지원
}
```

#### 키보드 네비게이션 일관성

**Edit 모드** (편집 중):
- ✅ Enter: 저장 + 아래로 이동
- ✅ Shift+Enter: 저장 + 위로 이동
- ✅ Tab: 저장 + 오른쪽 이동
- ✅ Shift+Tab: 저장 + 왼쪽 이동
- ✅ Escape: 편집 취소

**Read 모드** (읽기 전용):
- ✅ ArrowUp/Down/Left/Right: 셀 이동
- ✅ Tab: 오른쪽 이동 (행 래핑)
- ✅ Shift+Tab: 왼쪽 이동 (행 래핑)
- ✅ Enter/F2: 편집 시작
- ✅ Space: 체크박스 토글 (checkBar 활성화 시)

**Custom Editors**:
- ✅ 모든 에디터: Enter/Tab with Shift 지원 (onMove 콜백)
- ✅ Checkbox 에디터: 토글 후 편집 모드 유지

**테스트 파일**:
- `examples/test-enter-key.html`: Enter 키 동작 검증
- `examples/test-cell-mode.html`: Cell 모드 키보드 네비게이션
- `examples/test-debug.html`: IIFE 빌드 디버깅

**수정 파일**:
- `src/core/VeloxGrid.ts`: 
  - renderEditCell input keydown 핸들러 수정
  - handleKeyDown Edit 모드 Shift+Enter 지원
  - handleKeyDown Read 모드 Tab 케이스 추가
  - endEditAndMove focus 복원 추가

**번들 크기**: 변화 없음 (UMD: 91.56 KB, gzip: 22.74 KB)

**Git**: 다음 커밋 예정

### ✨ Phase 15: Row State Management 완료 (2025-02-06)

**버전**: v0.9.0  
**번들 크기**: 빌드 후 확인 예정

#### 구현 내용

**RowState 타입 정의**:
RealGrid 스타일의 행 상태 추적 기능 추가

```typescript
type RowStateType = 'none' | 'created' | 'updated' | 'deleted' | 'createAndDeleted';

interface GridState {
  // ... 기존 필드
  rowStates: Map<RowData, RowStateType>; // Phase 15
}
```

**상태 전이 로직**:
- `addRow()`: 새 행 → 'created'
- `updateRow()`: 'none' → 'updated' (created는 유지)
- `removeRow()`: 'created' → 'createAndDeleted', 기타 → 'deleted'
- `setCellValue()`: 셀 수정 시 'none' → 'updated'
- `setData()`: 모든 행을 'none'으로 초기화

**Public API**:
```typescript
// 조회
getRowState(index: number): RowStateType
getRowStateByData(row: RowData): RowStateType
getChanges(): ChangesResult  // { created, updated, deleted }
getCreatedRows(): RowData[]
getUpdatedRows(): RowData[]
getDeletedRows(): RowData[]

// 수동 제어
setRowState(index: number, state: RowStateType): void
clearRowStates(): void  // 모두 'none'으로
commit(): void  // 변경사항 확정 (createAndDeleted 제거, 나머지 'none')
```

**ChangesResult 구조**:
```typescript
interface ChangesResult {
  created: RowData[];   // 새로 추가된 행
  updated: RowData[];   // 수정된 행
  deleted: RowData[];   // 삭제된 행
  // createAndDeleted는 제외 (서버 전송 불필요)
}
```

**자동 상태 관리**:
모든 데이터 변경 메서드에서 자동으로 RowState 업데이트:
- `addRow()`, `updateRow()`, `removeRow()`
- `setCellValue()`, `setData()`
- 편집 완료 시 (`endEdit()`)

**commit() 동작**:
1. `createAndDeleted` 행 완전 제거 (data 배열에서 삭제)
2. 나머지 모든 행을 'none'으로 초기화
3. 인덱스 재구성 및 렌더링

**데모 페이지** (`examples/phase15-row-state-demo.html`):
- 📊 Statistics Panel (created, updated, deleted, none 카운트)
- 🎮 Controls (Add, Update, Delete, Show Changes, Commit, Clear)
- 🎨 Visual Indicators (행 배경색으로 상태 표시)
  - Created: 연한 녹색 (#E8F5E9)
  - Updated: 연한 주황색 (#FFF3E0)
  - Deleted: 연한 빨강 + 취소선 (#FFEBEE)
  - None: 흰색

**사용 예시**:
```typescript
// 행 추가
grid.addRow({ name: 'New User', email: 'user@example.com' });
console.log(grid.getRowState(0)); // 'created'

// 행 수정
grid.updateRow(1, { salary: 85000 });
console.log(grid.getRowState(1)); // 'updated'

// 변경사항 확인
const changes = grid.getChanges();
console.log(changes.created.length);  // 1
console.log(changes.updated.length);  // 1

// 서버 저장 후 확정
await saveToServer(changes);
grid.commit();  // 모든 상태 초기화
```

**타입 Export**:
```typescript
export type {
  RowStateType,
  RowStateManager,
  ChangesResult,
}
```

**번들 크기 변화**: 빌드 후 확인 예정

**Git**: 다음 커밋에 포함 예정

---

### ✨ Phase 14.1: Special Column Display Order 완료 (2025-02-06)

**버전**: v0.8.1  
**번들 크기**: UMD 88.77 KB (gzip: 22.19 KB), ESM 123.68 KB

#### 구현 내용

**displayOrder 옵션 추가**:
특수 컬럼(CheckBar, RowNumbers, DragHandle)의 표시 순서를 제어할 수 있는 `displayOrder` 옵션 추가

**타입 정의**:
```typescript
interface CheckBarOptions {
  visible: boolean;
  displayOrder?: number;  // Phase 14.1
}

interface RowNumbersOptions {
  visible: boolean;
  displayOrder?: number;  // Phase 14.1
}

interface RowDragOptions {
  enabled: boolean;
  displayOrder?: number;  // Phase 14.1
}

interface GridOptions {
  showRowNumbers?: boolean | RowNumbersOptions;
  rowDraggable?: boolean | RowDragOptions;
  checkBar?: CheckBarOptions;
}
```

**기본 displayOrder 값**:
- DragHandle: 0 (가장 왼쪽)
- CheckBar: 10 (중간)
- RowNumbers: 20 (가장 오른쪽)

**사용 예시**:
```typescript
// 기본 순서 (DragHandle → CheckBar → RowNumbers)
{
  rowDraggable: true,
  checkBar: { visible: true },
  showRowNumbers: true,
}

// CheckBar를 가장 왼쪽에
{
  checkBar: { visible: true, displayOrder: 0 },
  showRowNumbers: { visible: true, displayOrder: 10 },
  rowDraggable: { enabled: true, displayOrder: 20 },
}

// RowNumbers를 가장 왼쪽에
{
  showRowNumbers: { visible: true, displayOrder: 0 },
  rowDraggable: { enabled: true, displayOrder: 10 },
  checkBar: { visible: true, displayOrder: 20 },
}
```

**코드 구현**:
- `getSpecialColumnsWithOrder()`: displayOrder에 따라 특수 컬럼을 정렬하여 반환
- `getFixedLeftColumns()`: 정렬된 특수 컬럼 + 고정 데이터 컬럼 반환
- `getScrollableColumns()`: 정렬된 특수 컬럼 (colCount = 0일 때) + 스크롤 가능 데이터 컬럼 반환

**Backward Compatibility**:
- `showRowNumbers: true` → `{ visible: true, displayOrder: 20 }` (기본값)
- `rowDraggable: true` → `{ enabled: true, displayOrder: 0 }` (기본값)
- `checkBar: { visible: true }` → displayOrder: 10 (기본값)

**데모 페이지** (`examples/phase14-1-display-order-demo.html`):
1. Default Order (displayOrder 미설정)
2. Custom Order: CheckBar 먼저
3. Custom Order: RowNumbers 먼저
4. Negative Order: 역순 배치

**번들 크기 변화**:
- UMD: 88.38 KB → 88.77 KB (+0.39 KB)
- ESM: 122.75 KB → 123.68 KB (+0.93 KB)
- gzip: 22.09 KB → 22.19 KB (+0.10 KB)

**Git**: 다음 커밋에 포함 예정

---

### 🔧 Phase 14: 틀고정 버그 수정 (2025-02-06)

**버전**: v0.8.0  
**번들 크기**: UMD 88.38 KB (gzip: 22.09 KB), ESM 122.75 KB

**수정 내용**:

#### 1. Left 틀고정 해제 후 재설정 시 DOM 재구성 버그

**문제**: Left 틀고정 → 해제 → 다시 Left 틀고정 시 Fixed Left 영역이 사라짐

**원인**: `setFixedOptions`에서 `rightCount` 변경만 체크하고 `colCount` 변경은 체크하지 않음

**해결**:
```typescript
const needsRebuild = 
  // Left fixed changes
  ((oldOptions.colCount || 0) === 0 && newOptions.colCount > 0) ||   // Left 추가
  ((oldOptions.colCount || 0) > 0 && newOptions.colCount === 0) ||   // Left 제거
  // Right fixed changes
  ((oldOptions.rightCount || 0) === 0 && newOptions.rightCount > 0) || // Right 추가
  ((oldOptions.rightCount || 0) > 0 && newOptions.rightCount === 0);   // Right 제거
```

#### 2. 특수 컬럼 사라지는 버그

**문제**: CheckBar와 DragHandle이 화면에서 사라짐

**원인**: `getFixedLeftColumns()`와 `getScrollableColumns()`에서 특수 컬럼을 `state.columns`에서 필터링하려 했으나, 특수 컬럼은 `state.columns`에 존재하지 않음

**해결**: 특수 컬럼을 옵션 기반으로 직접 생성하여 반환
```typescript
if (this.options.rowDraggable) {
  specialColumns.push({ field: '__drag', header: '', width: 44, visible: true });
}
if (this.options.checkBar?.visible) {
  specialColumns.push({ field: '__checkbox', header: '', width: 44, visible: true });
}
if (this.options.showRowNumbers) {
  specialColumns.push({ field: '__rownum', header: '#', width: 50, visible: true });
}
```

**테스트 시나리오**:
1. Left 틀고정 (colCount: 2) → Fixed Left 생성 ✅
2. 틀고정 해제 (colCount: 0) → Fixed Left 제거 ✅
3. 다시 Left 틀고정 (colCount: 2) → Fixed Left 재생성 ✅
4. 특수 컬럼 (CheckBar, DragHandle) 정상 표시 ✅

**Git**: 다음 커밋에 포함 예정

---

### 🔧 스크롤 동기화 버그 수정 (2025-02-05)

**문제점**:
1. 가로 스크롤 시 Header와 Body의 컬럼 정렬 불일치
2. 세로 스크롤 시 Fixed Right와 Body의 스크롤 싱크 불일치

**원인 분석**:

가로 스크롤 문제:
- 헤더는 `scrollbar-width: none`으로 스크롤바 숨김 처리
- 바디의 스크롤을 헤더에 반영하지만, 헤더 스크롤 이벤트는 리스닝하지 않음
- 결과: 헤더를 직접 스크롤해도 바디가 따라오지 않음

세로 스크롤 문제:
- `handleScroll`에서 Fixed Right와 Body 모두 `scrollTop` 설정
- 두 요소가 서로 스크롤 이벤트를 트리거하면서 무한 루프 발생
- 결과: 스크롤이 부자연스럽거나 싱크가 틀어짐

**해결 방법**:

1. **가로 스크롤 양방향 동기화**:
```typescript
// Header horizontal scroll handler
const handleHeaderScroll = throttle(() => {
  const scrollLeft = this.headerElement.scrollLeft;
  this.bodyElement.scrollLeft = scrollLeft;
  if (this.footerElement) {
    this.footerElement.scrollLeft = scrollLeft;
  }
}, 16);

this.headerElement.addEventListener('scroll', handleHeaderScroll);
```

2. **세로 스크롤 소스 추적 및 무한 루프 방지**:
```typescript
let isSyncing = false;
let throttleTimer: number | null = null;

const handleScroll = (source: 'body' | 'fixedRight') => {
  if (isSyncing) return;  // 동기화 중 재진입 방지
  
  // Custom throttle
  if (throttleTimer !== null) return;
  throttleTimer = window.setTimeout(() => { throttleTimer = null; }, 16);
  
  isSyncing = true;
  
  // 소스 요소에서 scrollTop 가져오기
  const scrollTop = source === 'fixedRight' 
    ? this.fixedRightBody!.scrollTop 
    : this.bodyElement.scrollTop;
  
  // 소스가 아닌 요소만 업데이트 (값 비교로 중복 방지)
  if (source !== 'fixedRight' && this.fixedRightBody 
      && this.fixedRightBody.scrollTop !== scrollTop) {
    this.fixedRightBody.scrollTop = scrollTop;
  }
  if (source !== 'body' && this.bodyElement.scrollTop !== scrollTop) {
    this.bodyElement.scrollTop = scrollTop;
  }
  
  isSyncing = false;
};

// 각 요소에 소스 정보와 함께 핸들러 등록
const fixedRightScrollHandler = () => handleScroll('fixedRight');
const bodyScrollHandler = () => handleScroll('body');
```

**핵심 개선사항**:
- 스크롤 이벤트 소스 추적으로 순환 참조 방지
- `isSyncing` 플래그로 동기화 중 재진입 차단
- 값 비교 (`scrollTop !== currentScrollTop`)로 불필요한 설정 제거
- 커스텀 throttle로 TypeScript 타입 이슈 해결

**번들 크기 변화**:
- UMD: 86.73 KB → 87.08 KB (+0.35 KB)
- ESM: 120.37 KB → 120.45 KB (+0.08 KB)
- gzip: 21.85 KB → 21.92 KB (+0.07 KB)

**Git**: 다음 커밋에 포함 예정

---

### ✨ Phase 14: Fixed Columns 완료 (2025-02-05)

**v0.8.0 릴리스**

#### 구현 내용

**FixedOptions API** (RealGrid 스타일):
```typescript
interface FixedOptions {
  colCount?: number;    // 왼쪽에서 N개 컬럼 고정
  rightCount?: number;  // 오른쪽에서 N개 컬럼 고정
}

// API 메서드
grid.setFixedOptions({ colCount: 2, rightCount: 1 });
const options = grid.getFixedOptions();
```

**컬럼 파티션 로직**:
- `getFixedLeftColumns()`: 특수 컬럼(CheckBar, RowNumbers, DragHandle) + fixedOptions.colCount 데이터 컬럼 반환
- `getFixedRightColumns()`: fixedOptions.rightCount 데이터 컬럼 반환
- `getScrollableColumns()`: 중앙 스크롤 가능 컬럼 반환
- `getDataColumns()`: 데이터 컬럼만 반환 (특수 컬럼 제외)
- `isSpecialColumn()`: 특수 컬럼 판별 헬퍼 메서드
- `hasFixedRight()`: Fixed Right 유무 확인

**특수 컬럼 처리**:
- CheckBar, RowNumbers, DragHandle은 **항상 왼쪽 고정**
- `fixedOptions.colCount`는 **데이터 컬럼만** 계산

**컬럼 배치 구조**:
```
[Fixed Left: Special + Data] [Scrollable] [Fixed Right: Data]
      ↑                          ↑                ↑
특수 컬럼 + colCount개      중앙 스크롤    rightCount개
```

예시 (총 10개 데이터 컬럼, fixedOptions: { colCount: 2, rightCount: 1 }):
```
[CheckBar][RowNum][Drag] [Col0][Col1] | [Col2]...[Col7] | [Col8][Col9]
        특수 컬럼            colCount:2    Scrollable(6개)   rightCount:2
```

**DOM 구조**:
- **Fixed Left**: fixedLeftContainer, fixedLeftHeader, fixedLeftBody, fixedLeftFooter
- **Scrollable**: headerElement, bodyElement, footerElement (메인 영역)
- **Fixed Right**: fixedRightContainer, fixedRightHeader, fixedRightBody, fixedRightFooter

**스크롤 동기화**:
- Fixed Left/Right의 세로 스크롤을 메인 body와 동기화
- throttle(16ms)로 부드러운 스크롤

**데모 페이지** (`examples/phase14-fixed-demo.html`):
1. Left Fixed (colCount만 사용)
2. Right Fixed (rightCount만 사용)
3. Both Fixed (colCount + rightCount)
4. With Special Columns (CheckBar + RowNumbers + Fixed)

**CSS 스타일** (`src/styles/_base.css`):
- `.velox-fixed-right` 컨테이너
- 좌측 border, box-shadow
- 스크롤 숨김 처리

**번들 크기 변화**:
- UMD: 80.71 KB → 84.30 KB (+3.59 KB)
- ESM: 111.12 KB → 116.75 KB (+5.63 KB)
- CSS: 17.76 KB → 18.32 KB (+0.56 KB)

**ColumnCache 구조**:
```typescript
interface ColumnCache {
  visible: ColumnDefinition[] | null;
  fixedLeft: ColumnDefinition[] | null;   // 특수 + 왼쪽 고정 데이터 컬럼
  scrollable: ColumnDefinition[] | null;  // 중앙 스크롤 컬럼
  fixedRight: ColumnDefinition[] | null;  // 오른쪽 고정 데이터 컬럼
  dirty: boolean;
}
```

**Breaking Change**:
- ❌ `ColumnDefinition.fixed` 속성 제거
- ✅ `GridOptions.fixedOptions` 사용 (RealGrid 스타일)

---

### 🔧 버그 수정 & UI 개선 (2025-02-05)

#### 1. Summary Cache Invalidation 버그 수정 ⚠️

**문제**: Checkbox editor에서 데이터 변경 시 summary cache가 무효화되지 않음

**해결**:
```typescript
// src/core/VeloxGrid.ts - renderEditCell() 메서드
this.summary.invalidateCache(); // ← 추가
```

**검증**: 모든 데이터 변경 시점(13개 메서드)에서 cache invalidation 정상 동작 확인

#### 2. showRowNumbers와 Fixed Left 분리

**변경 전**: Row numbers가 항상 fixed left 영역에 배치
**변경 후**: Row numbers가 scrollable 영역으로 이동

```
Before: [Drag][#][1] | Col1 Col2  (# 고정)
After:  [Drag]       | [#][1] Col1 Col2  (# 스크롤)
```

**수정 파일**:
- `src/core/VeloxGrid.ts`: `hasFixedLeft()` 수정
- `src/core/GridRenderer.ts`: header/body/footer 렌더링 수정

#### 3. rowDraggable 옵션 추가

**새 옵션**:
```typescript
interface GridOptions {
  rowDraggable?: boolean;  // default: false
}
```

**사용 예시**:
```typescript
// Row numbers만
{ showRowNumbers: true, rowDraggable: false }

// Drag handle만
{ showRowNumbers: false, rowDraggable: true }

// 둘 다
{ showRowNumbers: true, rowDraggable: true }
```

#### 4. Fixed Left Header Checkbox 정렬

**문제**: Header checkbox가 body와 정렬되지 않음

**해결**: Header에 invisible placeholder 추가
```
Before: Header: [✓] Col     (왼쪽으로 쏠림)
        Body:   [☰][✓] Data

After:  Header: [ ][✓] Col   (정렬됨!)
        Body:   [☰][✓] Data
```

#### 5. Sort 아이콘 우측 정렬

**변경**: Sort를 button으로 변경하고 우측 배치

```
Before: [⋮⋮] Column ↑ [filter] [menu]
After:  [⋮⋮] Column  [sort] [filter] [menu]
```

**수정 파일**:
- `src/core/GridRenderer.ts`: createHeaderCell() 수정
- `src/styles/_header.css`: .velox-sort-btn 스타일 추가

**Git**: `5b4ba43` - fix: summary cache invalidation and UI improvements

---

### ✨ Phase 13: Summary/Aggregation 완료 (2025-02-03)

**v0.7.1 릴리스**

#### 구현 내용

**GridSummary 모듈** (380줄):
- 5가지 내장 함수: sum, avg, count, min, max
- 커스텀 함수 지원
- Map 기반 캐싱으로 성능 최적화
- Number Formatting with Locale

**Footer Summary 렌더링**:
- Footer DOM 요소 (Fixed left + scrollable)
- GridRenderer.renderFooter() 메서드
- 자동 업데이트 (데이터 변경 감지)

**API**:
```typescript
getSummaryValue(field): CellValue
getSummaryValues(): Record<string, CellValue>
refreshSummary(): void
```

**타입 정의**:
- SummaryFunction, SummaryConfig
- FooterSummaryOptions, GroupSummaryOptions
- ColumnDefinition.summary
- GridOptions.footerSummary

**CSS**: `_footer.css` (139줄)
- Alignment, custom className 지원
- Dark theme 지원
- Special styles: --total, --average, --count

**번들 크기 변화**:
- UMD: 71.35 KB → 80.71 KB (+9.36 KB)
- ESM: 98.05 KB → 111.12 KB (+13.07 KB)
- CSS: 15.38 KB → 17.76 KB (+2.38 KB)

#### Summary Cache Invalidation

데이터 변경 시 자동 cache 무효화:
- setData(), clearData()
- addRow(), updateRow(), removeRow()
- setCellValue(), endEdit()
- paste(), cut(), deleteSelectedCells()
- undo(), redo()

---

### 🔧 Edit 모드 안정화 (2025-02-02)

**문제**: Edit 모드에서 예기치 않게 종료되는 버그

**해결 내용**:
1. Document mousedown으로 외부 클릭 감지
2. Checkbox editor 다중 클릭 지원
3. Document 리스너 중복 방지 (editModeCleanup)
4. 더블클릭 이벤트 처리
5. CheckBar 상태 변경 시 Edit 보존
6. Editor 타입별 중복 이벤트 제거

**Editor 타입별 동작**:

| Editor | 종료 시점 | Edit 모드 유지 |
|--------|----------|--------------|
| Text/Number/Date | blur / Enter | ❌ 즉시 종료 |
| Select | change / Enter | ❌ 즉시 종료 |
| Checkbox | 외부 클릭 | ✅ 계속 유지 |

**수정 파일**:
- `src/core/VeloxGrid.ts`
- `src/core/GridRenderer.ts`
- `src/core/GridEditorFactory.ts`

**개발 환경 개선**:
- `examples/dev.html`: 핫 리로드 지원
- `vite.config.ts`: 개발 서버 설정

---

### 📦 GitHub Pages 배포 설정 (2025-02-02)

**Live Demo**: https://bart-idea.github.io/velox-grid/

**구현 내용**:
1. 메인 랜딩 페이지 (`docs/index.html`)
2. 6개 데모 페이지 (selection, excel, keyboard, column, row, validation)
3. 빌드 스크립트 (`scripts/build-pages.js`)
4. GitHub Actions 자동 배포 (`.github/workflows/deploy.yml`)

**배포 방법**:
```bash
npm run build
npm run build:pages
git push origin main  # 자동 배포
```

---

## 🧹 코드 최적화 이력

### 미사용 모듈 삭제 (2025-02-02)

**삭제된 모듈** (9개, ~60KB):
- GridEventManager.ts, GridSelection.ts
- GridVirtualScroll.ts, GridEditor.ts
- GridKeyboard.ts, GridColumnManager.ts
- GridDataManager.ts, GridState.ts
- VeloxGrid.ts.backup

**결과**:
- 빌드 모듈: 22개 → 15개 (-7개)
- 번들 크기: 동일 (Tree-shaking 덕분)
- 빌드 속도: 향상

### 코드 구조 최적화 (2025-01-30 ~ 2025-02-02)

**Phase 1-7 완료**

**목표**: VeloxGrid.ts 모듈화로 유지보수성 향상

**작업 내용**:
1. GridContext 인터페이스 정의
2. VeloxGrid에 GridContext 구현
3. 모듈 생성자 수정
4. 메서드 위임
5. 중복 코드 정리
6. 최종 정리 및 테스트

**VeloxGrid.ts 변화**:
```
시작: 2,826줄
Phase 3-4: 2,501줄 (-325줄)
Phase 5-6: 2,100줄 (-726줄)
Phase 7: 2,044줄 (-782줄, 27.7% 감소) ✅
```

**현재 Core 모듈 구조**:
```
src/core/
├── VeloxGrid.ts         # Facade (2,044줄)
├── GridRenderer.ts      # 렌더링
├── GridFilterPopup.ts   # 필터
├── GridColumnMenu.ts    # 컬럼 메뉴
├── GridDragManager.ts   # 드래그
├── GridHistory.ts       # Undo/Redo
├── GridValidator.ts     # 검증
├── GridEditorFactory.ts # 에디터
├── GridTooltip.ts       # 툴팁
├── GridSummary.ts       # Summary
└── index.ts
```

---

## 🔮 다음 작업 계획

### 즉시 처리 (미커밋 작업)
- [ ] Phase 18 + Phase 16 Git 커밋 및 푸시

### Phase 17: Framework Wrappers (React + Vue)
**목표**: React/Vue 생태계에서 VeloxGrid를 쉽게 사용할 수 있도록 래퍼 제공

**작업 항목**:
1. 공통 래퍼 인터페이스 설계 (Props/Events/Ref 패턴 통일)
2. 빌드 구조 분리 (package.json exports, 각 프레임워크 별도 엔트리)
3. **React 래퍼** (`src/react/`):
   - `VeloxGridReact` 컴포넌트 (Props → GridOptions 매핑)
   - `useVeloxGrid` Hook (인스턴스 접근, 메서드 호출)
   - 이벤트 바인딩, Ref forwarding
4. **Vue 3 래퍼** (`src/vue/`):
   - `VeloxGrid` 컴포넌트 (Composition API, `<script setup>`)
   - `useVeloxGrid` Composable
   - Props/Emit 바인딩, defineExpose
5. 데모 페이지 (React + Vue 각각)
6. README에 React/Vue 사용법 추가

**선행 조건**: Phase 16 (테스트로 안정성 확보)
**예상 작업량**: 5~6일
**번들 영향**: 각 별도 패키지 ~10KB

### Phase 18: Server-Side Data + Pagination
**목표**: 서버에서 데이터를 가져오는 대규모 데이터 시나리오 지원

**작업 항목**:
1. `DataSourceOptions` 타입 정의 (`local` / `remote`)
2. `RemoteDataSource` 인터페이스 (`fetch`, `pageSize`, `totalCount`)
3. `FetchParams` 구조 (page, sort, filter 전달)
4. Pagination UI 컴포넌트 (Footer 하단 페이지 네비게이션)
5. 서버 정렬/필터 시 클라이언트 로직 우회
6. Loading 상태 자동 관리
7. Infinite Scroll 모드 (선택적)
8. 데모 페이지 (Mock API 서버)

**선행 조건**: Phase 16
**예상 작업량**: 4~5일
**번들 영향**: +5~8KB

---

## 📝 다음 대화 시작 방법

### 기능 개발
```
VeloxGrid 프로젝트를 진행할거야.
아래 문서를 확인하고 준비되면 알려줘.
* 작업 명세서: .claude 폴더 하위 PROGRESS.md, RULES.md 파일 참조
* 프로젝트 경로: D:\Dev\git\velox-grid
```

### 특정 Phase 시작
```
Phase 16 (단위 테스트 도입) 시작해줘
```

### 버그 수정
```
[버그 설명] 수정해줘
```

---

## 📚 문서 구조 가이드

이 문서는 다음과 같이 구성되어 있습니다:

1. **📊 프로젝트 현황**: 최신 상태 요약 (버전, 크기, 구조)
2. **🎯 현재 상태**: 완료/계획된 기능 목록 + 신규 로드맵
3. **📋 최근 작업 이력**: 시간 역순 상세 내역
4. **🧹 코드 최적화 이력**: 리팩토링 작업 기록
5. **🔮 다음 작업 계획**: Phase별 상세 작업 항목
6. **📝 다음 대화 시작 방법**: 컨텍스트 로딩 가이드

### 작업 분류

- **✨ 기능 개발**: 새로운 Phase 구현
- **🔧 버그 수정 & UI 개선**: 기존 기능 개선
- **🧹 코드 최적화**: 리팩토링, 정리
- **📦 인프라**: 빌드, 배포, 테스트, 도구

이 구조를 통해 AI가 현재 상황을 정확히 파악하고 적절한 작업을 제안할 수 있습니다.
