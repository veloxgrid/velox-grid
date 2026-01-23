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
- ⚡ **Lightweight** - ~30KB (minified)
- 🔲 **Cell Selection** - 셀 단위 선택, 블록 선택 지원 (v0.3.0)
- ⌨️ **Keyboard Navigation** - 화살표 키, 단축키 지원 (v0.3.0)

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

### Selection Types (v0.3.0)

```typescript
type SelectionMode = 'none' | 'single' | 'multiple' | 'extended';
type SelectionStyle = 'row' | 'cell' | 'block' | 'none';
```

### CheckBar Options (v0.3.0)

```typescript
interface CheckBarOptions {
  visible: boolean;
  exclusive?: boolean;           // 라디오 버튼 스타일
  showAll?: boolean;             // 전체 선택 체크박스
  checkableCallback?: (row, index) => boolean;
}
```

### Methods

#### Cell Selection (v0.3.0)

```typescript
grid.selectCell(rowIndex, field, selected?): void
grid.getSelectedCells(): CellIndex[]
grid.setFocusedCell(rowIndex, field): void
grid.getFocusedCell(): CellIndex | null
grid.getSelectionData(): CellValue[][]
```

#### CheckBar (v0.3.0)

```typescript
grid.checkItem(index, checked?): void
grid.checkItems(indices, checked?): void
grid.checkAll(checked?): void
grid.uncheckAll(): void
grid.getCheckedItems(): number[]
grid.getCheckedData(): RowData[]
```

#### Clipboard (v0.3.0)

```typescript
grid.copy(): void
grid.paste(): void
grid.cut(): void
```

---

## ⌨️ Keyboard Shortcuts (v0.3.0)

| 단축키 | 동작 |
|--------|------|
| `↑ ↓ ← →` | 셀 이동 |
| `Shift + Arrow` | 선택 영역 확장 |
| `Ctrl + A` | 전체 선택 |
| `Ctrl + C/V/X` | 복사/붙여넣기/잘라내기 |
| `Enter / F2` | 편집 모드 |
| `Escape` | 편집 취소 |
| `Space` | 체크 토글 |

---

## 📋 Roadmap

- [x] Phase 1-6: 기본 기능, 정렬/필터, 가상 스크롤, 컬럼 고정
- [x] **Phase 7**: Selection 고도화 ✅ (v0.3.0)
- [ ] Phase 8: Excel Export/Import
- [ ] Phase 9: Clipboard 고도화, Undo/Redo
- [ ] Phase 14: React/Vue 래퍼

## 📝 Changelog

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
