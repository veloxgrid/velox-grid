/**
 * GridHistory Tests
 * @description Undo/Redo 스택 동작 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GridHistory } from '../src/core/GridHistory';

describe('GridHistory', () => {
  let history: GridHistory;

  beforeEach(() => {
    history = new GridHistory({ enabled: true, maxSize: 50 });
  });

  // ============================================
  // 기본 동작
  // ============================================

  describe('기본 동작', () => {
    it('초기 상태: undo/redo 불가', () => {
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
      expect(history.getUndoCount()).toBe(0);
      expect(history.getRedoCount()).toBe(0);
    });

    it('push 후 undo 가능', () => {
      history.push({ type: 'cell_edit', timestamp: Date.now(), data: {} });
      expect(history.canUndo()).toBe(true);
      expect(history.getUndoCount()).toBe(1);
    });

    it('popUndo 후 redo 가능', () => {
      history.push({ type: 'cell_edit', timestamp: Date.now(), data: {} });
      const action = history.popUndo();
      expect(action).not.toBeNull();
      expect(action!.type).toBe('cell_edit');
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
    });

    it('popRedo 후 undo 가능', () => {
      history.push({ type: 'cell_edit', timestamp: Date.now(), data: {} });
      history.popUndo();
      const action = history.popRedo();
      expect(action).not.toBeNull();
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);
    });
  });

  // ============================================
  // 새 액션 시 redo 스택 초기화
  // ============================================

  describe('redo 스택 초기화', () => {
    it('새 push 시 redo 스택 비워짐', () => {
      history.push({ type: 'cell_edit', timestamp: 1, data: {} });
      history.push({ type: 'cell_edit', timestamp: 2, data: {} });
      history.popUndo(); // redo에 1개
      expect(history.canRedo()).toBe(true);

      history.push({ type: 'cell_edit', timestamp: 3, data: {} }); // 새 액션
      expect(history.canRedo()).toBe(false); // redo 스택 초기화됨
    });
  });

  // ============================================
  // maxSize 제한
  // ============================================

  describe('maxSize 제한', () => {
    it('스택 크기 초과 시 오래된 항목 제거', () => {
      const small = new GridHistory({ enabled: true, maxSize: 3 });
      small.push({ type: 'cell_edit', timestamp: 1, data: { id: 1 } });
      small.push({ type: 'cell_edit', timestamp: 2, data: { id: 2 } });
      small.push({ type: 'cell_edit', timestamp: 3, data: { id: 3 } });
      small.push({ type: 'cell_edit', timestamp: 4, data: { id: 4 } });

      expect(small.getUndoCount()).toBe(3);
      // 가장 오래된 (id:1)이 제거됨 → 첫 번째는 id:2
      const last = small.popUndo();
      expect((last!.data as any).id).toBe(4);
    });

    it('setMaxSize로 동적 변경', () => {
      history.push({ type: 'cell_edit', timestamp: 1, data: {} });
      history.push({ type: 'cell_edit', timestamp: 2, data: {} });
      history.push({ type: 'cell_edit', timestamp: 3, data: {} });
      
      history.setMaxSize(2);
      expect(history.getUndoCount()).toBe(2);
    });
  });

  // ============================================
  // enabled 상태
  // ============================================

  describe('enabled 상태', () => {
    it('disabled 시 push 무시', () => {
      history.setEnabled(false);
      history.push({ type: 'cell_edit', timestamp: Date.now(), data: {} });
      expect(history.getUndoCount()).toBe(0);
      expect(history.canUndo()).toBe(false);
    });

    it('disabled 시 popUndo null 반환', () => {
      history.push({ type: 'cell_edit', timestamp: Date.now(), data: {} });
      history.setEnabled(false);
      expect(history.popUndo()).toBeNull();
    });

    it('disabled 시 popRedo null 반환', () => {
      history.push({ type: 'cell_edit', timestamp: Date.now(), data: {} });
      history.popUndo();
      history.setEnabled(false);
      expect(history.popRedo()).toBeNull();
    });
  });

  // ============================================
  // 헬퍼 메서드
  // ============================================

  describe('헬퍼 메서드', () => {
    it('pushCellEdit', () => {
      history.pushCellEdit(0, 'name', 'old', 'new');
      expect(history.getUndoCount()).toBe(1);
      const action = history.popUndo();
      expect(action!.type).toBe('cell_edit');
      const data = action!.data as any;
      expect(data.rowIndex).toBe(0);
      expect(data.field).toBe('name');
      expect(data.oldValue).toBe('old');
      expect(data.newValue).toBe('new');
    });

    it('pushBulkEdit - 빈 changes 무시', () => {
      history.pushBulkEdit('paste', []);
      expect(history.getUndoCount()).toBe(0);
    });

    it('pushBulkEdit - 정상 동작', () => {
      history.pushBulkEdit('paste', [
        { rowIndex: 0, field: 'name', oldValue: 'a', newValue: 'b' },
      ]);
      expect(history.getUndoCount()).toBe(1);
      const action = history.popUndo();
      expect(action!.type).toBe('paste');
    });

    it('pushRowAdd', () => {
      history.pushRowAdd({ name: 'Alice' }, 0);
      const action = history.popUndo();
      expect(action!.type).toBe('row_add');
      const data = action!.data as any;
      expect(data.row.name).toBe('Alice');
      expect(data.index).toBe(0);
    });

    it('pushRowRemove', () => {
      history.pushRowRemove({ name: 'Bob' }, 1);
      const action = history.popUndo();
      expect(action!.type).toBe('row_remove');
      const data = action!.data as any;
      expect(data.row.name).toBe('Bob');
      expect(data.index).toBe(1);
    });
  });

  // ============================================
  // clear
  // ============================================

  describe('clear', () => {
    it('모든 스택 초기화', () => {
      history.push({ type: 'cell_edit', timestamp: 1, data: {} });
      history.push({ type: 'cell_edit', timestamp: 2, data: {} });
      history.popUndo(); // redo에 1개

      history.clear();
      expect(history.getUndoCount()).toBe(0);
      expect(history.getRedoCount()).toBe(0);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });

  // ============================================
  // 연속 undo/redo
  // ============================================

  describe('연속 undo/redo', () => {
    it('여러 번 undo 후 redo 순서 보존', () => {
      history.pushCellEdit(0, 'a', 'v1', 'v2');
      history.pushCellEdit(1, 'b', 'v3', 'v4');
      history.pushCellEdit(2, 'c', 'v5', 'v6');

      // undo 3번
      const u1 = history.popUndo();
      expect((u1!.data as any).field).toBe('c');
      const u2 = history.popUndo();
      expect((u2!.data as any).field).toBe('b');
      const u3 = history.popUndo();
      expect((u3!.data as any).field).toBe('a');

      expect(history.canUndo()).toBe(false);
      expect(history.getRedoCount()).toBe(3);

      // redo 3번 (역순)
      const r1 = history.popRedo();
      expect((r1!.data as any).field).toBe('a');
      const r2 = history.popRedo();
      expect((r2!.data as any).field).toBe('b');
      const r3 = history.popRedo();
      expect((r3!.data as any).field).toBe('c');

      expect(history.canRedo()).toBe(false);
    });
  });
});
