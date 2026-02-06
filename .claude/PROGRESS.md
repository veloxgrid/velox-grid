# VeloxGrid 작업 진행 상황

> 마지막 업데이트: 2025-02-05 (스크롤 동기화 버그 수정)

---

## 📊 프로젝트 현황

### 기본 정보
- **프로젝트명**: VeloxGrid
- **설명**: 빠르고 가벼운 Framework Agnostic 데이터 그리드 라이브러리
- **현재 버전**: v0.8.0
- **라이선스**: MIT
- **🌐 Live Demo**: https://bart-idea.github.io/velox-grid/

### 빌드 정보
- **번들 크기**: 87.08KB (gzip 21.92KB)
- **VeloxGrid.ts**: ~2,044줄 (최적화 완료)
- **Core 모듈**: 11개
- **CSS 모듈**: 11개

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
├── docs/               # GitHub Pages 배포용
├── examples/           # 데모 페이지
└── src/
    ├── core/          # 핵심 모듈 (11개)
    ├── styles/        # CSS 모듈 (11개)
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

### 계획된 기능

#### Phase 15: Group Summary
- [ ] Group Summary (그룹별 소계)
- [ ] Sub-total rows

#### Phase 15: React 래퍼
- [ ] React Component
- [ ] Hooks (useVeloxGrid)

#### Phase 16: 고급 기능
- [ ] Column Group (다단계 헤더)
- [ ] Row Grouping
- [ ] Row Detail (행 확장)

---

## 📋 최근 작업 이력 (최신순)

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

### 우선순위 1: Fixed Left 옵션 설계

**현재 문제**: showRowNumbers, rowDraggable, checkBar의 fixed left 배치가 자동으로 결정됨

**제안 방안**:
```typescript
interface GridOptions {
  // 기본 기능 옵션
  showRowNumbers?: boolean;
  rowDraggable?: boolean;
  checkBar?: CheckBarOptions;
  
  // Fixed left 배치 설정 (통합)
  fixedLeft?: {
    rowNumbers?: boolean;   // showRowNumbers가 true일 때만 동작
    rowDrag?: boolean;      // rowDraggable이 true일 때만 동작
    checkBar?: boolean;     // checkBar.visible이 true일 때만 동작
  };
}
```

**사용 예시**:
```typescript
// Row numbers를 fixed로
{
  showRowNumbers: true,
  fixedLeft: { rowNumbers: true }
}

// Drag와 CheckBar만 fixed로
{
  showRowNumbers: true,
  rowDraggable: true,
  checkBar: { visible: true },
  fixedLeft: {
    rowDrag: true,
    checkBar: true
    // rowNumbers는 false이므로 scrollable
  }
}
```

### 우선순위 2: Phase 14 (Group Summary)
- [ ] Group Summary (그룹별 소계)
- [ ] Sub-total rows

### 우선순위 3: React 래퍼
- [ ] React Component
- [ ] Hooks (useVeloxGrid)

---

## 📝 다음 대화 시작 방법

### 기능 개발
```
D:\Dev\git\velox-grid\.claude\PROGRESS.md 읽고 [Phase 14] 시작해줘
```

### 버그 수정
```
D:\Dev\git\velox-grid\.claude\PROGRESS.md 읽고 [버그] 수정해줘
```

### Fixed Left 옵션 구현
```
D:\Dev\git\velox-grid\.claude\PROGRESS.md 읽고 Fixed Left 옵션 구현해줘
```

---

## 📚 문서 구조 가이드

이 문서는 다음과 같이 구성되어 있습니다:

1. **📊 프로젝트 현황**: 최신 상태 요약 (버전, 크기, 구조)
2. **🎯 현재 상태**: 완료/계획된 기능 목록
3. **📋 최근 작업 이력**: 시간 역순 상세 내역
4. **🧹 코드 최적화 이력**: 리팩토링 작업 기록
5. **🔮 다음 작업 계획**: 우선순위별 작업 목록
6. **📝 다음 대화 시작 방법**: 컨텍스트 로딩 가이드

### 작업 분류

- **✨ 기능 개발**: 새로운 Phase 구현
- **🔧 버그 수정 & UI 개선**: 기존 기능 개선
- **🧹 코드 최적화**: 리팩토링, 정리
- **📦 인프라**: 빌드, 배포, 도구

이 구조를 통해 AI가 현재 상황을 정확히 파악하고 적절한 작업을 제안할 수 있습니다.
