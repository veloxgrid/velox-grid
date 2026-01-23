# VeloxGrid 🚀

A fast, lightweight, and framework-agnostic data grid library.

> **Velox** (라틴어) = "빠른" - 빠르고 가벼운 데이터 그리드를 지향합니다.

[![npm version](https://img.shields.io/npm/v/velox-grid.svg)](https://www.npmjs.com/package/velox-grid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **Framework Agnostic** - Vanilla JS, React, Vue, Angular 등 모든 환경에서 사용 가능
- 🚀 **Virtual Scroll** - 대용량 데이터(100,000+ 행) 처리
- 📦 **Zero Dependencies** - 외부 의존성 없음
- 🎨 **Customizable** - CSS Variables를 통한 쉬운 테마 커스터마이징
- 📝 **TypeScript** - 완벽한 타입 지원
- ⚡ **Lightweight** - ~25KB (minified)

## 📦 Installation

```bash
npm install velox-grid
```

## 🚀 Quick Start

### CDN (Browser)

```html
<link rel="stylesheet" href="https://unpkg.com/velox-grid/dist/velox-grid.css">
<script src="https://unpkg.com/velox-grid/dist/velox-grid.iife.js"></script>

<div id="grid"></div>

<script>
  const grid = new VeloxGrid.VeloxGrid('#grid', {
    columns: [
      { field: 'id', header: 'ID', type: 'number', width: 60 },
      { field: 'name', header: '이름', type: 'text', width: 120 },
      { field: 'age', header: '나이', type: 'number', width: 80 },
    ],
    data: [
      { id: 1, name: '김철수', age: 28 },
      { id: 2, name: '이영희', age: 32 },
    ],
    height: 400,
    showCheckbox: true,
    sortable: true,
  });
</script>
```

### ES Module

```typescript
import { VeloxGrid } from 'velox-grid';
import 'velox-grid/dist/velox-grid.css';

const grid = new VeloxGrid('#grid', {
  columns: [
    { field: 'id', header: 'ID', type: 'number', width: 60, align: 'center' },
    { field: 'name', header: '이름', type: 'text', width: 120, sortable: true },
    { field: 'email', header: '이메일', type: 'text', width: 200 },
    { 
      field: 'salary', 
      header: '급여', 
      type: 'number',
      align: 'right',
      formatter: (value) => `₩${value?.toLocaleString() || 0}`
    },
  ],
  data: sampleData,
  height: 500,
  showCheckbox: true,
  showRowNumbers: true,
  sortable: true,
  filterable: true,
  editable: true,
  virtualScroll: true, // 대용량 데이터 처리
});
```

### React 사용 예시

```tsx
import { useEffect, useRef } from 'react';
import { VeloxGrid, GridOptions, GridEvents, VeloxGridInstance } from 'velox-grid';
import 'velox-grid/dist/velox-grid.css';

interface DataGridProps {
  options: GridOptions;
  events?: GridEvents;
}

function DataGrid({ options, events }: DataGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<VeloxGridInstance | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      gridRef.current = new VeloxGrid(containerRef.current, options, events);
    }
    return () => gridRef.current?.destroy();
  }, []);

  // 외부에서 그리드 조작
  const handleAddRow = () => {
    gridRef.current?.addRow({ id: Date.now(), name: 'New', age: 0 });
  };

  return (
    <div>
      <button onClick={handleAddRow}>행 추가</button>
      <div ref={containerRef} />
    </div>
  );
}
```

---

## 📖 API Reference

### GridOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `columns` | `ColumnDefinition[]` | **Required** | 컬럼 정의 배열 |
| `data` | `RowData[]` | `[]` | 초기 데이터 |
| `width` | `number \| string` | `'100%'` | 그리드 너비 |
| `height` | `number \| string` | `'auto'` | 그리드 높이 |
| `rowHeight` | `number` | `40` | 행 높이 (px) |
| `headerHeight` | `number` | `44` | 헤더 높이 (px) |
| `showCheckbox` | `boolean` | `false` | 체크박스 컬럼 표시 |
| `showRowNumbers` | `boolean` | `false` | 행 번호 표시 |
| `selectable` | `boolean` | `true` | 행 선택 활성화 |
| `selectionMode` | `'single' \| 'multiple'` | `'multiple'` | 선택 모드 |
| `sortable` | `boolean` | `true` | 정렬 활성화 |
| `filterable` | `boolean` | `false` | 필터링 활성화 |
| `editable` | `boolean` | `false` | 편집 활성화 |
| `resizable` | `boolean` | `true` | 컬럼 리사이즈 활성화 |
| `virtualScroll` | `boolean` | `false` | 가상 스크롤 활성화 |
| `bufferSize` | `number` | `5` | 가상 스크롤 버퍼 행 수 |
| `emptyMessage` | `string` | `'데이터가 없습니다.'` | 빈 데이터 메시지 |

### ColumnDefinition

```typescript
interface ColumnDefinition {
  field: string;           // 데이터 필드명 (필수)
  header: string;          // 헤더 표시명 (필수)
  type?: ValueType;        // 'text' | 'number' | 'boolean' | 'date' | 'datetime'
  width?: number;          // 컬럼 너비 (px)
  minWidth?: number;       // 최소 너비 (px)
  maxWidth?: number;       // 최대 너비 (px)
  align?: 'left' | 'center' | 'right';      // 셀 정렬
  headerAlign?: 'left' | 'center' | 'right'; // 헤더 정렬
  sortable?: boolean;      // 정렬 가능 여부
  filterable?: boolean;    // 필터 가능 여부
  editable?: boolean;      // 편집 가능 여부
  resizable?: boolean;     // 리사이즈 가능 여부
  visible?: boolean;       // 표시 여부
  fixed?: 'left' | 'right' | false; // 컬럼 고정
  formatter?: (value, row, column) => string;  // 값 포맷터
  renderer?: (value, row, column) => string;   // 커스텀 렌더러 (HTML)
  cellClass?: string | ((value, row) => string); // 셀 CSS 클래스
}
```

### Methods

#### 데이터 조작

```typescript
// 데이터 가져오기/설정
grid.getData(): RowData[]
grid.setData(data: RowData[]): void
grid.getRow(index: number): RowData | null
grid.getRowCount(): number

// 행 추가/수정/삭제
grid.addRow(row: RowData, index?: number): void
grid.updateRow(index: number, data: Partial<RowData>): void
grid.removeRow(index: number): void
grid.clearData(): void

// 셀 값
grid.getCellValue(rowIndex: number, field: string): CellValue
grid.setCellValue(rowIndex: number, field: string, value: CellValue): void
```

#### 선택 (Selection)

```typescript
grid.selectRow(index: number, selected?: boolean): void
grid.selectAll(selected?: boolean): void
grid.clearSelection(): void
grid.getSelectedRows(): number[]
grid.getSelectedData(): RowData[]
grid.isRowSelected(index: number): boolean

// 체크박스 (Selection alias)
grid.checkRow(index: number, checked?: boolean): void
grid.checkAll(checked?: boolean): void
grid.getCheckedRows(): number[]
grid.getCheckedData(): RowData[]
```

#### 정렬 (Sort)

```typescript
grid.sort(field: string, direction?: 'asc' | 'desc' | null): void
grid.clearSort(): void
grid.getSortState(): SortState[]
```

#### 필터 (Filter)

```typescript
grid.filter(conditions: FilterCondition | FilterCondition[]): void
grid.clearFilter(): void
grid.getFilterState(): FilterState | null

// FilterCondition 예시
grid.filter({
  field: 'age',
  operator: 'greaterThanOrEqual',
  value: 30
});

// 다중 필터
grid.filter([
  { field: 'age', operator: 'greaterThan', value: 25 },
  { field: 'department', operator: 'equals', value: '개발팀' }
]);
```

**Filter Operators:**
- `equals`, `notEquals`
- `contains`, `notContains`, `startsWith`, `endsWith`
- `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`
- `between`, `isEmpty`, `isNotEmpty`

#### 편집 (Edit)

```typescript
grid.startEdit(rowIndex: number, field: string): void
grid.endEdit(save?: boolean): void
grid.cancelEdit(): void
grid.isEditing(): boolean
```

#### 컬럼

```typescript
grid.getColumn(field: string): ColumnDefinition | null
grid.setColumns(columns: ColumnDefinition[]): void
grid.setColumnWidth(field: string, width: number): void
grid.showColumn(field: string): void
grid.hideColumn(field: string): void
```

#### 스크롤

```typescript
grid.scrollToRow(index: number): void
grid.scrollToTop(): void
grid.scrollToBottom(): void
```

#### 기타

```typescript
grid.refresh(): void
grid.destroy(): void
grid.setOptions(options: Partial<GridOptions>): void
grid.getOptions(): GridOptions
```

### Events

```typescript
const grid = new VeloxGrid('#grid', options, {
  // 데이터 이벤트
  onDataChange: (data: RowData[]) => void,
  onRowAdd: (row: RowData, index: number) => void,
  onRowRemove: (row: RowData, index: number) => void,
  onRowUpdate: (row: RowData, index: number, changes: Partial<RowData>) => void,

  // 선택 이벤트
  onSelectionChange: (selectedRows: number[]) => void,
  onRowSelect: (rowIndex: number, selected: boolean) => void,
  onAllSelect: (selected: boolean) => void,
  onCellClick: (rowIndex: number, field: string, value: CellValue) => void,
  onRowClick: (rowIndex: number, row: RowData) => void,
  onRowDoubleClick: (rowIndex: number, row: RowData) => void,

  // 정렬/필터 이벤트
  onSort: (sortState: SortState[]) => void,
  onFilter: (filterState: FilterState) => void,

  // 편집 이벤트
  onCellEditStart: (rowIndex: number, field: string, value: CellValue) => void,
  onCellEditEnd: (event: CellEditEvent) => void,
  onCellEditCancel: (rowIndex: number, field: string) => void,

  // 컬럼 이벤트
  onColumnResize: (field: string, width: number) => void,

  // 스크롤 이벤트
  onScroll: (scrollTop: number, scrollLeft: number) => void,

  // 라이프사이클
  onReady: (grid: VeloxGridInstance) => void,
  onDestroy: () => void,
});
```

---

## 🎨 Theming

CSS Variables를 통해 쉽게 커스터마이징할 수 있습니다:

```css
:root {
  /* 메인 컬러 */
  --velox-primary-color: #1976d2;
  
  /* 배경 */
  --velox-bg-color: #ffffff;
  --velox-header-bg: #f5f5f5;
  --velox-row-hover-bg: #f0f7ff;
  --velox-row-selected-bg: #e3f2fd;
  
  /* 테두리 */
  --velox-border-color: #e0e0e0;
  
  /* 텍스트 */
  --velox-text-color: #212121;
  --velox-header-text-color: #424242;
  
  /* 폰트 */
  --velox-font-family: 'Noto Sans KR', sans-serif;
  --velox-font-size: 14px;
  
  /* 크기 */
  --velox-row-height: 40px;
  --velox-header-height: 44px;
}
```

### 다크 테마 예시

```css
[data-theme="dark"] {
  --velox-bg-color: #1e1e1e;
  --velox-header-bg: #2d2d2d;
  --velox-row-bg: #1e1e1e;
  --velox-row-alt-bg: #252525;
  --velox-row-hover-bg: #333333;
  --velox-row-selected-bg: #264f78;
  --velox-border-color: #404040;
  --velox-text-color: #e0e0e0;
  --velox-header-text-color: #cccccc;
}
```

---

## 📋 Roadmap

- [x] **Phase 1**: 기본 기능 (테이블 렌더링, 컬럼 정의)
- [x] **Phase 2**: 체크박스/선택 (행 선택, 다중 선택)
- [x] **Phase 3**: 정렬/필터링
- [x] **Phase 4**: 편집 기능 (인라인 편집)
- [x] **Phase 5**: 가상 스크롤 (대용량 데이터) ✨ NEW
- [x] **Phase 6**: 컬럼 고정, 헤더 필터 UI ✨ NEW
- [ ] **Phase 7**: Excel Export/Import
- [ ] **Phase 8**: React/Vue 래퍼 컴포넌트

---

## 🛠 Development

```bash
# 설치
npm install

# 개발 서버
npm run dev

# 빌드
npm run build

# 테스트
npm test

# 린트
npm run lint
```

---

## 📄 License

MIT License

## 👤 Author

**bart** - with 🤖 Claude AI

---

## 🔗 Links

- [GitHub Repository](https://github.com/bart-idea/velox-grid)
- [Bug Reports](https://github.com/bart-idea/velox-grid/issues)

---

Made with ❤️ in Korea (Human + AI Collaboration)
