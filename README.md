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
- ⚡ **Lightweight** - ~50KB (minified)
- 🔲 **Cell Selection** - 셀 단위 선택, 블록 선택 지원 (v0.3.0)
- ⌨️ **Keyboard Navigation** - 화살표 키, 단축키 지원 (v0.3.0)
- 📊 **Excel Export/Import** - Excel, CSV, JSON 내보내기/가져오기 (v0.4.0)
- ↩️ **Undo/Redo** - 작업 취소/다시 실행 (v0.5.0)

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
    checkBar: { visible: true },
    sortable: true,
    editable: true,
    undoable: true,  // v0.5.0 - Undo/Redo 활성화
  });
</script>
```

### ES Module

```typescript
import { VeloxGrid } from 'velox-grid';
import 'velox-grid/dist/velox-grid.css';

const grid = new VeloxGrid('#grid', {
  columns: [
    { field: 'id', header: 'ID', type: 'number', width: 60 },
    { field: 'name', header: '이름', type: 'text', width: 120 },
    { field: 'salary', header: '급여', type: 'number', align: 'right',
      formatter: (value) => value?.toLocaleString() || 0 },
  ],
  data: sampleData,
  height: 500,
  selectionStyle: 'cell',        // 'row' | 'cell' | 'block' | 'none'
  checkBar: { visible: true },   // Selection과 독립된 CheckBar
  showRowNumbers: true,
  sortable: true,
  editable: true,
  virtualScroll: true,
  undoable: true,                // v0.5.0
  undoStackSize: 50,             // v0.5.0 - 최대 Undo 스택 크기
});
```

---

## 📖 API Reference

### GridOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `columns` | `ColumnDefinition[]` | **Required** | 컬럼 정의 배열 |
| `data` | `RowData[]` | `[]` | 초기 데이터 |
| `height` | `number | string` | `'auto'` | 그리드 높이 |
| `selectable` | `boolean` | `true` | 선택 활성화 |
| `selectionMode` | `SelectionMode` | `'multiple'` | 선택 모드 |
| `selectionStyle` | `SelectionStyle` | `'row'` | 선택 스타일 (v0.3.0) |
| `checkBar` | `CheckBarOptions` | `{ visible: false }` | CheckBar 옵션 (v0.3.0) |
| `sortable` | `boolean` | `true` | 정렬 활성화 |
| `filterable` | `boolean` | `false` | 필터링 활성화 |
| `editable` | `boolean` | `false` | 편집 활성화 |
| `virtualScroll` | `boolean` | `false` | 가상 스크롤 |
| `loading` | `boolean` | `false` | 로딩 상태 (v0.3.0) |
| `undoable` | `boolean` | `true` | Undo/Redo 활성화 (v0.5.0) |
| `undoStackSize` | `number` | `50` | 최대 Undo 스택 크기 (v0.5.0) |

### Methods

#### Undo/Redo (v0.5.0)

```typescript
grid.undo(): boolean           // 마지막 작업 취소
grid.redo(): boolean           // 마지막 취소된 작업 다시 실행
grid.canUndo(): boolean        // Undo 가능 여부
grid.canRedo(): boolean        // Redo 가능 여부
grid.clearHistory(): void      // Undo/Redo 스택 초기화
```

#### Delete (v0.5.0)

```typescript
grid.deleteSelectedCells(): void   // 선택된 셀 내용 삭제
grid.deleteSelectedRows(): void    // 선택된 행 삭제
```

#### Cell Selection (v0.3.0)

```typescript
grid.selectCell(rowIndex, field, selected?): void
grid.getSelectedCells(): CellIndex[]
grid.setFocusedCell(rowIndex, field): void
grid.getFocusedCell(): CellIndex | null
grid.getSelectionData(): CellValue[][]
```

#### Clipboard (v0.3.0)

```typescript
grid.copy(): void
grid.paste(): void
grid.cut(): void
```

#### Export/Import (v0.4.0)

```typescript
// Excel Export (requires SheetJS via CDN)
grid.exportToExcel({ filename: 'data', sheetName: 'Sheet1' }): void

// CSV Export
grid.exportToCSV(options?): string    // Returns CSV string
grid.downloadCSV(options?): void      // Downloads as file

// JSON Export
grid.exportToJSON(options?): string   // Returns JSON string
grid.downloadJSON(options?): void     // Downloads as file

// Import
grid.importFromCSV(csvString, hasHeader?): ImportResult
grid.importFromExcel(file, sheetIndex?): Promise<ImportResult>
```

---

## ⌨️ Keyboard Shortcuts

| 단축키 | 동작 |
|--------|------|
| `↑ ↓ ← →` | 셀 이동 |
| `Shift + Arrow` | 선택 영역 확장 |
| `Ctrl + A` | 전체 선택 |
| `Ctrl + C` | 복사 |
| `Ctrl + V` | 붙여넣기 |
| `Ctrl + X` | 잘라내기 |
| `Ctrl + Z` | Undo (v0.5.0) |
| `Ctrl + Y` | Redo (v0.5.0) |
| `Delete / Backspace` | 선택 셀 내용 삭제 (v0.5.0) |
| `Enter` | 편집 완료 → 아래 셀 이동 (v0.5.0) |
| `Tab` | 편집 완료 → 오른쪽 셀 이동 (v0.5.0) |
| `Shift + Tab` | 편집 완료 → 왼쪽 셀 이동 (v0.5.0) |
| `F2` | 편집 모드 |
| `Escape` | 편집 취소 |
| `Space` | 체크 토글 |

---

## 📊 Excel Export Setup (v0.4.0)

Excel 기능을 사용하려면 SheetJS 라이브러리를 CDN으로 로드하세요:

```html
<script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
```

---

## 📋 Roadmap

- [x] Phase 1-6: 기본 기능, 정렬/필터, 가상 스크롤, 컬럼 고정
- [x] **Phase 7**: Selection 고도화 ✅ (v0.3.0)
- [x] **Phase 8**: Excel Export/Import ✅ (v0.4.0)
- [x] **Phase 9**: Keyboard Enhancement & Undo/Redo ✅ (v0.5.0)
- [ ] Phase 12: Cell Validation, Custom Editor
- [ ] Phase 13: Footer Summary
- [ ] Phase 14: React/Vue 래퍼

## 📝 Changelog

### v0.5.0 (2025-01-26)
- ✅ **Undo/Redo** - Ctrl+Z/Ctrl+Y로 작업 취소/다시 실행
- ✅ **Delete Key** - Delete/Backspace로 선택 셀 내용 삭제
- ✅ **Enter/Tab 이동** - 편집 완료 후 다음 셀로 자동 이동
- ✅ `deleteSelectedCells()`, `deleteSelectedRows()` 메서드 추가
- ✅ `undo()`, `redo()`, `canUndo()`, `canRedo()`, `clearHistory()` 메서드 추가
- ✅ `undoable`, `undoStackSize` 옵션 추가

### v0.4.0 (2025-01-24)
- ✅ Excel Export (.xlsx) - SheetJS 연동
- ✅ Excel Import - 파일에서 데이터 가져오기
- ✅ CSV Export/Import
- ✅ JSON Export
- ✅ Export Options (선택된 행, 필터된 행, 특정 컬럼)

### v0.3.0 (2025-01-24)
- ✅ Selection 고도화 (selectionStyle: row/cell/block/none)
- ✅ CheckBar 분리 (Selection과 독립)
- ✅ Keyboard Navigation
- ✅ Loading State
- ✅ Clipboard (Copy/Paste/Cut)

### v0.2.x
- Virtual Scroll, Fixed Columns, Header Filter UI

---

## 📄 License

MIT License

**bumki** - with 🤖 Claude AI
