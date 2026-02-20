# 변경 이력

VeloxGrid의 모든 주요 변경사항은 이 파일에 문서화됩니다.

이 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [0.12.0] - 2025-02-19

### Added - Phase 19: Column Group (다단계 헤더)

#### 핵심 기능
- **GridColumnLayout 모듈 신규**: 레이아웃 파싱, 정규화, 헤더 매트릭스 생성 (630줄)
- **CSS Grid 기반 다단계 헤더**: 2단, 3단 이상 중첩 그룹 지원
- **hideChildHeaders**: 자식 컬럼 헤더 숨김 옵션
- **setColumnLayout / getColumnLayout / clearColumnLayout API**: 동적 레이아웃 변경
- **하위 호환**: 레이아웃 미설정 시 기존 flexbox 헤더 유지

#### 기존 기능 통합
- **Fixed Columns 통합**: 스크롤 영역에만 그룹 헤더 적용, 헤더 높이 동기화
- **그룹 헤더 리사이즈**: 그룹 헤더 오른쪽 드래그 시 그룹 내 마지막 leaf 컬럼 너비 조절
- **컬럼 이동 제한**: 같은 그룹 내에서만 이동 허용 + 레이아웃 순서 동기화
- **정렬/필터/컬럼 메뉴**: leaf 컬럼 헤더에서 기존과 동일하게 동작
- **React/Vue 래퍼**: 새 API 3개 노출 (setColumnLayout, getColumnLayout, clearColumnLayout)

#### 드래그 UX 개선
- **헤더 셀 직접 드래그**: 드래그 핸들(⋮⋮) 제거, 헤더 셀 자체를 드래그하여 컬럼 이동
- **임계값 기반 드래그 판별**: 5px 이상 이동 시 드래그 시작, 미만이면 클릭으로 처리
- **그룹 헤더 드래그**: 그룹 헤더 드래그 시 그룹 전체가 최상위 레벨에서 이동
- **최상위 레벨 순서 변경**: 독립 컬럼 ↔ 그룹, 그룹 ↔ 그룹 간 순서 변경 지원

#### 데모
- `examples/phase19-column-group-demo.html`: 5개 시나리오
  1. 기본 2단 헤더
  2. 3단 중첩
  3. hideChildHeaders
  4. 동적 레이아웃 전환
  5. Fixed Columns + Column Group

### Fixed
- **헤더 정렬**: headerAlign 기본값을 column.align fallback 없이 `center`로 고정
- **헤더 정렬 렌더링**: flex:1 header-content 내부 justify-content가 align 클래스에 맞게 동작하도록 수정
- **그룹 헤더 padding**: grouped 헤더 셀의 padding을 일반 헤더와 동일하게 통일 (`0 4px` → `var(--velox-cell-padding)`)
- **컬럼 숨기기 헤더 미반영**: hideColumn/showColumn 시 columnLayout.invalidate() 호출 추가, parseColumnLayout에서 visible:false 컬럼을 노드 트리에서 제외
- **헤더/바디 가로 스크롤 어긋남**: 바디 세로 스크롤바 너비만큼 헤더 콘텐츠에 margin-right 보정

### Bundle Size
- IIFE: 117.12 KB (gzip: 28.36 KB)
- ESM: 164.20 KB (gzip: 37.04 KB)
- CSS: 23.60 KB (gzip: 4.13 KB)

## [0.11.0] - 2025-02-12

### Added - Phase 17: Framework Wrappers (React + Vue)

#### React 래퍼
- **VeloxGridReact 컴포넌트**: `forwardRef` + `useImperativeHandle`로 전체 API를 ref로 노출
- **useVeloxGrid Hook**: `containerRef` + `grid` 인스턴스 + `isReady` 상태 반환
- **Props 매핑**: `GridOptions`의 모든 옵션을 Props로 전달, `GridEvents`를 콜백 Props로 바인딩
- **이벤트 프록시**: 리렌더 시에도 항상 최신 콜백 참조 (eventsRef 패턴)
- **TypeScript 타입**: `VeloxGridReactProps`, `VeloxGridReactRef` 타입 제공

#### Vue 3 래퍼
- **VeloxGridVue SFC**: `script setup` + `defineExpose`로 전체 API를 template ref로 노출
- **useVeloxGrid Composable**: `containerRef` + `grid` ref + `isReady` ref 반환
- **이벤트 emit**: `GridEvents`를 kebab-case로 변환하여 emit (예: `onCellClick` → `@cell-click`)
- **TypeScript 타입**: `VeloxGridVueProps`, `VeloxGridVueEmits` 타입 제공

#### 빌드 구조
- **별도 빌드 설정**: `vite.config.react.ts`, `vite.config.vue.ts`
- **package.json exports**: `velox-grid/react`, `velox-grid/vue`, `velox-grid/css`
- **peerDependencies**: `react >=16.8`, `vue >=3.0` (모두 optional)
- **빌드 스크립트**: `build:react`, `build:vue`, `build:all`

#### 설계 원칙
- **Pass-through 패턴**: GridOptions 확장 시 래퍼 수정 불필요
- **코어 무수정**: `src/core/` 소스 변경 없음
- **data/columns/loading** prop 변경 시 자동 반영

### Fixed
- `VeloxGridInstance`에 Pagination 메서드 누락 수정 (`goToPage`, `setPageSize`, `getPaginationState`, `fetchData`)

### Bundle Size (Core - 변경 없음)
- UMD: 100.20 KB (gzip: 24.69 KB)
- ESM: 139.67 KB (gzip: 31.51 KB)

### React Wrapper
- ESM: 151.13 KB (gzip: 32.94 KB)
- CJS: 106.71 KB (gzip: 25.59 KB)

### Vue Wrapper
- ESM: 150.41 KB (gzip: 33.59 KB)
- CJS: 107.16 KB (gzip: 26.32 KB)

## [0.10.0] - 2025-02-09

### Added - Phase 18: Server-Side Data & Pagination
- **DataSource 옵션**: `local` / `remote` 데이터 소스 타입 지원
- **Remote 데이터**: 서버에서 페이지 단위로 데이터를 가져오는 `fetch` 함수 지원
- **Pagination UI**: 페이지 네비게이션 바 (처음/이전/다음/마지막, 페이지 번호)
- **페이지 정보 표시**: "1-20 / 500" 형식의 현재 위치 정보
- **페이지 크기 변경**: `showSizeChanger` 옵션으로 드롭다운 선택기 제공
- **Local Pagination**: 클라이언트 데이터를 페이지 단위로 분할 표시
- **Remote Pagination**: 서버 측 정렬/필터/페이징 자동 연동
- **API 메서드**: `goToPage()`, `setPageSize()`, `fetchData()`, `getPaginationState()`
- **이벤트**: `onPageChange`, `onPageSizeChange`
- **Infinite Scroll**: `mode: 'infinite'` - 스크롤 끝에 도달 시 다음 페이지 자동 로드
- **Infinite Scroll 옵션**: `infiniteScrollThreshold` (바닥 여유 px 설정)
- **CSS 모듈**: `_pagination.css` 추가

### Bundle Size
- UMD: 92.19 KB → 100.20 KB (+8.01 KB)
- ESM: 132.98 KB → 139.67 KB (+6.69 KB)
- CSS: 19.52 KB → 21.61 KB (+2.09 KB)
- gzip: 22.86 KB → 24.69 KB (+1.83 KB)

## [0.9.1] - 2025-02-09

### Added - Phase 15.1: Enhanced Keyboard Navigation
- **Quick Edit**: 셀 선택 후 바로 타이핑으로 편집 시작 (Excel 스타일)
- **Enter/Shift+Enter**: 저장 + 아래/위로 이동
- **Tab/Shift+Tab**: 저장 + 오른쪽/왼쪽으로 이동 (Edit 모드 & Read 모드)
- **onMove 콜백**: Custom Editor에서 이동 방향을 Grid에 전달

### Changed
- 모든 Custom Editor에서 키보드 동작 통일
- Editor 내부 키 이벤트에 `stopPropagation` 추가
- Read 모드 Tab 키 네비게이션 지원 (행 래핑 포함)

### Fixed - Phase 15.1 Follow-up
- **Enter 키 편집 종료**: Cell 모드에서 Enter 키가 편집을 종료하지 않던 문제 해결
  - 원인: `endEdit()` 후 `endEditAndMove()` 호출 시 state가 이미 초기화됨
  - 해결: `endEditAndMove()`만 호출 (내부적으로 endEdit 호출)
- **Tab 키 Read 모드**: 편집하지 않을 때 Tab 키가 동작하지 않던 문제 해결
  - handleKeyDown에 Tab/Shift+Tab 케이스 추가
  - 행 끝에서 다음/이전 행으로 래핑 지원
- **Focus 복원**: 편집 종료 후 focus가 사라져 방향키가 동작하지 않던 문제 해결
  - `endEditAndMove()` 후 `this.rootElement.focus()` 추가
- **Shift+Enter**: Edit 모드에서 Shift+Enter가 위로 이동하지 않던 문제 해결
  - handleKeyDown에 Shift 키 체크 추가

### Demo
- `examples/phase15-1-keyboard-demo.html`: 키보드 네비게이션 데모
- `examples/test-enter-key.html`: Enter 키 동작 검증
- `examples/test-cell-mode.html`: Cell 모드 테스트
- `examples/test-debug.html`: IIFE 빌드 디버깅

### Keyboard Navigation Summary
**Edit 모드** (편집 중):
- Enter: 저장 + 아래로 이동
- Shift+Enter: 저장 + 위로 이동
- Tab: 저장 + 오른쪽 이동
- Shift+Tab: 저장 + 왼쪽 이동
- Escape: 편집 취소

**Read 모드** (읽기 전용):
- ArrowUp/Down/Left/Right: 셀 이동
- Tab: 오른쪽 이동 (행 래핑)
- Shift+Tab: 왼쪽 이동 (행 래핑)
- Enter/F2: 편집 시작
- Space: 체크박스 토글

## [0.8.0] - 2025-02-05

### 추가 - Phase 14: Fixed Columns

#### RealGrid 스타일 Fixed Columns API
- **FixedOptions 인터페이스 추가**: `colCount`, `rightCount` 지원
- **fixedOptions API**: 왼쪽/오른쪽 컬럼 고정 설정
- **API 메서드**: `setFixedOptions()`, `getFixedOptions()`

#### 컬럼 파티션 로직
- **특수 컬럼 자동 처리**: CheckBar, RowNumbers, DragHandle은 항상 왼쪽 고정
- **getFixedLeftColumns()**: 특수 컬럼 + 왼쪽 고정 데이터 컬럼 반환
- **getFixedRightColumns()**: 오른쪽 고정 컬럼 반환
- **getScrollableColumns()**: 중앙 스크롤 가능 컬럼 반환
- **getDataColumns()**: 데이터 컬럼만 반환 (특수 컬럼 제외)
- **isSpecialColumn()**: 특수 컬럼 판별 헬퍼 메서드

#### Fixed Right 컨테이너
- **DOM 요소 추가**: `fixedRightContainer`, `fixedRightHeader`, `fixedRightBody`, `fixedRightBodyInner`, `fixedRightFooter`
- **GridRenderer 확장**: Fixed Right 영역 렌더링 지원
- **hasFixedRight()**: Fixed Right 유무 확인 메서드

#### 스크롤 동기화
- **세로 스크롤 동기화**: Fixed Left/Right의 scrollTop을 메인 body와 동기화
- **throttle(16ms)**: 부드러운 스크롤 성능 최적화

#### CSS 스타일링
- **_base.css 확장**: `.velox-fixed-right` 스타일 추가
- 좌측 border, box-shadow 스타일
- 스크롤 숨김 처리

#### 데모 페이지
- **examples/phase14-fixed-demo.html**: 4가지 시나리오 데모
  1. Left Fixed (colCount만 사용)
  2. Right Fixed (rightCount만 사용)
  3. Both Fixed (colCount + rightCount)
  4. With Special Columns (CheckBar + RowNumbers + Fixed)

### 번들 크기
- UMD: 84.30 KB (gzip: 21.31 KB) - 80.71 KB에서 +3.59 KB
- ESM: 116.75 KB (gzip: 26.58 KB) - 111.12 KB에서 +5.63 KB
- CSS: 18.32 KB (gzip: 3.48 KB) - 17.76 KB에서 +0.56 KB

### Breaking Changes
- **ColumnDefinition.fixed 제거**: 개별 컬럼의 `fixed` 속성 제거
- **GridOptions.fixedOptions 사용**: RealGrid 스타일의 통합 API로 전환

### 마이그레이션 가이드
```typescript
// 변경 전 (Phase 1-13)
columns: [
  { field: 'id', header: 'ID', fixed: 'left' },  // ❌
]

// 변경 후 (Phase 14)
columns: [
  { field: 'id', header: 'ID' },  // fixed 속성 제거
],
fixedOptions: {
  colCount: 1  // 첫 번째 데이터 컬럼 고정
}
```

---

## [0.7.1] - 2025-02-03

### 추가 - Phase 13: Summary/Aggregation

#### 기본 기능
- **GridSummary 모듈 추가** (380줄): 데이터 집계 핵심 모듈
- **5가지 내장 함수**: `sum`, `avg`, `count`, `min`, `max`
- **커스텀 함수 지원**: 사용자 정의 집계 함수
- **Map 기반 캐싱**: 효율적인 계산 및 성능 최적화
- **Number Formatting**: Locale 지원 숫자 포맷팅

#### Footer Summary 렌더링
- **Footer DOM 요소**: Fixed left 및 scrollable footer 지원
- **GridRenderer.renderFooter()**: Footer 행 렌더링 메서드
- **createFooterCell()**: Summary 셀 생성 및 포맷팅
- **자동 업데이트**: 데이터 변경 시 자동 재계산

#### API 메서드
- `getSummaryValue(field)`: 특정 필드의 집계값 조회
- `getSummaryValues()`: 모든 집계값을 객체로 반환
- `refreshSummary()`: 수동 집계 새로고침

#### 타입 정의
- `SummaryFunction`, `SummaryConfig`, `FooterSummaryOptions` 타입 추가
- `ColumnDefinition.summary`: 컴럼별 Summary 설정
- `GridOptions.footerSummary`: Footer Summary 옵션
- `GridContext`: Summary 메서드 추가

#### CSS 스타일링
- **_footer.css** 추가 (139줄): Footer Summary 전용 스타일
- Footer row, cell 기본 스타일링
- Alignment, custom className 지원
- Dark theme 지원
- Special styles: `velox-footer-cell--total`, `--average`, `--count`

#### 데모 페이지
- `examples/phase13-demo.html`: 3개 데모 시나리오
- `docs/demos/summary-demo.html`: Sales Analytics 대시보드 데모
- `docs/index.html`: Summary 데모 링크 추가

#### 문서화
- README.md: Summary API 및 사용 예제 추가
- TypeScript 타입 완전 문서화

### 번들 크기
- UMD: 80.71 KB (gzip: 20.76 KB) - 71.35 KB에서 증가
- ESM: 111.12 KB (gzip: 25.63 KB) - 98.05 KB에서 증가
- CSS: 17.76 KB (gzip: 3.45 KB) - 15.38 KB에서 증가

### 수정 - Edit 모드 안정화

#### 편집 중 셀 클릭 시 Edit 모드 유지
- 편집 중인 셀/input 클릭 시 edit 모드가 해제되던 문제 수정
- Document mousedown 이벤트로 외부 클릭 감지
- Cell 내부 클릭은 edit 모드 유지
- Interactive 요소(input, select, button, textarea) 클릭 시 기능 허용

#### Checkbox Editor 다중 클릭 지원
- Checkbox를 여러 번 클릭 시 edit 모드가 해제되던 문제 수정
- Checkbox editor는 change 시에도 edit 모드 유지
- 데이터 업데이트 후 edit 상태 복원 및 재렌더링
- 외부 클릭 시에만 edit 종료

#### Document 리스너 중복 방지
- `renderEditCell` 호출 시마다 document 리스너가 누적 등록되던 문제 수정
- `editModeCleanup` 변수로 이전 리스너 추적 및 정리
- 새 edit 시작 시 이전 리스너 자동 제거

#### 더블클릭 이벤트 처리
- 빠른 연속 클릭이 더블클릭으로 인식되어 edit 재시작되던 문제 수정
- 이미 editing 중인 셀의 더블클릭 무시
- `startEdit`에서 같은 셀 편집 중이면 무시

#### CheckBar 상태 변경 시 Edit 보존
- CheckBar의 checkbox 클릭 시 edit 모드가 해제되던 문제 수정
- `checkItem()` 호출 시 edit 상태 백업 및 복원
- Exclusive mode에서도 edit 상태 보존

#### Editor 타입별 중복 이벤트 제거
- Select editor: blur 이벤트 제거 (change와 중복)
- Checkbox editor: blur 이벤트 제거 (change와 중복)

### 개선 - 개발 환경

#### 핫 리로드 지원
- `examples/dev.html` 추가: 소스 파일 직접 import
- Vite HMR로 실시간 코드 변경 반영
- `vite.config.ts`: 개발 서버 기본 페이지를 dev.html로 변경

## [0.7.0] - 2025-01-29 ~ 2025-02-02

### 정리 - 코드 정리 (2025-02-02)

#### 미사용 모듈 삭제
- `GridEventManager.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridSelection.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridVirtualScroll.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridEditor.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridKeyboard.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridColumnManager.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridDataManager.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridState.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `VeloxGrid.ts.backup` 삭제

#### 결과
- 빌드 모듈 수: 22개 → 15개 (-7개)
- 소스 파일: ~60KB 삭제
- Core 모듈 수: 10개로 정리

### 추가 - Phase 12: 셀 기능 확장

#### Phase 12.1: 셀 검증
- 7가지 검증 타입을 가진 `GridValidator` 모듈 추가
- `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `custom` 검증자 지원
- 오류 시 빨간 테두리와 툴팁으로 검증 UI 피드백 제공
- `onValidationError` 이벤트 추가
- 검증 오류 시 셀이 편집 모드 유지

#### Phase 12.2: 커스텀 셀 에디터
- 다양한 에디터 타입 생성을 위한 `GridEditorFactory` 모듈 추가
- 5가지 에디터 타입 지원: `text`, `number`, `select`, `date`, `checkbox`, `custom`
- 각 에디터 타입별 전용 CSS 스타일링
- `VeloxGrid.renderEditCell()` 메서드와 통합
- 모든 에디터에 키보드 지원 (Enter, Tab, Escape)

#### Phase 12.3: 셀 툴팁
- 호버 정보 표시를 위한 `GridTooltip` 모듈 추가
- 잘린 텍스트 감지를 위한 자동 툴팁
- 콜백 함수를 통한 커스텀 툴팁
- 뷰포트 인식을 통한 동적 위치 설정
- 구성 가능한 표시/숨김 지연 시간

### 추가 - 코드 구조 최적화 (Phase 1-7)

#### VeloxGrid.ts 모듈화
- **VeloxGrid.ts**: 2,826줄 → 2,044줄 (27.7% 감소)
- **GridContext 인터페이스**: 모듈 간 통신을 위한 표준화된 인터페이스 정의
- **GridRenderer.ts**: 렌더링 담당 모듈 분리 (482줄)
- **GridFilterPopup.ts**: 필터 팝업 UI 모듈 분리 (191줄)
- **GridColumnMenu.ts**: 컬럼 메뉴 UI 모듈 분리 (188줄)
- **GridDragManager.ts**: 드래그 & 리사이즈 모듈 분리 (364줄)

#### CSS 모듈화
- 11개 파일로 CSS 분리 (유지보수성 향상)
- `_variables.css`, `_base.css`, `_header.css`, `_body.css`, `_selection.css`
- `_filter.css`, `_column-menu.css`, `_drag.css`, `_editor.css`, `_tooltip.css`, `_loading.css`
- 빌드 시 자동 번들링 (최종 CSS 파일 크기 변화 없음)

### 변경
- 새 기능을 위한 TypeScript 타입 업데이트
- Phase 12 스타일로 CSS 강화 (~110줄 추가)

### 수정
- 사용하지 않는 TypeScript 변수 제거 (깔끔한 빌드)
- `endEdit()` 메서드의 에디터 타입 처리 수정

### 번들 크기
- UMD: 71.35 KB (gzip: 18.23 KB) - 58.94 KB에서 증가
- ESM: 98.05 KB (gzip: 22.32 KB) - 79.31 KB에서 증가
- CSS: 15.38 KB (gzip: 3.06 KB) - 12.26 KB에서 증가

---

## [0.6.0] - 2025-01-26

### 추가 - Phase 10-11: 컬럼 & 행 기능

#### Phase 10: 컬럼 기능
- 드래그 앤 드롭을 통한 컬럼 재정렬
- 커스터마이징 가능한 항목이 있는 컬럼 메뉴(컨텍스트 메뉴)
- 동적으로 컬럼 고정/고정 해제
- `fixColumn()` 및 `reorderColumn()` API 메서드 추가

#### Phase 11: 행 기능
- 재정렬을 위한 행 드래그 앤 드롭
- `moveRow()` API 메서드 추가
- 행 드래그 핸들 UI 컴포넌트

### 변경
- 주요 리팩토링: 핵심 컴포넌트 모듈화
- `GridHistory`, `GridSelection`, `GridVirtualScroll`, `GridEditor`, `GridKeyboard`, `GridColumnManager`, `GridDataManager` 모듈 추가
- 성능을 위한 컬럼 캐싱 시스템 구현
- `createRowBase()` 메서드로 행 생성 통합

### 번들 크기
- UMD: 58.94 KB (gzip: 14.92 KB) - 50.50 KB에서 증가
- ESM: 79.31 KB (gzip: 17.52 KB)
- CSS: 12.26 KB (gzip: 2.50 KB)

---

## [0.5.0] - 2025-01-XX

### 추가 - Phase 9: 키보드 & 실행 취소/다시 실행 향상

- Enter/Tab 내비게이션 (편집 후 다음 셀로 자동 이동)
- Delete 키 지원 (선택된 셀 내용 삭제)
- 실행 취소/다시 실행 기능 (Ctrl+Z / Ctrl+Y)
- 향상된 키보드 단축키 (Ctrl+C/V/X 처리)
- 방향 내비게이션을 위한 `endEditAndMove()` 메서드
- `deleteSelectedCells()` 및 `deleteSelectedRows()` 메서드

### 변경
- 향상된 키보드 이벤트 처리
- 개선된 클립보드 작업

### 번들 크기
- UMD: 50.50 KB (gzip: 12.90 KB)

---

## [0.4.0] - 2025-01-XX

### 추가 - Phase 8: Excel 내보내기/가져오기

- SheetJS를 사용한 Excel 내보내기 (.xlsx)
- .xlsx 파일에서 Excel 가져오기
- CSV 내보내기/가져오기
- JSON 내보내기
- 내보내기 옵션 (헤더, 선택된 행, 필터된 행)
- `exportToExcel()`, `importFromExcel()`, `exportToCSV()`, `exportToJSON()` 메서드 추가

### 변경
- SheetJS는 이제 선택적 외부 의존성
- 향상된 내보내기 유틸리티

---

## [0.3.0] - 2025-01-XX

### 추가 - Phase 7: 선택 기능 향상

- 셀 선택 (개별 셀 선택)
- 블록 선택 (드래그하여 범위 선택, Excel 스타일)
- CheckBar 분리 (Selection과 독립적)
- 단독 체크 (라디오 버튼 스타일)
- 체크 가능 콜백 (조건부 체크 가능 여부)
- 키보드 내비게이션 (방향키)
- 클립보드 작업 (복사/붙여넣기/잘라내기)
- 로딩 상태 인디케이터
- 자동 컬럼 너비 조정 기능

### 변경
- 다양한 스타일로 선택 시스템 향상
- 개선된 키보드 처리
- 포괄적인 선택 API 추가

---

## [0.2.0] - 2025-01-XX

### 추가 - Phase 5-6: 가상 스크롤 & 컬럼 고급 기능

- 대용량 데이터셋을 위한 가상 스크롤 (100,000+ 행)
- 컬럼 고정 (왼쪽/오른쪽에 컬럼 고정)
- 헤더 필터 UI

### 변경
- 대용량 데이터셋에 대한 성능 향상
- 향상된 컬럼 기능

---

## [0.1.0] - 2025-01-XX

### 추가 - Phase 1-4: 핵심 기능

- 기본 테이블 렌더링
- 컬럼 정의 시스템
- 행 선택 (단일/다중)
- 정렬 (오름차순/내림차순)
- 필터링
- 인라인 편집
- 체크박스 기능

### 기능
- 프레임워크 독립적 (Vanilla JS)
- TypeScript 지원
- Zero Dependencies (선택적 SheetJS 제외)
- 경량화 (~30KB 초기)

---

## 향후 릴리즈

### [0.13.0] - 계획됨
- Cell Merge (셀 병합)
- Row Grouping (행 그룹화)

### [1.0.0] - 계획됨
- 안정적인 API
- 종합적인 문서
- 성능 최적화
- 접근성 개선 (ARIA, 스크린 리더 지원)
- 테마 시스템 (다크 테마 지원)

---

[0.12.0]: https://github.com/veloxgrid/velox-grid/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/veloxgrid/velox-grid/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/veloxgrid/velox-grid/compare/v0.9.1...v0.10.0
