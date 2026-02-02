# 변경 이력

VeloxGrid의 모든 주요 변경사항은 이 파일에 문서화됩니다.

이 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [0.7.1] - 2025-02-02 (개발 중)

### 수정 - Edit 모드 안정화

#### 편집 중 셀 클릭 시 Edit 모드 유지
- 편집 중인 셀/input 클릭 시 edit 모드가 해제되던 문제 수정
- Document mousedown 이벤트로 외부 클릭 감지
- Cell 내부 클릭은 edit 모드 유지
- Interactive 요소(input, select, button, textarea) 클릭 시 기능 허용

#### Checkbox Editor 다중 클릭 지원
- Checkbox를 여러 번 클릭 시 edit 모드가 해제되던 문제 수정
- Checkbox editor는 change 시에도 edit 모드 유지
- 데이터 업데이트 후 edit 상태 복원 및 재렌더링
- 외부 클릭 시에만 edit 종료

#### Document 리스너 중복 방지
- `renderEditCell` 호출 시마다 document 리스너가 누적 등록되던 문제 수정
- `editModeCleanup` 변수로 이전 리스너 추적 및 정리
- 새 edit 시작 시 이전 리스너 자동 제거

#### 더블클릭 이벤트 처리
- 빠른 연속 클릭이 더블클릭으로 인식되어 edit 재시작되던 문제 수정
- 이미 editing 중인 셀의 더블클릭 무시
- `startEdit`에서 같은 셀 편집 중이면 무시

#### CheckBar 상태 변경 시 Edit 보존
- CheckBar의 checkbox 클릭 시 edit 모드가 해제되던 문제 수정
- `checkItem()` 호출 시 edit 상태 백업 및 복원
- Exclusive mode에서도 edit 상태 보존

#### Editor 타입별 중복 이벤트 제거
- Select editor: blur 이벤트 제거 (change와 중복)
- Checkbox editor: blur 이벤트 제거 (change와 중복)

### 개선 - 개발 환경

#### 핫 리로드 지원
- `examples/dev.html` 추가: 소스 파일 직접 import
- Vite HMR로 실시간 코드 변경 반영
- `vite.config.ts`: 개발 서버 기본 페이지를 dev.html로 변경

## [0.7.0] - 2025-01-29 ~ 2025-02-02

### 정리 - 코드 정리 (2025-02-02)

#### 미사용 모듈 삭제
- `GridEventManager.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridSelection.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridVirtualScroll.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridEditor.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridKeyboard.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridColumnManager.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridDataManager.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `GridState.ts` 삭제 (VeloxGrid 자체 구현 사용)
- `VeloxGrid.ts.backup` 삭제

#### 결과
- 빌드 모듈 수: 22개 → 15개 (-7개)
- 소스 파일: ~60KB 삭제
- Core 모듈 수: 10개로 정리

### 추가 - Phase 12: 셀 기능 확장

#### Phase 12.1: 셀 검증
- 7가지 검증 타입을 가진 `GridValidator` 모듈 추가
- `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `custom` 검증자 지원
- 오류 시 빨간 테두리와 툴팁으로 검증 UI 피드백 제공
- `onValidationError` 이벤트 추가
- 검증 오류 시 셀이 편집 모드 유지

#### Phase 12.2: 커스텀 셀 에디터
- 다양한 에디터 타입 생성을 위한 `GridEditorFactory` 모듈 추가
- 5가지 에디터 타입 지원: `text`, `number`, `select`, `date`, `checkbox`, `custom`
- 각 에디터 타입별 전용 CSS 스타일링
- `VeloxGrid.renderEditCell()` 메서드와 통합
- 모든 에디터에 키보드 지원 (Enter, Tab, Escape)

#### Phase 12.3: 셀 툴팁
- 호버 정보 표시를 위한 `GridTooltip` 모듈 추가
- 잘린 텍스트 감지를 위한 자동 툴팁
- 콜백 함수를 통한 커스텀 툴팁
- 뷰포트 인식을 통한 동적 위치 설정
- 구성 가능한 표시/숨김 지연 시간

### 추가 - 코드 구조 최적화 (Phase 1-7)

#### VeloxGrid.ts 모듈화
- **VeloxGrid.ts**: 2,826줄 → 2,044줄 (27.7% 감소)
- **GridContext 인터페이스**: 모듈 간 통신을 위한 표준화된 인터페이스 정의
- **GridRenderer.ts**: 렌더링 담당 모듈 분리 (482줄)
- **GridFilterPopup.ts**: 필터 팝업 UI 모듈 분리 (191줄)
- **GridColumnMenu.ts**: 컬럼 메뉴 UI 모듈 분리 (188줄)
- **GridDragManager.ts**: 드래그 & 리사이즈 모듈 분리 (364줄)

#### CSS 모듈화
- 11개 파일로 CSS 분리 (유지보수성 향상)
- `_variables.css`, `_base.css`, `_header.css`, `_body.css`, `_selection.css`
- `_filter.css`, `_column-menu.css`, `_drag.css`, `_editor.css`, `_tooltip.css`, `_loading.css`
- 빌드 시 자동 번들링 (최종 CSS 파일 크기 변화 없음)

### 변경
- 새 기능을 위한 TypeScript 타입 업데이트
- Phase 12 스타일로 CSS 강화 (~110줄 추가)

### 수정
- 사용하지 않는 TypeScript 변수 제거 (깔끔한 빌드)
- `endEdit()` 메서드의 에디터 타입 처리 수정

### 번들 크기
- UMD: 71.35 KB (gzip: 18.23 KB) - 58.94 KB에서 증가
- ESM: 98.05 KB (gzip: 22.32 KB) - 79.31 KB에서 증가
- CSS: 15.38 KB (gzip: 3.06 KB) - 12.26 KB에서 증가

---

## [0.6.0] - 2025-01-26

### 추가 - Phase 10-11: 컬럼 & 행 기능

#### Phase 10: 컬럼 기능
- 드래그 앤 드롭을 통한 컬럼 재정렬
- 커스터마이징 가능한 항목이 있는 컬럼 메뉴(컨텍스트 메뉴)
- 동적으로 컬럼 고정/고정 해제
- `fixColumn()` 및 `reorderColumn()` API 메서드 추가

#### Phase 11: 행 기능
- 재정렬을 위한 행 드래그 앤 드롭
- `moveRow()` API 메서드 추가
- 행 드래그 핸들 UI 컴포넌트

### 변경
- 주요 리팩토링: 핵심 컴포넌트 모듈화
- `GridHistory`, `GridSelection`, `GridVirtualScroll`, `GridEditor`, `GridKeyboard`, `GridColumnManager`, `GridDataManager` 모듈 추가
- 성능을 위한 컬럼 캐싱 시스템 구현
- `createRowBase()` 메서드로 행 생성 통합

### 번들 크기
- UMD: 58.94 KB (gzip: 14.92 KB) - 50.50 KB에서 증가
- ESM: 79.31 KB (gzip: 17.52 KB)
- CSS: 12.26 KB (gzip: 2.50 KB)

---

## [0.5.0] - 2025-01-XX

### 추가 - Phase 9: 키보드 & 실행 취소/다시 실행 향상

- Enter/Tab 내비게이션 (편집 후 다음 셀로 자동 이동)
- Delete 키 지원 (선택된 셀 내용 삭제)
- 실행 취소/다시 실행 기능 (Ctrl+Z / Ctrl+Y)
- 향상된 키보드 단축키 (Ctrl+C/V/X 처리)
- 방향 내비게이션을 위한 `endEditAndMove()` 메서드
- `deleteSelectedCells()` 및 `deleteSelectedRows()` 메서드

### 변경
- 향상된 키보드 이벤트 처리
- 개선된 클립보드 작업

### 번들 크기
- UMD: 50.50 KB (gzip: 12.90 KB)

---

## [0.4.0] - 2025-01-XX

### 추가 - Phase 8: Excel 내보내기/가져오기

- SheetJS를 사용한 Excel 내보내기 (.xlsx)
- .xlsx 파일에서 Excel 가져오기
- CSV 내보내기/가져오기
- JSON 내보내기
- 내보내기 옵션 (헤더, 선택된 행, 필터된 행)
- `exportToExcel()`, `importFromExcel()`, `exportToCSV()`, `exportToJSON()` 메서드 추가

### 변경
- SheetJS는 이제 선택적 외부 의존성
- 향상된 내보내기 유틸리티

---

## [0.3.0] - 2025-01-XX

### 추가 - Phase 7: 선택 기능 향상

- 셀 선택 (개별 셀 선택)
- 블록 선택 (드래그하여 범위 선택, Excel 스타일)
- CheckBar 분리 (Selection과 독립적)
- 단독 체크 (라디오 버튼 스타일)
- 체크 가능 콜백 (조건부 체크 가능 여부)
- 키보드 내비게이션 (방향키)
- 클립보드 작업 (복사/붙여넣기/잘라내기)
- 로딩 상태 인디케이터
- 자동 컬럼 너비 조정 기능

### 변경
- 다양한 스타일로 선택 시스템 향상
- 개선된 키보드 처리
- 포괄적인 선택 API 추가

---

## [0.2.0] - 2025-01-XX

### 추가 - Phase 5-6: 가상 스크롤 & 컬럼 고급 기능

- 대용량 데이터셋을 위한 가상 스크롤 (100,000+ 행)
- 컬럼 고정 (왼쪽/오른쪽에 컬럼 고정)
- 헤더 필터 UI

### 변경
- 대용량 데이터셋에 대한 성능 향상
- 향상된 컬럼 기능

---

## [0.1.0] - 2025-01-XX

### 추가 - Phase 1-4: 핵심 기능

- 기본 테이블 렌더링
- 컬럼 정의 시스템
- 행 선택 (단일/다중)
- 정렬 (오름차순/내림차순)
- 필터링
- 인라인 편집
- 체크박스 기능

### 기능
- 프레임워크 독립적 (Vanilla JS)
- TypeScript 지원
- Zero Dependencies (선택적 SheetJS 제외)
- 경량화 (~30KB 초기)

---

## 향후 릴리즈

### [0.8.0] - 계획됨
- 푸터 요약 (합계, 평균, 개수)
- 그룹 요약 (그룹별 소계)

### [0.9.0] - 계획됨
- React 래퍼 컴포넌트
- React 훅 (useVeloxGrid)
- 향상된 TypeScript 타입

### [1.0.0] - 계획됨
- 안정적인 API
- 종합적인 문서
- 성능 최적화
- 접근성 개선 (ARIA, 스크린 리더 지원)
- 테마 시스템 (다크 테마 지원)

---

[0.7.0]: https://github.com/bart-idea/velox-grid/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/bart-idea/velox-grid/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/bart-idea/velox-grid/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/bart-idea/velox-grid/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/bart-idea/velox-grid/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/bart-idea/velox-grid/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/bart-idea/velox-grid/releases/tag/v0.1.0
