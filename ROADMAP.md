# VeloxGrid Feature Roadmap

> VeloxGrid 개발 로드맵 및 Feature 목록

## 📋 목차

- [완료된 Phase](#-완료된-phase-v010--v021)
- [예정된 Phase](#-예정된-phase-v030-)
- [우선순위별 정리](#-우선순위별-정리)
- [권장 구현 순서](#-권장-구현-순서)

---

## ✅ 완료된 Phase (v0.1.0 ~ v0.2.1)

| Phase | 기능 | 상태 | 버전 |
|-------|------|------|------|
| **Phase 1** | 기본 기능 (테이블 렌더링, 컬럼 정의) | ✅ 완료 | v0.1.0 |
| **Phase 2** | 체크박스/선택 (행 선택, 다중 선택) | ✅ 완료 | v0.1.0 |
| **Phase 3** | 정렬/필터링 | ✅ 완료 | v0.1.0 |
| **Phase 4** | 편집 기능 (인라인 편집) | ✅ 완료 | v0.1.0 |
| **Phase 5** | 가상 스크롤 (대용량 데이터 100,000+ 행) | ✅ 완료 | v0.2.0 |
| **Phase 6** | 컬럼 고정, 헤더 필터 UI | ✅ 완료 | v0.2.0 |

---

## 🔜 예정된 Phase (v0.3.0 ~)

### Phase 7: Selection 고도화 (리얼그리드 스타일)

Selection 기능을 리얼그리드 수준으로 고도화합니다.

#### 현재 vs 개선 비교

| Feature | 현재 | 개선 후 |
|---------|------|---------|
| Selection Mode | `single` / `multiple` | `none` / `single` / `multiple` / `extended` |
| Selection Style | row only | `row` / `cell` / `block` / `none` |
| Cell Selection | ❌ | ✅ |
| Block Selection | ❌ | ✅ (드래그) |
| CheckBar 분리 | ❌ (Selection과 통합) | ✅ (독립적) |
| Exclusive Check | ❌ | ✅ (라디오 스타일) |

#### Feature 목록

| Feature | 설명 | Priority |
|---------|------|----------|
| **SelectionStyle 확장** | `'row'` / `'cell'` / `'block'` / `'none'` | 🔴 High |
| **Cell Selection** | 개별 셀 선택 지원 | 🔴 High |
| **Block Selection** | 마우스 드래그로 셀 범위 선택 (엑셀 스타일) | 🟡 Medium |
| **CheckBar 분리** | Selection과 Check 기능 분리 | 🔴 High |
| **Exclusive Check** | 라디오 버튼 스타일 (단일 체크) | 🟡 Medium |
| **Checkable Callback** | 조건부 체크 가능 여부 | 🟡 Medium |
| **Extended Mode** | 다중 독립 선택 영역 (Ctrl+드래그) | 🟢 Low |
| **Column Selection** | 컬럼 헤더 클릭으로 컬럼 전체 선택 | 🟢 Low |

#### 새로운 Options

```typescript
interface GridOptions {
  // Selection 관련
  selectable: boolean;
  selectionMode: 'none' | 'single' | 'multiple' | 'extended';
  selectionStyle: 'row' | 'cell' | 'block' | 'none';
  
  // CheckBar 관련 (Selection과 분리)
  checkBar: {
    visible: boolean;
    exclusive: boolean;      // true면 라디오 버튼 스타일
    showAll: boolean;        // 헤더에 전체 선택 체크박스
    checkableCallback?: (rowData: RowData, rowIndex: number) => boolean;
  };
}
```

#### 새로운 API

```typescript
// Cell Selection
selectCell(rowIndex: number, field: string, selected?: boolean): void;
getSelectedCells(): CellIndex[];

// Block Selection
setSelection(selection: Selection): void;
getSelection(): Selection | null;
getSelections(): Selection[];  // 다중 선택 영역
addSelection(selection: Selection): void;

// Selection Data
getSelectionData(): CellValue[][];  // 클립보드 복사용

// CheckBar API (Selection과 분리)
checkItem(index: number, checked?: boolean): void;
checkItems(indices: number[], checked?: boolean): void;
checkAll(checked?: boolean): void;
getCheckedItems(): number[];
getCheckedData(): RowData[];
isItemChecked(index: number): boolean;
setCheckable(index: number, checkable: boolean): void;

// Types
interface Selection {
  style: 'row' | 'cell' | 'block';
  startRow: number;
  endRow: number;
  startColumn?: string;
  endColumn?: string;
}

interface CellIndex {
  rowIndex: number;
  field: string;
}
```

---

### Phase 8: Excel Export/Import

| Feature | 설명 | Priority |
|---------|------|----------|
| **Excel Export** | 그리드 데이터를 .xlsx 파일로 내보내기 | 🔴 High |
| **Excel Import** | .xlsx 파일 데이터를 그리드로 가져오기 | 🔴 High |
| **CSV Export/Import** | CSV 형식 지원 | 🟡 Medium |
| **Export Options** | 헤더 포함, 선택된 행만, 필터된 행만 등 | 🟡 Medium |
| **스타일 Export** | 셀 스타일, 병합 등 Excel 서식 유지 | 🟢 Low |

#### 새로운 API

```typescript
exportToExcel(options?: ExportOptions): void;
exportToCSV(options?: ExportOptions): void;
importFromExcel(file: File): Promise<void>;
importFromCSV(file: File): Promise<void>;

interface ExportOptions {
  filename?: string;
  includeHeader?: boolean;
  selectedOnly?: boolean;
  filteredOnly?: boolean;
  columns?: string[];  // 특정 컬럼만
}
```

---

### Phase 9: 클립보드 & 키보드

| Feature | 설명 | Priority |
|---------|------|----------|
| **Copy (Ctrl+C)** | 선택 영역 클립보드 복사 | 🔴 High |
| **Paste (Ctrl+V)** | 클립보드 데이터 붙여넣기 | 🔴 High |
| **Cut (Ctrl+X)** | 선택 영역 잘라내기 | 🟡 Medium |
| **Keyboard Navigation** | 화살표 키로 셀 이동 | 🔴 High |
| **Enter/Tab 이동** | 편집 완료 후 다음 셀 이동 | 🟡 Medium |
| **Delete Key** | 선택 행/셀 삭제 | 🟡 Medium |
| **Undo/Redo** | Ctrl+Z / Ctrl+Y | 🟢 Low |

#### 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| `Arrow Keys` | 셀 이동 |
| `Shift + Arrow` | 선택 영역 확장 |
| `Ctrl + A` | 전체 선택 |
| `Ctrl + C` | 복사 |
| `Ctrl + V` | 붙여넣기 |
| `Ctrl + X` | 잘라내기 |
| `Ctrl + Z` | 실행 취소 |
| `Ctrl + Y` | 다시 실행 |
| `Enter` | 편집 시작/완료 |
| `Escape` | 편집 취소 |
| `Tab` | 다음 셀로 이동 |
| `Delete` | 선택 삭제 |
| `F2` | 셀 편집 모드 |

---

### Phase 10: 컬럼 기능 확장

| Feature | 설명 | Priority |
|---------|------|----------|
| **Column Reorder** | 드래그로 컬럼 순서 변경 | 🟡 Medium |
| **Column Group** | 다단계 헤더 그룹 | 🟡 Medium |
| **Auto Fit** | 컬럼 너비 자동 조절 | 🔴 High |
| **Column Freeze Right** | 오른쪽 컬럼 고정 | 🟢 Low |
| **Column Menu** | 컬럼 헤더 컨텍스트 메뉴 | 🟡 Medium |
| **Column Visibility Toggle** | 컬럼 표시/숨김 UI | 🟡 Medium |

#### 새로운 API

```typescript
// Column Reorder
moveColumn(fromIndex: number, toIndex: number): void;
setColumnOrder(fields: string[]): void;

// Auto Fit
autoFitColumn(field: string): void;
autoFitAllColumns(): void;

// Column Group
interface ColumnGroup {
  header: string;
  children: (ColumnDefinition | ColumnGroup)[];
}
```

---

### Phase 11: 행 기능 확장

| Feature | 설명 | Priority |
|---------|------|----------|
| **Row Grouping** | 특정 필드 기준 행 그룹화 | 🟡 Medium |
| **Row Drag & Drop** | 드래그로 행 순서 변경 | 🟡 Medium |
| **Row Detail** | 행 확장하여 상세 정보 표시 | 🟢 Low |
| **Row Merge** | 동일 값 셀 병합 | 🟢 Low |
| **Master-Detail** | 마스터-디테일 그리드 | 🟢 Low |

#### 새로운 API

```typescript
// Row Grouping
groupBy(field: string): void;
ungroupBy(field: string): void;
expandGroup(groupKey: string): void;
collapseGroup(groupKey: string): void;

// Row Drag & Drop
moveRow(fromIndex: number, toIndex: number): void;

// Row Detail
expandRow(index: number): void;
collapseRow(index: number): void;
setRowDetail(renderer: (row: RowData) => string | HTMLElement): void;
```

---

### Phase 12: 셀 기능 확장

| Feature | 설명 | Priority |
|---------|------|----------|
| **Cell Merge** | 셀 병합 | 🟡 Medium |
| **Cell Tooltip** | 셀 호버 시 툴팁 표시 | 🟡 Medium |
| **Cell Validation** | 입력값 검증 | 🔴 High |
| **Conditional Styling** | 조건부 셀 스타일 | 🟡 Medium |
| **Custom Cell Editor** | 커스텀 에디터 (드롭다운, 날짜 등) | 🔴 High |
| **Cell Comment** | 셀 코멘트 (노트) | 🟢 Low |

#### 새로운 Editor Types

```typescript
interface ColumnDefinition {
  editor?: {
    type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'multiline';
    options?: any[];       // dropdown용
    format?: string;       // date용 (예: 'YYYY-MM-DD')
    min?: number;          // number용
    max?: number;          // number용
    maxLength?: number;    // text용
    placeholder?: string;
  };
  
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    validator?: (value: any, row: RowData) => boolean | string;
  };
  
  tooltip?: string | ((value: any, row: RowData) => string);
}
```

---

### Phase 13: 합계/집계

| Feature | 설명 | Priority |
|---------|------|----------|
| **Footer Summary** | 하단에 합계/평균/개수 표시 | 🔴 High |
| **Group Summary** | 그룹별 소계 | 🟡 Medium |
| **Custom Aggregation** | 사용자 정의 집계 함수 | 🟢 Low |

#### 새로운 Options

```typescript
interface GridOptions {
  footer?: {
    visible: boolean;
    items: FooterItem[];
  };
}

interface FooterItem {
  field: string;
  type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
  label?: string;
  formatter?: (value: number) => string;
  calculator?: (data: RowData[]) => number;  // custom용
}

// 사용 예시
{
  footer: {
    visible: true,
    items: [
      { field: 'salary', type: 'sum', label: '합계', formatter: v => `₩${v.toLocaleString()}` },
      { field: 'age', type: 'avg', label: '평균' },
      { field: 'id', type: 'count', label: '건수' }
    ]
  }
}
```

---

### Phase 14: Framework 래퍼

| Feature | 설명 | Priority |
|---------|------|----------|
| **React Component** | React 전용 컴포넌트 | 🔴 High |
| **Vue Component** | Vue 3 전용 컴포넌트 | 🟡 Medium |
| **Angular Component** | Angular 전용 컴포넌트 | 🟢 Low |

#### React Component 예시

```tsx
import { VeloxGrid, useVeloxGrid } from 'velox-grid/react';

function MyGrid() {
  const { gridRef, selectedRows, setData } = useVeloxGrid();
  
  return (
    <VeloxGrid
      ref={gridRef}
      columns={columns}
      data={data}
      height={500}
      onSelectionChange={(rows) => console.log(rows)}
      onCellEditEnd={(event) => console.log(event)}
    />
  );
}
```

#### Vue Component 예시

```vue
<template>
  <VeloxGrid
    :columns="columns"
    :data="data"
    :height="500"
    @selection-change="onSelectionChange"
    @cell-edit-end="onCellEditEnd"
  />
</template>

<script setup>
import { VeloxGrid } from 'velox-grid/vue';
</script>
```

---

### Phase 15: 기타 기능

| Feature | 설명 | Priority |
|---------|------|----------|
| **Context Menu** | 우클릭 컨텍스트 메뉴 | 🟡 Medium |
| **Loading State** | 로딩 인디케이터 | 🔴 High |
| **Empty State** | 빈 데이터 상태 커스터마이징 | ✅ 완료 |
| **Pagination** | 페이지네이션 | 🟡 Medium |
| **Infinite Scroll** | 무한 스크롤 (데이터 추가 로드) | 🟡 Medium |
| **Print** | 인쇄 기능 | 🟢 Low |
| **Localization** | 다국어 지원 | 🟢 Low |
| **Accessibility** | 접근성 (ARIA) | 🟡 Medium |
| **Dark Theme** | 다크 모드 기본 제공 | 🟡 Medium |

#### Context Menu 예시

```typescript
{
  contextMenu: {
    items: [
      { id: 'copy', label: '복사', icon: '📋', shortcut: 'Ctrl+C' },
      { id: 'paste', label: '붙여넣기', icon: '📄', shortcut: 'Ctrl+V' },
      { type: 'separator' },
      { id: 'delete', label: '삭제', icon: '🗑️' },
    ],
    onItemClick: (itemId, context) => { ... }
  }
}
```

---

## 📊 우선순위별 정리

### 🔴 High Priority (v0.3.0 ~ v0.4.0)

| # | Feature | Phase | 예상 버전 |
|---|---------|-------|-----------|
| 1 | Cell Selection | Phase 7 | v0.3.0 |
| 2 | CheckBar 분리 | Phase 7 | v0.3.0 |
| 3 | Keyboard Navigation | Phase 9 | v0.3.0 |
| 4 | Excel Export | Phase 8 | v0.4.0 |
| 5 | Copy/Paste (Ctrl+C/V) | Phase 9 | v0.4.0 |
| 6 | Column Auto Fit | Phase 10 | v0.4.0 |
| 7 | Cell Validation | Phase 12 | v0.5.0 |
| 8 | Custom Cell Editor | Phase 12 | v0.5.0 |
| 9 | Footer Summary | Phase 13 | v0.5.0 |
| 10 | React Component | Phase 14 | v0.6.0 |
| 11 | Loading State | Phase 15 | v0.3.0 |

### 🟡 Medium Priority (v0.5.0 ~ v0.6.0)

| # | Feature | Phase |
|---|---------|-------|
| 1 | Block Selection (드래그) | Phase 7 |
| 2 | Exclusive Check (라디오) | Phase 7 |
| 3 | Checkable Callback | Phase 7 |
| 4 | Excel Import | Phase 8 |
| 5 | CSV Export/Import | Phase 8 |
| 6 | Enter/Tab 이동 | Phase 9 |
| 7 | Delete Key | Phase 9 |
| 8 | Column Reorder | Phase 10 |
| 9 | Column Group | Phase 10 |
| 10 | Column Menu | Phase 10 |
| 11 | Row Grouping | Phase 11 |
| 12 | Row Drag & Drop | Phase 11 |
| 13 | Cell Merge | Phase 12 |
| 14 | Cell Tooltip | Phase 12 |
| 15 | Conditional Styling | Phase 12 |
| 16 | Group Summary | Phase 13 |
| 17 | Vue Component | Phase 14 |
| 18 | Context Menu | Phase 15 |
| 19 | Pagination | Phase 15 |
| 20 | Infinite Scroll | Phase 15 |
| 21 | Accessibility | Phase 15 |
| 22 | Dark Theme | Phase 15 |

### 🟢 Low Priority (v0.7.0+)

| # | Feature | Phase |
|---|---------|-------|
| 1 | Extended Selection Mode | Phase 7 |
| 2 | Column Selection | Phase 7 |
| 3 | 스타일 Export | Phase 8 |
| 4 | Undo/Redo | Phase 9 |
| 5 | Column Freeze Right | Phase 10 |
| 6 | Row Detail | Phase 11 |
| 7 | Row Merge | Phase 11 |
| 8 | Master-Detail | Phase 11 |
| 9 | Cell Comment | Phase 12 |
| 10 | Custom Aggregation | Phase 13 |
| 11 | Angular Component | Phase 14 |
| 12 | Print | Phase 15 |
| 13 | Localization | Phase 15 |

---

## 🚀 권장 구현 순서

### v0.3.0 - Selection 고도화
```
├── SelectionStyle (row/cell)
├── Cell Selection API
├── CheckBar 분리
├── Keyboard Navigation 기본
└── Loading State
```

### v0.4.0 - Excel & Clipboard
```
├── Excel Export
├── Copy/Paste
├── CSV Export
├── Block Selection
└── Column Auto Fit
```

### v0.5.0 - 편집 고도화
```
├── Cell Validation
├── Custom Editor (dropdown, date)
├── Footer Summary
└── Cell Tooltip
```

### v0.6.0 - React 래퍼
```
├── React Component
├── Hooks (useVeloxGrid)
├── TypeScript 지원 강화
└── Dark Theme
```

### v0.7.0 - 컬럼/행 확장
```
├── Column Reorder
├── Column Group
├── Row Grouping
└── Context Menu
```

### v0.8.0 - 고급 기능
```
├── Vue Component
├── Row Drag & Drop
├── Cell Merge
└── Pagination
```

---

## 📝 참고 사항

### 리얼그리드 Selection 구조

리얼그리드는 두 가지 축으로 Selection을 관리합니다:

1. **SelectionMode** (선택 방식)
   - `none` - 선택 불가
   - `single` - 단일 선택만
   - `extended` - 다중 선택 (Ctrl/Shift)

2. **SelectionStyle** (선택 단위)
   - `none` - 선택 영역 없음
   - `block` - 셀 블록 선택
   - `rows` - 행 단위 선택
   - `columns` - 컬럼 단위 선택
   - `singleRow` - 단일 행
   - `singleColumn` - 단일 컬럼

### 경쟁 제품 비교

| Feature | RealGrid | AG Grid | VeloxGrid (목표) |
|---------|----------|---------|-----------------|
| Virtual Scroll | ✅ | ✅ | ✅ |
| Cell Selection | ✅ | ✅ | 🔜 |
| Block Selection | ✅ | ✅ | 🔜 |
| Excel Export | ✅ | ✅ (Enterprise) | 🔜 |
| Row Grouping | ✅ | ✅ | 🔜 |
| Column Reorder | ✅ | ✅ | 🔜 |
| React Support | ❌ | ✅ | 🔜 |
| 번들 크기 | ~500KB | ~1MB | ~30KB |
| 라이선스 | 상용 | 상용 | MIT |

---

*Last Updated: 2025-01-24*
