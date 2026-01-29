# VeloxGrid 🚀

A fast, lightweight, and framework-agnostic data grid library.

> **Velox** (Latin) = "Fast" - Pursuing fast and lightweight data grid.

[![npm version](https://img.shields.io/npm/v/velox-grid.svg)](https://www.npmjs.com/package/velox-grid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/velox-grid)](https://bundlephobia.com/package/velox-grid)

## ✨ Features

- 🎯 **Framework Agnostic** - Works with Vanilla JS, React, Vue, Angular, and more
- 🚀 **Virtual Scroll** - Handle large datasets (100,000+ rows)
- 📦 **Zero Dependencies** - No external dependencies (except optional SheetJS for Excel)
- 🎨 **Customizable** - Easy theming with CSS Variables
- 📝 **TypeScript** - Full TypeScript support
- ⚡ **Lightweight** - ~69KB minified (~18KB gzipped)

### Core Features

- ✅ **Cell Selection** - Individual cell and block selection (v0.3.0)
- ⌨️ **Keyboard Navigation** - Arrow keys, shortcuts (v0.3.0)
- 📊 **Excel Export/Import** - Export/Import Excel, CSV, JSON (v0.4.0)
- ↩️ **Undo/Redo** - Ctrl+Z / Ctrl+Y support (v0.5.0)
- 🔄 **Column Reorder** - Drag & drop column reordering (v0.6.0)
- 📋 **Row Drag & Drop** - Reorder rows via drag & drop (v0.6.0)
- ✔️ **Cell Validation** - Input validation with multiple rules (v0.7.0)
- 🎛️ **Custom Editors** - Dropdown, date picker, checkbox editors (v0.7.0)
- 💬 **Cell Tooltip** - Hover tooltips for cells (v0.7.0)

## 📦 Installation

```bash
npm install velox-grid
```

## 🚀 Quick Start

### CDN (Browser)

```html
<link rel="stylesheet" href="https://unpkg.com/velox-grid@0.7.0/dist/velox-grid.css">
<script src="https://unpkg.com/velox-grid@0.7.0/dist/velox-grid.iife.js"></script>

<div id="grid"></div>

<script>
  const grid = new VeloxGrid.VeloxGrid('#grid', {
    columns: [
      { field: 'id', header: 'ID', type: 'number', width: 60 },
      { field: 'name', header: 'Name', type: 'text', width: 120 },
      { field: 'email', header: 'Email', type: 'text', width: 200, 
        editable: true,
        validation: [
          { type: 'required', message: 'Email is required' },
          { type: 'pattern', value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, message: 'Invalid email format' }
        ]
      },
      { field: 'age', header: 'Age', type: 'number', width: 80 },
    ],
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com', age: 28 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 32 },
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
      header: 'Status', 
      editable: true,
      editor: {
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' }
        ]
      }
    },
    { 
      field: 'date', 
      header: 'Date', 
      editable: true,
      editor: { type: 'date' }
    },
  ],
  data: [...],
});
```

## 📚 Core API

### Grid Options

```typescript
interface GridOptions {
  columns: ColumnDefinition[];
  data?: RowData[];
  width?: number | string;
  height?: number | string;
  rowHeight?: number;
  headerHeight?: number;
  
  // Selection
  selectable?: boolean;
  selectionMode?: 'none' | 'single' | 'multiple' | 'extended';
  selectionStyle?: 'row' | 'cell' | 'block' | 'none';
  
  // CheckBar (v0.3.0)
  checkBar?: {
    visible: boolean;
    exclusive?: boolean;      // Radio button style
    showAll?: boolean;        // Show select-all checkbox
    checkableCallback?: (row: RowData, index: number) => boolean;
  };
  
  // Features
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
  
  // Features
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  resizable?: boolean;
  fixed?: 'left' | 'right' | false;
  visible?: boolean;
  
  // Rendering
  formatter?: (value: CellValue, row: RowData, column: ColumnDefinition) => string;
  renderer?: (value: CellValue, row: RowData, column: ColumnDefinition) => string;
  cellClass?: string | ((value: CellValue, row: RowData) => string);
  
  // Validation (v0.7.0)
  validation?: ValidationRule[];
  
  // Custom Editor (v0.7.0)
  editor?: EditorOptions;
  
  // Tooltip (v0.7.0)
  tooltip?: boolean | ((value: CellValue, row: RowData) => string);
}
```

### Validation Rules (v0.7.0)

```typescript
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  message: string;
  validator?: (value: CellValue, row: RowData) => boolean | string;
}

// Example
{
  field: 'email',
  validation: [
    { type: 'required', message: 'Email is required' },
    { type: 'pattern', value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, message: 'Invalid email' }
  ]
}
```

### Custom Editors (v0.7.0)

```typescript
interface EditorOptions {
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'custom';
  options?: Array<{ value: CellValue; label: string }>;  // For 'select'
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  renderer?: (cell: HTMLElement, value: CellValue, save: (v: CellValue) => void, cancel: () => void) => void;
}

// Example
{
  field: 'category',
  editor: {
    type: 'select',
    options: [
      { value: 'A', label: 'Category A' },
      { value: 'B', label: 'Category B' }
    ]
  }
}
```

### Methods

```typescript
// Data
getData(): RowData[]
setData(data: RowData[]): void
addRow(row: RowData, index?: number): void
updateRow(index: number, data: Partial<RowData>): void
removeRow(index: number): void
clearData(): void

// Selection
getSelectedRows(): number[]
selectRow(index: number, selected?: boolean): void
selectAll(selected?: boolean): void
clearSelection(): void

// Cell Selection (v0.3.0)
getSelectedCells(): CellIndex[]
selectCell(rowIndex: number, field: string, selected?: boolean): void
setFocusedCell(rowIndex: number, field: string): void
getSelectionData(): CellValue[][]

// CheckBar (v0.3.0)
checkItem(index: number, checked?: boolean): void
checkAll(checked?: boolean): void
getCheckedItems(): number[]
getCheckedData(): RowData[]

// Column
getColumn(field: string): ColumnDefinition | null
setColumnWidth(field: string, width: number): void
showColumn(field: string): void
hideColumn(field: string): void
autoFitColumn(field: string): void
fixColumn(field: string, position: 'left' | 'right' | false): void  // v0.6.0
reorderColumn(sourceField: string, targetField: string): void       // v0.6.0

// Row
moveRow(fromIndex: number, toIndex: number): void  // v0.6.0

// Clipboard (v0.3.0)
copy(): void
paste(): void
cut(): void

// Undo/Redo (v0.5.0)
undo(): boolean
redo(): boolean
canUndo(): boolean
canRedo(): boolean
clearHistory(): void

// Export/Import (v0.4.0)
exportToExcel(options?: ExportOptions): void
importFromExcel(file: File, sheetIndex?: number): Promise<ImportResult>
exportToCSV(options?: ExportOptions): string
downloadCSV(options?: ExportOptions): void

// Utility
refresh(): void
setLoading(loading: boolean): void
destroy(): void
```

### Events

```typescript
interface GridEvents {
  onReady?: (grid: VeloxGridInstance) => void;
  onDataChange?: (data: RowData[]) => void;
  
  // Row
  onRowClick?: (index: number, row: RowData) => void;
  onRowDoubleClick?: (index: number, row: RowData) => void;
  onRowSelect?: (index: number, selected: boolean) => void;
  onSelectionChange?: (selectedRows: number[]) => void;
  
  // Cell
  onCellClick?: (rowIndex: number, field: string, value: CellValue) => void;
  onCellSelect?: (cell: CellIndex, selected: boolean) => void;
  onCellSelectionChange?: (selectedCells: CellIndex[]) => void;
  
  // Edit
  onCellEditStart?: (rowIndex: number, field: string, value: CellValue) => void;
  onCellEditEnd?: (event: CellEditEvent) => void;
  onCellEditCancel?: (rowIndex: number, field: string) => void;
  onValidationError?: (event: ValidationErrorEvent) => void;  // v0.7.0
  
  // CheckBar
  onCheckChange?: (index: number, checked: boolean) => void;
  onCheckAllChange?: (checked: boolean) => void;
  
  // Data operations
  onRowAdd?: (row: RowData, index: number) => void;
  onRowUpdate?: (row: RowData, index: number, changes: Partial<RowData>) => void;
  onRowRemove?: (row: RowData, index: number) => void;
  
  // Column
  onColumnResize?: (field: string, width: number) => void;
  onColumnReorder?: (sourceField: string, sourceIndex: number, targetIndex: number) => void;  // v0.6.0
  
  // Clipboard
  onCopy?: (data: string[][]) => void;
  onPaste?: (data: string[][], focusedCell: CellIndex) => void;
  onCut?: (data: string[][]) => void;
  
  // Undo/Redo
  onUndo?: (action: UndoAction) => void;
  onRedo?: (action: UndoAction) => void;
  
  // Other
  onSort?: (sortState: SortState[]) => void;
  onFilter?: (filterState: FilterState) => void;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  onDestroy?: () => void;
}
```

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Arrow Keys` | Navigate cells |
| `Shift + Arrow` | Extend selection |
| `Ctrl + A` | Select all |
| `Ctrl + C` | Copy |
| `Ctrl + V` | Paste |
| `Ctrl + X` | Cut |
| `Ctrl + Z` | Undo (v0.5.0) |
| `Ctrl + Y` | Redo (v0.5.0) |
| `Enter / F2` | Start editing |
| `Escape` | Cancel editing |
| `Tab` | Next cell (in edit mode) |
| `Delete` | Clear cell content (v0.5.0) |
| `Space` | Toggle checkbox |
| `Home / End` | First / Last cell |
| `Ctrl + Home/End` | First / Last row |
| `Page Up/Down` | Page navigation |

## 📊 Bundle Size

| Version | UMD | Gzipped |
|---------|-----|---------|
| v0.7.0 | 69.0 KB | 17.6 KB |
| v0.6.0 | 58.9 KB | 14.9 KB |
| v0.5.0 | 50.5 KB | 12.9 KB |

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed feature plans.

### Upcoming Features

- **v0.8.0**: Footer Summary, Group Summary
- **v0.9.0**: React Wrapper Component
- **v1.0.0**: Stable API, Accessibility, Theme System

## 📄 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT © [bumki](https://github.com/bumki)

## 🔗 Links

- [GitHub Repository](https://github.com/bumki/velox-grid)
- [NPM Package](https://www.npmjs.com/package/velox-grid)
- [Demo](https://bumki.github.io/velox-grid/)
- [Documentation](https://github.com/bumki/velox-grid/wiki)

## 💬 Support

- [Issues](https://github.com/bumki/velox-grid/issues)
- [Discussions](https://github.com/bumki/velox-grid/discussions)

---

**Made with ❤️ by bumki**
