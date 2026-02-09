/**
 * VeloxGrid - GridEditorFactory
 * @description Custom cell editor factory for different input types
 * Phase 12.2: Custom Cell Editor
 */

import type { CellValue, EditorOptions } from '../types';

export class GridEditorFactory {
  /**
   * Create an editor element based on type
   */
  static createEditor(
    value: CellValue,
    options: EditorOptions,
    onSave: (value: CellValue) => void,
    onCancel: () => void,
    onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ): HTMLElement {
    const { type } = options;

    switch (type) {
      case 'text':
      case 'number':
        return this.createTextEditor(value, options, onSave, onCancel, onMove);
      case 'select':
        return this.createSelectEditor(value, options, onSave, onCancel, onMove);
      case 'date':
        return this.createDateEditor(value, options, onSave, onCancel, onMove);
      case 'checkbox':
        return this.createCheckboxEditor(value, options, onSave, onCancel, onMove);
      case 'custom':
        return this.createCustomEditor(value, options, onSave, onCancel, onMove);
      default:
        return this.createTextEditor(value, options, onSave, onCancel, onMove);
    }
  }

  /**
   * Create text/number input editor
   */
  private static createTextEditor(
    value: CellValue,
    options: EditorOptions,
    onSave: (value: CellValue) => void,
    onCancel: () => void,
    onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ): HTMLInputElement {
    const input = document.createElement('input');
    input.className = 'velox-edit-input';
    input.type = options.type === 'number' ? 'number' : 'text';
    input.value = value != null ? String(value) : '';

    if (options.placeholder) {
      input.placeholder = options.placeholder;
    }

    if (options.type === 'number') {
      if (options.min !== undefined) input.min = String(options.min);
      if (options.max !== undefined) input.max = String(options.max);
      if (options.step !== undefined) input.step = String(options.step);
    }

    // Event handlers
    input.addEventListener('blur', () => {
      const newValue = options.type === 'number' ? parseFloat(input.value) : input.value;
      onSave(newValue);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const newValue = options.type === 'number' ? parseFloat(input.value) : input.value;
        onSave(newValue);
        if (onMove) onMove(e.shiftKey ? 'up' : 'down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        const newValue = options.type === 'number' ? parseFloat(input.value) : input.value;
        onSave(newValue);
        if (onMove) onMove(e.shiftKey ? 'left' : 'right');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    });

    return input;
  }

  /**
   * Create select dropdown editor
   */
  private static createSelectEditor(
    value: CellValue,
    options: EditorOptions,
    onSave: (value: CellValue) => void,
    onCancel: () => void,
    onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ): HTMLSelectElement {
    const select = document.createElement('select');
    select.className = 'velox-edit-select';

    // Add options
    if (options.options && options.options.length > 0) {
      options.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = String(option.value ?? '');
        optionElement.textContent = option.label;
        if (option.value === value) {
          optionElement.selected = true;
        }
        select.appendChild(optionElement);
      });
    }

    // Event handlers
    select.addEventListener('change', () => {
      console.log('📦 Select change event', select.value);
      onSave(select.value);
    });

    // blur 이벤트 제거 - change만으로 충분 (중복 방지)

    select.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onSave(select.value);
        if (onMove) onMove(e.shiftKey ? 'up' : 'down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        onSave(select.value);
        if (onMove) onMove(e.shiftKey ? 'left' : 'right');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    });

    return select;
  }

  /**
   * Create date input editor
   */
  private static createDateEditor(
    value: CellValue,
    _options: EditorOptions,
    onSave: (value: CellValue) => void,
    onCancel: () => void,
    onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ): HTMLInputElement {
    const input = document.createElement('input');
    input.className = 'velox-edit-input velox-edit-date';
    input.type = 'date';

    // Format date value
    if (value instanceof Date) {
      input.value = value.toISOString().split('T')[0];
    } else if (typeof value === 'string' && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        input.value = date.toISOString().split('T')[0];
      }
    }

    // Event handlers
    input.addEventListener('blur', () => {
      onSave(input.value ? new Date(input.value) : null);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onSave(input.value ? new Date(input.value) : null);
        if (onMove) onMove(e.shiftKey ? 'up' : 'down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        onSave(input.value ? new Date(input.value) : null);
        if (onMove) onMove(e.shiftKey ? 'left' : 'right');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    });

    return input;
  }

  /**
   * Create checkbox editor
   */
  private static createCheckboxEditor(
    value: CellValue,
    _options: EditorOptions,
    onSave: (value: CellValue) => void,
    onCancel: () => void,
    onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = 'velox-edit-checkbox-container';

    const checkbox = document.createElement('input');
    checkbox.className = 'velox-edit-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(value);

    container.appendChild(checkbox);

    // Event handlers
    checkbox.addEventListener('change', () => {
      console.log('📦 Checkbox change event', checkbox.checked);
      onSave(checkbox.checked);
    });

    // blur 이벤트 제거 - change 이벤트로 충분함 (중복 호출 방지)

    checkbox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        checkbox.checked = !checkbox.checked;
        onSave(checkbox.checked);
        if (e.key === 'Enter' && onMove) onMove(e.shiftKey ? 'up' : 'down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        onSave(checkbox.checked);
        if (onMove) onMove(e.shiftKey ? 'left' : 'right');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    });

    return container;
  }

  /**
   * Create custom editor using renderer function
   */
  private static createCustomEditor(
    value: CellValue,
    options: EditorOptions,
    onSave: (value: CellValue) => void,
    onCancel: () => void,
    onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = 'velox-edit-custom';

    if (options.renderer) {
      options.renderer(container, value, onSave, onCancel);
    } else {
      // Fallback to text editor
      return this.createTextEditor(value, { type: 'text' }, onSave, onCancel, onMove);
    }

    return container;
  }
}
