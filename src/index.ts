/**
 * VeloxGrid
 * A fast, lightweight, and framework-agnostic data grid library
 * 
 * @author bumki
 * @license MIT
 * @version 0.7.0
 */

// Core
export { VeloxGrid } from './core';

// Types
export type {
  // Value types
  ValueType,
  CellValue,
  RowData,
  
  // Column
  ColumnDefinition,
  
  // Options
  GridOptions,
  
  // Sort & Filter
  SortDirection,
  SortState,
  FilterOperator,
  FilterCondition,
  FilterState,
  
  // Selection
  SelectionState,
  SelectionMode,
  SelectionStyle,
  CellIndex,
  Selection,
  CheckBarOptions,
  CheckBarState,
  
  // Edit
  EditState,
  CellEditEvent,
  
  // Export/Import (Phase 8)
  ExportOptions,
  ImportResult,
  
  // Events
  GridEvents,
  
  // Instance
  VeloxGridInstance,
  
  // Internal (for extension)
  GridState,
  RenderContext,
} from './types';

// Utilities (for extension)
export {
  createElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setStyles,
  throttle,
  debounce,
} from './utils/dom';

export {
  deepClone,
  generateId,
  formatValue,
  parseValue,
  compareValues,
  sortData,
  filterData,
  escapeHtml,
} from './utils/data';

// Export utilities (Phase 8)
export {
  exportToExcel,
  exportToCSV,
  exportToJSON,
  downloadFile,
  downloadCSV,
  downloadJSON,
  parseCSV,
  importFromExcel,
  importFromExcelBySheetName,
  isSheetJSAvailable,
  type ExportContext,
} from './utils/export';

// Styles
import './styles/velox-grid.css';

// Version
export const VERSION = '0.7.0';
