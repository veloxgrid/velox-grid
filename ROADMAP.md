# VeloxGrid Feature Roadmap

> VeloxGrid 개발 로드맵 및 Feature 목록

## 📋 목차

- [완료된 Phase](#-완료된-phase-v010--v030)
- [예정된 Phase](#-예정된-phase-v040-)
- [우선순위별 정리](#-우선순위별-정리)

---

## ✅ 완료된 Phase (v0.1.0 ~ v0.3.0)

| Phase | 기능 | 상태 | 버전 |
|-------|------|------|------|
| **Phase 1** | 기본 기능 (테이블 렌더링, 컬럼 정의) | ✅ 완료 | v0.1.0 |
| **Phase 2** | 체크박스/선택 (행 선택, 다중 선택) | ✅ 완료 | v0.1.0 |
| **Phase 3** | 정렬/필터링 | ✅ 완료 | v0.1.0 |
| **Phase 4** | 편집 기능 (인라인 편집) | ✅ 완료 | v0.1.0 |
| **Phase 5** | 가상 스크롤 (대용량 데이터 100,000+ 행) | ✅ 완료 | v0.2.0 |
| **Phase 6** | 컬럼 고정, 헤더 필터 UI | ✅ 완료 | v0.2.0 |
| **Phase 7** | Selection 고도화 (Cell/Block Selection, CheckBar 분리, Keyboard Navigation) | ✅ 완료 | v0.3.0 |

---

## ✅ Phase 7 상세 (v0.3.0) - Selection 고도화

### 구현 완료된 기능

| Feature | 설명 | 상태 |
|---------|------|------|
| **SelectionStyle 확장** | `'row'` / `'cell'` / `'block'` / `'none'` | ✅ 완료 |
| **Cell Selection** | 개별 셀 선택 지원 | ✅ 완료 |
| **Block Selection** | 마우스 드래그로 셀 범위 선택 (엑셀 스타일) | ✅ 완료 |
| **CheckBar 분리** | Selection과 Check 기능 분리 | ✅ 완료 |
| **Exclusive Check** | 라디오 버튼 스타일 (단일 체크) | ✅ 완료 |
| **Checkable Callback** | 조건부 체크 가능 여부 | ✅ 완료 |
| **Keyboard Navigation** | 화살표 키로 셀 이동 | ✅ 완료 |
| **Loading State** | 로딩 인디케이터 | ✅ 완료 |
| **Clipboard 기본** | Copy/Paste/Cut | ✅ 완료 |
| **Auto Fit Column** | 컬럼 너비 자동 조절 | ✅ 완료 |

### 새로운 Options

```typescript
interface GridOptions {
  selectable: boolean;
  selectionMode: 'none' | 'single' | 'multiple' | 'extended';
  selectionStyle: 'row' | 'cell' | 'block' | 'none';
  
  checkBar: {
    visible: boolean;
    exclusive: boolean;      // true면 라디오 버튼 스타일
    showAll: boolean;        // 헤더에 전체 선택 체크박스
    checkableCallback?: (rowData: RowData, rowIndex: number) => boolean;
  };
  
  loading: boolean;
  loadingMessage: string;
}
```

### 새로운 API

```typescript
// Cell Selection
selectCell(rowIndex: number, field: string, selected?: boolean): void;
getSelectedCells(): CellIndex[];
setFocusedCell(rowIndex: number, field: string): void;
getFocusedCell(): CellIndex | null;
setSelection(selection: Selection): void;
getSelection(): Selection | null;
getSelectionData(): CellValue[][];

// CheckBar API
checkItem(index: number, checked?: boolean): void;
checkItems(indices: number[], checked?: boolean): void;
checkAll(checked?: boolean): void;
uncheckAll(): void;
getCheckedItems(): number[];
getCheckedData(): RowData[];
isItemChecked(index: number): boolean;
isItemCheckable(index: number): boolean;

// Column
autoFitColumn(field: string): void;
autoFitAllColumns(): void;

// Scroll
scrollToCell(rowIndex: number, field: string): void;

// Loading
setLoading(loading: boolean): void;

// Clipboard
copy(): void;
paste(): void;
cut(): void;
```

### 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| `Arrow Keys` | 셀 이동 |
| `Shift + Arrow` | 선택 영역 확장 |
| `Ctrl + A` | 전체 선택 |
| `Ctrl + C` | 복사 |
| `Ctrl + V` | 붙여넣기 |
| `Ctrl + X` | 잘라내기 |
| `Enter / F2` | 편집 시작 |
| `Escape` | 편집 취소 |
| `Space` | 체크 토글 |
| `Home / End` | 첫/끝 셀 |
| `Ctrl + Home/End` | 첫/끝 행 |
| `Page Up/Down` | 페이지 이동 |

---

## 🔜 예정된 Phase (v0.4.0 ~)

### Phase 8: Excel Export/Import

| Feature | 설명 | Priority |
|---------|------|----------|
| **Excel Export** | 그리드 데이터를 .xlsx 파일로 내보내기 | 🔴 High |
| **Excel Import** | .xlsx 파일 데이터를 그리드로 가져오기 | 🔴 High |
| **CSV Export/Import** | CSV 형식 지원 | 🟡 Medium |
| **Export Options** | 헤더 포함, 선택된 행만, 필터된 행만 등 | 🟡 Medium |

---

### Phase 9: 클립보드 & 키보드 고도화

| Feature | 설명 | Priority |
|---------|------|----------|
| **Enter/Tab 이동** | 편집 완료 후 다음 셀 이동 | 🟡 Medium |
| **Delete Key** | 선택 행/셀 삭제 | 🟡 Medium |
| **Undo/Redo** | Ctrl+Z / Ctrl+Y | 🟢 Low |

---

### Phase 10: 컬럼 기능 확장

| Feature | 설명 | Priority |
|---------|------|----------|
| **Column Reorder** | 드래그로 컬럼 순서 변경 | 🟡 Medium |
| **Column Group** | 다단계 헤더 그룹 | 🟡 Medium |
| **Column Menu** | 컬럼 헤더 컨텍스트 메뉴 | 🟡 Medium |

---

### Phase 11: 행 기능 확장

| Feature | 설명 | Priority |
|---------|------|----------|
| **Row Grouping** | 특정 필드 기준 행 그룹화 | 🟡 Medium |
| **Row Drag & Drop** | 드래그로 행 순서 변경 | 🟡 Medium |
| **Row Detail** | 행 확장하여 상세 정보 표시 | 🟢 Low |

---

### Phase 12: 셀 기능 확장

| Feature | 설명 | Priority |
|---------|------|----------|
| **Cell Validation** | 입력값 검증 | 🔴 High |
| **Custom Cell Editor** | 커스텀 에디터 (드롭다운, 날짜 등) | 🔴 High |
| **Cell Tooltip** | 셀 호버 시 툴팁 표시 | 🟡 Medium |

---

### Phase 13: 합계/집계

| Feature | 설명 | Priority |
|---------|------|----------|
| **Footer Summary** | 하단에 합계/평균/개수 표시 | 🔴 High |
| **Group Summary** | 그룹별 소계 | 🟡 Medium |

---

### Phase 14: Framework 래퍼

| Feature | 설명 | Priority |
|---------|------|----------|
| **React Component** | React 전용 컴포넌트 | 🔴 High |
| **Vue Component** | Vue 3 전용 컴포넌트 | 🟡 Medium |

---

## 📊 우선순위별 정리

### 🔴 High Priority (v0.4.0 ~ v0.5.0)

| # | Feature | Phase | 예상 버전 |
|---|---------|-------|-----------|
| 1 | Excel Export | Phase 8 | v0.4.0 |
| 2 | Excel Import | Phase 8 | v0.4.0 |
| 3 | Cell Validation | Phase 12 | v0.5.0 |
| 4 | Custom Cell Editor | Phase 12 | v0.5.0 |
| 5 | Footer Summary | Phase 13 | v0.5.0 |
| 6 | React Component | Phase 14 | v0.6.0 |

### 🟡 Medium Priority (v0.5.0 ~ v0.7.0)

| # | Feature | Phase |
|---|---------|-------|
| 1 | CSV Export/Import | Phase 8 |
| 2 | Enter/Tab 이동 | Phase 9 |
| 3 | Column Reorder | Phase 10 |
| 4 | Row Grouping | Phase 11 |
| 5 | Vue Component | Phase 14 |

---

## 🚀 권장 구현 순서

### v0.4.0 - Excel & CSV
```
├── Excel Export (SheetJS)
├── Excel Import
├── CSV Export/Import
└── Export Options
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

---

## 📝 참고 사항

### 경쟁 제품 비교

| Feature | RealGrid | AG Grid | VeloxGrid |
|---------|----------|---------|-----------|
| Virtual Scroll | ✅ | ✅ | ✅ |
| Cell Selection | ✅ | ✅ | ✅ (v0.3.0) |
| Block Selection | ✅ | ✅ | ✅ (v0.3.0) |
| CheckBar 분리 | ✅ | ✅ | ✅ (v0.3.0) |
| Keyboard Navigation | ✅ | ✅ | ✅ (v0.3.0) |
| Excel Export | ✅ | ✅ (Enterprise) | 🔜 |
| Row Grouping | ✅ | ✅ | 🔜 |
| React Support | ❌ | ✅ | 🔜 |
| 번들 크기 | ~500KB | ~1MB | ~30KB |
| 라이선스 | 상용 | 상용 | MIT |

---

*Last Updated: 2025-01-24 (Phase 7 완료)*
