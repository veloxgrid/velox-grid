# Changelog

All notable changes to VeloxGrid will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2025-01-29

### Added - Phase 12: Cell Features Enhancement

#### Phase 12.1: Cell Validation
- Added `GridValidator` module with 7 validation types
- Support for `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, and `custom` validators
- Validation UI feedback with red border and tooltip on error
- Added `onValidationError` event
- Validation errors keep cell in edit mode

#### Phase 12.2: Custom Cell Editor
- Added `GridEditorFactory` module for creating different editor types
- Support for 5 editor types: `text`, `number`, `select`, `date`, `checkbox`, `custom`
- Each editor type has specific CSS styling
- Integrated with `VeloxGrid.renderEditCell()` method
- Keyboard support (Enter, Tab, Escape) for all editors

#### Phase 12.3: Cell Tooltip
- Added `GridTooltip` module for hover information display
- Auto-tooltip for truncated text detection
- Custom tooltip via callback function
- Dynamic positioning with viewport awareness
- Configurable show/hide delays

### Changed
- Updated TypeScript types for new features
- Enhanced CSS with Phase 12 styles (~110 lines added)

### Fixed
- Removed unused TypeScript variables (clean build)
- Fixed editor type handling in `endEdit()` method

### Bundle Size
- UMD: 69.01 KB (gzip: 17.62 KB) - increased from 58.94 KB
- ESM: 93.79 KB (gzip: 21.12 KB) - increased from 79.31 KB
- CSS: 15.40 KB (gzip: 3.05 KB) - increased from 12.26 KB

---

## [0.6.0] - 2025-01-26

### Added - Phase 10-11: Column & Row Features

#### Phase 10: Column Features
- Column Reorder via drag & drop
- Column Menu (context menu) with customizable items
- Column Fix/Unfix dynamically
- Added `fixColumn()` and `reorderColumn()` API methods

#### Phase 11: Row Features
- Row Drag & Drop for reordering
- Added `moveRow()` API method
- Row drag handle UI component

### Changed
- Major refactoring: Modularized core components
- Added `GridHistory`, `GridSelection`, `GridVirtualScroll`, `GridEditor`, `GridKeyboard`, `GridColumnManager`, `GridDataManager` modules
- Implemented column caching system for performance
- Unified row creation with `createRowBase()` method

### Bundle Size
- UMD: 58.94 KB (gzip: 14.92 KB) - increased from 50.50 KB
- ESM: 79.31 KB (gzip: 17.52 KB)
- CSS: 12.26 KB (gzip: 2.50 KB)

---

## [0.5.0] - 2025-01-XX

### Added - Phase 9: Keyboard & Undo/Redo Enhancement

- Enter/Tab navigation (auto-move to next cell after edit)
- Delete key support (clear selected cell contents)
- Undo/Redo functionality (Ctrl+Z / Ctrl+Y)
- Enhanced keyboard shortcuts (Ctrl+C/V/X handling)
- `endEditAndMove()` method for directional navigation
- `deleteSelectedCells()` and `deleteSelectedRows()` methods

### Changed
- Improved keyboard event handling
- Enhanced clipboard operations

### Bundle Size
- UMD: 50.50 KB (gzip: 12.90 KB)

---

## [0.4.0] - 2025-01-XX

### Added - Phase 8: Excel Export/Import

- Excel Export (.xlsx) using SheetJS
- Excel Import from .xlsx files
- CSV Export/Import
- JSON Export
- Export options (headers, selected rows, filtered rows)
- Added `exportToExcel()`, `importFromExcel()`, `exportToCSV()`, `exportToJSON()` methods

### Changed
- SheetJS is now an optional external dependency
- Enhanced export utilities

---

## [0.3.0] - 2025-01-XX

### Added - Phase 7: Selection Enhancement

- Cell Selection (individual cell selection)
- Block Selection (drag to select range, Excel-style)
- CheckBar separation (independent from Selection)
- Exclusive Check (radio button style)
- Checkable Callback (conditional checkability)
- Keyboard Navigation (arrow keys)
- Clipboard operations (Copy/Paste/Cut)
- Loading State indicator
- Auto Fit Column functionality

### Changed
- Enhanced selection system with multiple styles
- Improved keyboard handling
- Added comprehensive selection API

---

## [0.2.0] - 2025-01-XX

### Added - Phase 5-6: Virtual Scroll & Column Advanced Features

- Virtual Scroll for large datasets (100,000+ rows)
- Column Fixed (pin columns to left/right)
- Header Filter UI

### Changed
- Improved performance for large datasets
- Enhanced column features

---

## [0.1.0] - 2025-01-XX

### Added - Phase 1-4: Core Features

- Basic table rendering
- Column definition system
- Row selection (single/multiple)
- Sorting (ascending/descending)
- Filtering
- Inline editing
- Checkbox functionality

### Features
- Framework agnostic (Vanilla JS)
- TypeScript support
- Zero dependencies (except optional SheetJS)
- Lightweight (~30KB initial)

---

## Future Releases

### [0.8.0] - Planned
- Footer Summary (sum, average, count)
- Group Summary (subtotals by group)

### [0.9.0] - Planned
- React wrapper component
- React hooks (useVeloxGrid)
- Enhanced TypeScript types

### [1.0.0] - Planned
- Stable API
- Comprehensive documentation
- Performance optimizations
- Accessibility improvements (ARIA, screen reader support)
- Theme system (Dark theme support)

---

[0.7.0]: https://github.com/bumki/velox-grid/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/bumki/velox-grid/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/bumki/velox-grid/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/bumki/velox-grid/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/bumki/velox-grid/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/bumki/velox-grid/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/bumki/velox-grid/releases/tag/v0.1.0
