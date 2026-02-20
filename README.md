# VeloxGrid 🚀

빠르고 가벼운 프레임워크 독립적 데이터 그리드 라이브러리

> **Velox** (라틴어) = "빠른" - 빠르고 가벼운 데이터 그리드를 지향합니다.

[![npm version](https://img.shields.io/npm/v/velox-grid.svg)](https://www.npmjs.com/package/velox-grid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/velox-grid)](https://bundlephobia.com/package/velox-grid)

## 🌐 Live Demo

**[👉 https://veloxgrid.github.io/velox-grid/](https://veloxgrid.github.io/velox-grid/)**

다양한 기능을 직접 체험해보세요:
- Selection & Navigation
- Excel Export/Import
- Keyboard & Undo/Redo
- Column Management
- Row Drag & Drop
- Validation & Custom Editor

## ✨ 주요 기능

- 🎯 **프레임워크 독립적** - Vanilla JS, React, Vue, Angular 등 모든 환경에서 사용 가능
- 🚀 **가상 스크롤** - 대용량 데이터(100,000+ 행) 처리
- 📦 **Zero Dependencies** - 외부 의존성 없음 (Excel 기능의 경우 SheetJS 선택적 사용)
- 🎨 **커스터마이징 가능** - CSS Variables를 통한 쉬운 테마 커스터마이징
- 📝 **TypeScript** - 완벽한 타입 지원
- ⚛️ **React/Vue 래퍼** - 공식 React 컴포넌트 & Vue 3 컴포넌트 제공 (v0.11.0)
- ⚡ **경량화** - ~117KB minified (~28KB gzipped)

### 핵심 기능

- ✅ **셀 선택** - 개별 셀 및 블록 선택 (v0.3.0)
- ⌨️ **키보드 내비게이션** - 화살표 키, Tab, 단축키 지원 (v0.3.0, v0.9.1)
- 📊 **Excel 내보내기/가져오기** - Excel, CSV, JSON 지원 (v0.4.0)
- ↩️ **실행 취소/다시 실행** - Ctrl+Z / Ctrl+Y 지원 (v0.5.0)
- 🔄 **컬럼 재정렬** - 드래그 앤 드롭으로 컬럼 순서 변경 (v0.6.0)
- 📋 **행 드래그 앤 드롭** - 드래그로 행 순서 변경 (v0.6.0)
- ✔️ **셀 검증** - 다양한 규칙으로 입력값 검증 (v0.7.0)
- 🎛️ **커스텀 에디터** - 드롭다운, 날짜 선택기, 체크박스 에디터 (v0.7.0)
- 💬 **셀 툴팁** - 셀 호버 시 툴팁 표시 (v0.7.0)
- 🔧 **안정적인 Edit 모드** - 편집 중 상호작용 개선 (v0.7.1)
- 📊 **Summary/Aggregation** - Footer 요약 행으로 데이터 집계 (sum, avg, count, min, max) (v0.7.1)
- 📌 **Fixed Columns** - 왼쪽/오른쪽 컬럼 고정 (v0.8.0)
- 🔢 **Row State Management** - 행 상태 추적 (생성/수정/삭제) (v0.9.0)
- ⚡ **Quick Edit** - 셀 선택 후 바로 타이핑으로 편집 (v0.9.1)
- ⌨️ **Enhanced Keyboard** - Enter/Tab/Shift 조합 완벽 지원 (v0.9.1)
- 📄 **Pagination** - Local/Remote 페이지네이션, 페이지 크기 변경 (v0.10.0)
- 🌐 **Server-Side Data** - 서버 측 정렬/필터/페이징 연동 (v0.10.0)
- ♾️ **Infinite Scroll** - 스크롤 끝 도달 시 다음 데이터 자동 로드 (v0.10.0)
- ⚛️ **React 래퍼** - VeloxGridReact 컴포넌트 + useVeloxGrid Hook (v0.11.0)
- 💚 **Vue 3 래퍼** - VeloxGridVue 컴포넌트 + useVeloxGrid Composable (v0.11.0)
- 📊 **Column Group** - 다단계 헤더 (2단, 3단 중첩 그룹) + Fixed Columns 통합 (v0.12.0)

### 코드 구조 최적화 (v0.7.0+)

- 🏗️ **모듈화 아키텍처** - VeloxGrid.ts 2,826줄 → 2,044줄 (27.7% 감소)
- 📁 **CSS 모듈화** - 11개 파일로 분리하여 유지보수성 향상
- 🔧 **핵심 모듈** - GridRenderer, GridFilterPopup, GridColumnMenu, GridDragManager 분리

## 📦 설치

### Vanilla JS / 공통
```bash
npm install velox-grid
```

### React 프로젝트
```bash
npm install velox-grid react react-dom
```

```json
// package.json
{
  "dependencies": {
    "velox-grid": "^0.12.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### Vue 3 프로젝트
```bash
npm install velox-grid vue
```

```json
// package.json
{
  "dependencies": {
    "velox-grid": "^0.12.0",
    "vue": "^3.4.0"
  }
}
```

> **참고**: `react`, `vue`는 peerDependencies(optional)로 설정되어 있어, 해당 프레임워크를 사용하지 않으면 설치할 필요 없습니다.

## 🚀 빠른 시작

### CDN (브라우저)

```html
<link rel="stylesheet" href="https://unpkg.com/velox-grid@0.12.0/dist/velox-grid.css">
<script src="https://unpkg.com/velox-grid@0.12.0/dist/velox-grid.iife.js"></script>

<div id="grid"></div>

<script>
  const grid = new VeloxGrid.VeloxGrid('#grid', {
    columns: [
      { field: 'id', header: 'ID', type: 'number', width: 60 },
      { field: 'name', header: '이름', type: 'text', width: 120 },
      { field: 'email', header: '이메일', type: 'text', width: 200, 
        editable: true,
        validation: [
          { type: 'required', message: '이메일은 필수입니다' },
          { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '올바른 이메일 형식이 아닙니다' }
        ]
      },
      { field: 'age', header: '나이', type: 'number', width: 80 },
    ],
    data: [
      { id: 1, name: '김철수', email: 'john@example.com', age: 28 },
      { id: 2, name: '이영희', email: 'jane@example.com', age: 32 },
    ],
    height: 400,
    editable: true,
    sortable: true,
    selectionStyle: 'cell',
  });
</script>
```

### ES Module

```javascript
import { VeloxGrid } from 'velox-grid';
import 'velox-grid/dist/velox-grid.css';

const grid = new VeloxGrid('#grid', {
  columns: [
    { 
      field: 'status', 
      header: '상태', 
      editable: true,
      editor: {
        type: 'select',
        options: [
          { value: 'active', label: '활성' },
          { value: 'inactive', label: '비활성' },
          { value: 'pending', label: '대기중' }
        ]
      }
    },
    { 
      field: 'date', 
      header: '날짜', 
      editable: true,
      editor: { type: 'date' }
    },
  ],
  data: [...],
});
```

### React (v0.11.0)

```tsx
import { useRef } from 'react';
import { VeloxGridReact } from 'velox-grid/react';
import type { VeloxGridReactRef } from 'velox-grid/react';
import 'velox-grid/css';

function App() {
  const gridRef = useRef<VeloxGridReactRef>(null);

  return (
    <div>
      <button onClick={() => gridRef.current?.addRow({ name: 'New', age: 0 })}>
        행 추가
      </button>
      <VeloxGridReact
        ref={gridRef}
        columns={[
          { field: 'name', header: '이름', width: 150 },
          { field: 'age', header: '나이', type: 'number', width: 80 },
        ]}
        data={data}
        height={400}
        editable={true}
        onCellEditEnd={(e) => console.log('Edit:', e)}
      />
    </div>
  );
}
```

**useVeloxGrid Hook:**

```tsx
import { useVeloxGrid } from 'velox-grid/react';

function App() {
  const { containerRef, grid, isReady } = useVeloxGrid({
    columns, data, height: 400, editable: true,
    onCellEditEnd: (e) => console.log(e),
  });

  return (
    <div>
      <button onClick={() => grid?.addRow({ name: 'New' })}>행 추가</button>
      <div ref={containerRef} />
    </div>
  );
}
```

### Vue 3 (v0.11.0)

```vue
<template>
  <button @click="gridRef?.addRow({ name: 'New' })">행 추가</button>
  <VeloxGridVue
    ref="gridRef"
    :columns="columns"
    :data="data"
    :height="400"
    :editable="true"
    @cell-edit-end="onCellEditEnd"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VeloxGridVue } from 'velox-grid/vue';
import 'velox-grid/css';

const gridRef = ref<InstanceType<typeof VeloxGridVue>>();

function onCellEditEnd(e) {
  console.log('Edit:', e);
}
</script>
```

**useVeloxGrid Composable:**

```vue
<template>
  <button @click="grid?.addRow({ name: 'New' })">행 추가</button>
  <div ref="containerRef" />
</template>

<script setup lang="ts">
import { useVeloxGrid } from 'velox-grid/vue';

const { containerRef, grid, isReady } = useVeloxGrid({
  columns, data, height: 400, editable: true,
  onCellEditEnd: (e) => console.log(e),
});
</script>
```

## 📚 핵심 API

### Grid Options

```typescript
interface GridOptions {
  columns: ColumnDefinition[];
  data?: RowData[];
  width?: number | string;
  height?: number | string;
  rowHeight?: number;
  headerHeight?: number;
  
  // 선택
  selectable?: boolean;
  selectionMode?: 'none' | 'single' | 'multiple' | 'extended';
  selectionStyle?: 'row' | 'cell' | 'block' | 'none';
  
  // 체크박스 (v0.3.0)
  checkBar?: {
    visible: boolean;
    exclusive?: boolean;      // 라디오 버튼 스타일
    showAll?: boolean;        // 전체 선택 체크박스 표시
    checkableCallback?: (row: RowData, index: number) => boolean;
  };
  
  // 기능
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  resizable?: boolean;
  virtualScroll?: boolean;
  undoable?: boolean;        // v0.5.0
  
  // UI
  showRowNumbers?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  theme?: 'default';
}
```

### Column Definition

```typescript
interface ColumnDefinition {
  field: string;
  header: string;
  type?: 'text' | 'number' | 'date' | 'boolean';
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  
  // 기능
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  resizable?: boolean;
  fixed?: 'left' | 'right' | false;
  visible?: boolean;
  
  // 렌더링
  formatter?: (value: CellValue, row: RowData, column: ColumnDefinition) => string;
  renderer?: (value: CellValue, row: RowData, column: ColumnDefinition) => string;
  cellClass?: string | ((value: CellValue, row: RowData) => string);
  
  // 검증 (v0.7.0)
  validation?: ValidationRule[];
  
  // 커스텀 에디터 (v0.7.0)
  editor?: EditorOptions;
  
  // 툴팁 (v0.7.0)
  tooltip?: boolean | ((value: CellValue, row: RowData) => string);
  
  // Summary (v0.7.1)
  summary?: SummaryConfig;
}
```

### 검증 규칙 (v0.7.0)

```typescript
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  message: string;
  validator?: (value: CellValue, row: RowData) => boolean | string;
}

// 사용 예제
{
  field: 'email',
  validation: [
    { type: 'required', message: '이메일은 필수입니다' },
    { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '올바른 이메일 형식이 아닙니다' }
  ]
}
```

### 커스텀 에디터 (v0.7.0)

```typescript
interface EditorOptions {
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'custom';
  options?: Array<{ value: CellValue; label: string }>;  // 'select'용
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  renderer?: (cell: HTMLElement, value: CellValue, save: (v: CellValue) => void, cancel: () => void) => void;
}

// 사용 예제
{
  field: 'category',
  editor: {
    type: 'select',
    options: [
      { value: 'A', label: '카테고리 A' },
      { value: 'B', label: '카테고리 B' }
    ]
  }
}
```

### Summary/Aggregation (v0.7.1)

```typescript
interface SummaryConfig {
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
  customFunction?: (values: CellValue[], data: RowData[]) => CellValue;
  label?: string;
  format?: string;
  formatter?: (value: CellValue) => string;
  className?: string;
}

// 사용 예제
const grid = new VeloxGrid('#grid', {
  columns: [
    {
      field: 'quantity',
      header: 'Quantity',
      type: 'number',
      summary: {
        function: 'sum',
        label: 'Total:',
        formatter: (value) => `${value} units`
      }
    },
    {
      field: 'revenue',
      header: 'Revenue',
      type: 'number',
      summary: {
        function: 'sum',
        label: 'Total Revenue:',
        formatter: (value) => `${value.toLocaleString()}`,
        className: 'velox-footer-cell--total'
      }
    }
  ],
  footerSummary: {
    visible: true,
    height: 44
  }
});

// API 메서드
const totalRevenue = grid.getSummaryValue('revenue');
const allSummaries = grid.getSummaryValues();
grid.refreshSummary();  // 수동 새로고침
```

### Pagination (v0.10.0)

```typescript
const grid = new VeloxGrid('#grid', {
  columns: [...],
  data: localData,  // Local mode
  pagination: {
    enabled: true,
    pageSize: 20,
    showInfo: true,           // "1-20 / 500" 표시
    showSizeChanger: true,    // 페이지 크기 셀렉터
    pageSizeOptions: [10, 20, 50, 100],
    maxPageButtons: 5,
  },
});

// Remote mode (서버 측 데이터)
const grid = new VeloxGrid('#grid', {
  columns: [...],
  dataSource: {
    type: 'remote',
    fetch: async (params) => {
      // params: { page, pageSize, sort?, filter? }
      const res = await fetch(`/api/data?page=${params.page}&size=${params.pageSize}`);
      return await res.json(); // { data: RowData[], totalCount: number }
    },
  },
  pagination: { enabled: true, pageSize: 20 },
});

// API 메서드
grid.goToPage(3);                  // 페이지 이동
grid.setPageSize(50);              // 페이지 크기 변경
grid.getPaginationState();         // { currentPage, pageSize, totalCount, totalPages }
await grid.fetchData();            // 서버 데이터 수동 새로고침

// Infinite Scroll mode
const grid = new VeloxGrid('#grid', {
  columns: [...],
  data: localData,
  pagination: {
    enabled: true,
    mode: 'infinite',               // 스크롤 끝 도달 시 자동 로드
    pageSize: 50,
    infiniteScrollThreshold: 100,   // 바닥 여유 px
  },
});
```

### Column Group — 다단계 헤더 (v0.12.0)

```typescript
const grid = new VeloxGrid('#grid', {
  columns: [
    { field: 'name', header: '이름', width: 120 },
    { field: 'email', header: '이메일', width: 200 },
    { field: 'phone', header: '전화번호', width: 150 },
    { field: 'department', header: '부서', width: 120 },
    { field: 'salary', header: '급여', width: 100 },
  ],
  // 2단 그룹 헤더
  columnLayout: [
    {
      name: 'personalInfo',
      header: '인적정보',
      items: ['name', 'email', 'phone'],
    },
    {
      name: 'workInfo',
      header: '업무정보',
      items: ['department', 'salary'],
    },
  ],
});

// 3단 중첩 그룹
 grid.setColumnLayout([
  {
    name: 'personalInfo',
    header: '인적정보',
    items: [
      'name',
      { name: 'contact', header: '연락처', items: ['email', 'phone'] },
    ],
  },
  'department',
  'salary',
]);

// 레이아웃 해제 (1단 헤더로 복원)
grid.clearColumnLayout();
```

### 메서드

```typescript
// 데이터
getData(): RowData[]
setData(data: RowData[]): void
addRow(row: RowData, index?: number): void
updateRow(index: number, data: Partial<RowData>): void
removeRow(index: number): void
clearData(): void

// 선택
getSelectedRows(): number[]
selectRow(index: number, selected?: boolean): void
selectAll(selected?: boolean): void
clearSelection(): void

// 셀 선택 (v0.3.0)
getSelectedCells(): CellIndex[]
selectCell(rowIndex: number, field: string, selected?: boolean): void
setFocusedCell(rowIndex: number, field: string): void
getSelectionData(): CellValue[][]

// 체크박스 (v0.3.0)
checkItem(index: number, checked?: boolean): void
checkAll(checked?: boolean): void
getCheckedItems(): number[]
getCheckedData(): RowData[]

// 컬럼
getColumn(field: string): ColumnDefinition | null
setColumnWidth(field: string, width: number): void
showColumn(field: string): void
hideColumn(field: string): void
autoFitColumn(field: string): void
fixColumn(field: string, position: 'left' | 'right' | false): void  // v0.6.0
reorderColumn(sourceField: string, targetField: string): void       // v0.6.0

// 행
moveRow(fromIndex: number, toIndex: number): void  // v0.6.0

// 클립보드 (v0.3.0)
copy(): void
paste(): void
cut(): void

// 실행 취소/다시 실행 (v0.5.0)
undo(): boolean
redo(): boolean
canUndo(): boolean
canRedo(): boolean
clearHistory(): void

// 내보내기/가져오기 (v0.4.0)
exportToExcel(options?: ExportOptions): void
importFromExcel(file: File, sheetIndex?: number): Promise<ImportResult>
exportToCSV(options?: ExportOptions): string
downloadCSV(options?: ExportOptions): void

// Summary/Aggregation (v0.7.1)
getSummaryValue(field: string): CellValue
getSummaryValues(): Record<string, CellValue>
refreshSummary(): void

// Pagination (v0.10.0)
goToPage(page: number): void
setPageSize(pageSize: number): void
getPaginationState(): PaginationState
fetchData(): Promise<void>

// Column Group (v0.12.0)
setColumnLayout(layout: ColumnLayoutItem[] | null): void
getColumnLayout(): ColumnLayoutItem[] | null
clearColumnLayout(): void

// 유틸리티
refresh(): void
setLoading(loading: boolean): void
destroy(): void
```

### 이벤트

```typescript
interface GridEvents {
  onReady?: (grid: VeloxGridInstance) => void;
  onDataChange?: (data: RowData[]) => void;
  
  // 행
  onRowClick?: (index: number, row: RowData) => void;
  onRowDoubleClick?: (index: number, row: RowData) => void;
  onRowSelect?: (index: number, selected: boolean) => void;
  onSelectionChange?: (selectedRows: number[]) => void;
  
  // 셀
  onCellClick?: (rowIndex: number, field: string, value: CellValue) => void;
  onCellSelect?: (cell: CellIndex, selected: boolean) => void;
  onCellSelectionChange?: (selectedCells: CellIndex[]) => void;
  
  // 편집
  onCellEditStart?: (rowIndex: number, field: string, value: CellValue) => void;
  onCellEditEnd?: (event: CellEditEvent) => void;
  onCellEditCancel?: (rowIndex: number, field: string) => void;
  onValidationError?: (event: ValidationErrorEvent) => void;  // v0.7.0
  
  // 체크박스
  onCheckChange?: (index: number, checked: boolean) => void;
  onCheckAllChange?: (checked: boolean) => void;
  
  // 데이터 작업
  onRowAdd?: (row: RowData, index: number) => void;
  onRowUpdate?: (row: RowData, index: number, changes: Partial<RowData>) => void;
  onRowRemove?: (row: RowData, index: number) => void;
  
  // 컬럼
  onColumnResize?: (field: string, width: number) => void;
  onColumnReorder?: (sourceField: string, sourceIndex: number, targetIndex: number) => void;  // v0.6.0
  
  // 클립보드
  onCopy?: (data: string[][]) => void;
  onPaste?: (data: string[][], focusedCell: CellIndex) => void;
  onCut?: (data: string[][]) => void;
  
  // 실행 취소/다시 실행
  onUndo?: (action: UndoAction) => void;
  onRedo?: (action: UndoAction) => void;
  
  // 기타
  onSort?: (sortState: SortState[]) => void;
  onFilter?: (filterState: FilterState) => void;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  onDestroy?: () => void;

  // Pagination (v0.10.0)
  onPageChange?: (page: number, pageSize: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}
```

## 🎹 키보드 단축키

### Read 모드 (읽기/선택)
| 단축키 | 동작 |
|----------|--------|
| `방향키` | 셀 이동 |
| `Tab` | 오른쪽 셀로 이동 (행 끝에서 다음 행으로 래핑) |
| `Shift + Tab` | 왼쪽 셀로 이동 (행 시작에서 이전 행으로 래핑) |
| `Shift + 방향키` | 선택 영역 확장 |
| `Ctrl + A` | 전체 선택 |
| `Ctrl + C` | 복사 |
| `Ctrl + V` | 붙여넣기 |
| `Ctrl + X` | 잘라내기 |
| `Ctrl + Z` | 실행 취소 |
| `Ctrl + Y` | 다시 실행 |
| `Delete / Backspace` | 선택된 셀 내용 삭제 |
| `Enter / F2` | 편집 시작 |
| `Space` | 체크박스 토글 |
| `Home / End` | 첫 / 마지막 컬럼 |
| `Ctrl + Home/End` | 첫 / 마지막 행의 첫 / 마지막 컬럼 |
| `Page Up/Down` | 페이지 이동 |

### Edit 모드 (편집 중)
| 단축키 | 동작 |
|----------|--------|
| `Enter` | 저장 후 아래 셀로 이동 |
| `Shift + Enter` | 저장 후 위 셀로 이동 |
| `Tab` | 저장 후 오른쪽 셀로 이동 (행 끝에서 다음 행으로) |
| `Shift + Tab` | 저장 후 왼쪽 셀로 이동 (행 시작에서 이전 행으로) |
| `Escape` | 편집 취소 |
| `타이핑` | Quick Edit - 즉시 편집 시작 (기존 내용 대체) |

> **Quick Edit**: 셀을 선택한 상태에서 바로 타이핑하면 편집 모드로 진입하여 기존 값을 대체합니다 (Excel 스타일)

## 📁 프로젝트 구조

```
velox-grid/
├── src/
│   ├── core/
│   │   ├── VeloxGrid.ts         # Facade 클래스
│   │   ├── GridRenderer.ts      # 렌더링 담당
│   │   ├── GridFilterPopup.ts   # 필터 팝업 UI
│   │   ├── GridColumnMenu.ts    # 컬럼 메뉴 UI
│   │   ├── GridDragManager.ts   # 드래그 & 리사이즈
│   │   ├── GridColumnLayout.ts  # 다단계 헤더 레이아웃 (v0.12.0)
│   │   ├── GridHistory.ts       # Undo/Redo 관리
│   │   ├── GridEditorFactory.ts # 에디터 생성
│   │   ├── GridValidator.ts     # 셀 검증
│   │   ├── GridTooltip.ts       # 툴팁
│   │   ├── GridSummary.ts       # 집계/요약
│   │   └── index.ts
│   ├── styles/
│   │   ├── velox-grid.css       # 메인 (@import)
│   │   ├── _variables.css       # CSS 변수
│   │   ├── _base.css            # 기본 레이아웃
│   │   ├── _header.css          # 헤더 스타일
│   │   ├── _body.css            # 바디/셀 스타일
│   │   ├── _selection.css       # 선택 스타일
│   │   ├── _filter.css          # 필터 팝업
│   │   ├── _column-menu.css     # 컬럼 메뉴
│   │   ├── _column-group.css    # 다단계 헤더 (v0.12.0)
│   │   ├── _drag.css            # 드래그 앤 드롭
│   │   ├── _editor.css          # 에디터
│   │   ├── _tooltip.css         # 툴팁
│   │   ├── _pagination.css      # 페이지네이션
│   │   ├── _footer.css          # 푸터 요약
│   │   └── _loading.css         # 로딩
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── data.ts
│       ├── dom.ts
│       ├── export.ts
│       └── index.ts
├── dist/                        # 빌드 출력
├── examples/                    # 예제 페이지
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
└── package.json
```

## 📊 번들 크기

| 버전 | IIFE | Gzipped |
|---------|-----|---------|
| v0.12.0 | 117.12 KB | 28.36 KB |
| v0.10.0 | 100.20 KB | 24.69 KB |
| v0.7.0 | 71.35 KB | 18.23 KB |
| v0.6.0 | 58.94 KB | 14.92 KB |

## 🗺️ 로드맵

자세한 기능 계획은 [ROADMAP.md](./ROADMAP.md)를 참고하세요.

### 예정된 기능

- **v0.13.0**: Cell Merge (셀 병합)
- **v1.0.0**: 안정적인 API, 접근성, 테마 시스템

## 📄 변경 이력

버전 히스토리는 [CHANGELOG.md](./CHANGELOG.md)를 참고하세요.

## 🤝 기여하기

기여는 언제나 환영합니다! Pull Request를 자유롭게 제출해주세요.

## 📝 라이선스

MIT © [veloxgrid](https://github.com/veloxgrid)

## 🔗 링크

- [GitHub 저장소](https://github.com/veloxgrid/velox-grid)
- [NPM 패키지](https://www.npmjs.com/package/velox-grid)
- [데모](https://veloxgrid.github.io/velox-grid/)
- [문서](https://github.com/veloxgrid/velox-grid/wiki)

## 💬 지원

- [이슈](https://github.com/veloxgrid/velox-grid/issues)
- [토론](https://github.com/veloxgrid/velox-grid/discussions)

---

**veloxgrid가 ❤️ 를 담아 만들었습니다**
