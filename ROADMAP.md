# VeloxGrid 로드맵

> VeloxGrid의 향후 개발 계획 및 기능 로드맵

**현재 버전**: v0.12.0  
**마지막 업데이트**: 2025-02-20

---

## 🎯 프로젝트 목표

VeloxGrid는 빠르고 가벼우며 프레임워크 독립적인 데이터 그리드 라이브러리를 목표로 합니다.

### 핵심 가치
- ⚡ **성능**: 가상 스크롤로 100,000+ 행 처리
- 📦 **경량화**: 70KB 이하 유지 (gzip ~18KB)
- 🎯 **독립성**: Zero Dependencies (선택적 SheetJS 제외)
- 🔧 **확장성**: 모듈화된 아키텍처
- 🌐 **범용성**: Framework Agnostic

---

## 📊 현재 상태 (v0.12.0)

### 완료된 주요 기능
- ✅ 가상 스크롤 (Phase 5)
- ✅ 셀/블록 선택 (Phase 7)
- ✅ Excel Export/Import (Phase 8)
- ✅ Undo/Redo (Phase 9)
- ✅ 컬럼/행 재정렬 (Phase 10-11)
- ✅ 셀 검증 & 커스텀 에디터 (Phase 12)
- ✅ Summary/Aggregation (Phase 13)
- ✅ Fixed Columns (Phase 14)
- ✅ Enhanced Keyboard Navigation (Phase 15.1)
- ✅ Framework Wrappers - React & Vue 3 (Phase 17)
- ✅ Server-Side Data & Pagination (Phase 18)
- ✅ Column Group 다단계 헤더 (Phase 19)
- ✅ 코드 구조 최적화 - VeloxGrid.ts 모듈화

### 번들 크기
- **IIFE**: 117.12 KB (gzip: 28.36 KB)
- **ESM**: 164.20 KB (gzip: 37.04 KB)
- **CSS**: 23.60 KB (gzip: 4.13 KB)

---

## 🗺️ 향후 로드맵

### 🔴 Phase 20: Cell Merge (v0.13.0) - 높은 우선순위

**예상 시기**: 2025년 3월

#### 셀 병합
```typescript
interface MergeOptions {
  rowSpan?: number;
  colSpan?: number;
}
```

**주요 기능**
- 셀 병합/해제
- 병합된 셀의 렌더링
- 병합된 셀의 편집/선택 처리

**예상 작업량**: 중간~높음

---

### 🟡 Phase 21: 고급 기능 - 중간 우선순위

**예상 시기**: 2025년 4월~5월

#### 21.1 Row Grouping (행 그룹화)
```typescript
interface GroupOptions {
  field: string;
  collapsed?: boolean;
  sortOrder?: 'asc' | 'desc';
  aggregates?: AggregateConfig[];
}
```
- 필드 기준 행 그룹화
- 접기/펼치기
- 그룹별 소계
- 다단계 그룹

#### 21.2 Row Detail (행 상세)
```typescript
interface RowDetailOptions {
  renderer: (row: RowData) => HTMLElement | string;
  height?: number | 'auto';
}
```
- 행 확장 시 상세 정보 표시
- 커스텀 렌더러
- 중첩 그리드 지원

**예상 작업량**: 높음  
**번들 크기 영향**: +10~15KB

---

## 🎨 v1.0.0 목표

**예상 시기**: 2025년 하반기

### 안정화 및 최적화

#### 성능 최적화
- [ ] 렌더링 최적화 (requestAnimationFrame)
- [ ] 메모리 사용 최적화
- [ ] 번들 크기 최적화 (Tree-shaking)
- [ ] 벤치마크 및 성능 테스트

#### 접근성 (Accessibility)
- [ ] ARIA 속성 추가
- [ ] 키보드 내비게이션 완성
- [ ] 스크린 리더 지원
- [ ] 고대비 모드 지원
- [ ] WCAG 2.1 AA 준수

#### 테마 시스템
- [ ] Dark 테마
- [ ] Compact 테마
- [ ] Material Design 테마
- [ ] CSS Variables 확장
- [ ] 테마 빌더 도구

#### 문서화
- [ ] API 전체 문서
- [ ] 예제 갤러리
- [ ] 마이그레이션 가이드
- [ ] 성능 가이드
- [ ] Storybook 통합

#### 품질 보증
- [ ] 단위 테스트 커버리지 80%+
- [ ] E2E 테스트
- [ ] 브라우저 호환성 테스트
- [ ] 모바일 터치 지원

---

## 🚀 릴리즈 전략

### 버전 정책
- **Major (x.0.0)**: Breaking Changes, 주요 아키텍처 변경
- **Minor (0.x.0)**: 새로운 기능 추가, 하위 호환성 유지
- **Patch (0.0.x)**: 버그 수정, 문서 업데이트

### 릴리즈 주기
- **Phase 완료 시**: Minor 버전 업데이트
- **버그 수정**: 필요 시 Patch 버전 업데이트
- **주요 마일스톤**: Major 버전 업데이트

---

## 📈 경쟁 제품 비교 목표

| 기능 | RealGrid | AG Grid | VeloxGrid v0.12 |
|------|----------|---------|-----------------|
| Virtual Scroll | ✅ | ✅ | ✅ |
| Cell/Block Selection | ✅ | ✅ | ✅ |
| Excel Export/Import | ✅ | ✅ (Enterprise) | ✅ |
| Cell Validation | ✅ | ✅ | ✅ |
| Custom Editors | ✅ | ✅ | ✅ |
| Row Grouping | ✅ | ✅ | 🔜 (v0.13+) |
| Column Grouping | ✅ | ✅ | ✅ |
| Footer Summary | ✅ | ✅ | ✅ |
| Fixed Columns | ✅ | ✅ | ✅ |
| Pagination | ✅ | ✅ | ✅ |
| React Support | ❌ | ✅ | ✅ |
| Vue Support | ❌ | ✅ | ✅ |
| 번들 크기 | ~500KB | ~1MB | **~117KB** |
| 라이선스 | 상용 | 상용 (Community는 무료) | **MIT (무료)** |

---

## 🎯 장기 비전 (v2.0+)

### 고급 데이터 시각화
- 차트 통합 (인라인 차트)
- 히트맵
- 스파크라인
- 조건부 서식 강화

### 서버 사이드 통합
- 서버 사이드 정렬/필터링
- 무한 스크롤 (페이지네이션)
- 실시간 데이터 업데이트 (WebSocket)

### 고급 편집 기능
- 셀 병합
- 복수 행/열 삽입/삭제
- 드래그 앤 드롭 데이터 이동
- 수식 지원 (Excel-like)

### 모바일 최적화
- 터치 제스처
- 반응형 레이아웃
- 모바일 전용 UI

### 플러그인 시스템
- 커스텀 플러그인 API
- 써드파티 통합
- 마켓플레이스

---

## 💡 커뮤니티 기여

### 환영하는 기여
- 버그 리포트
- 기능 제안
- 문서 개선
- 예제 추가
- 테스트 작성
- 성능 최적화

### 기여 방법
1. GitHub 이슈 생성
2. Pull Request 제출
3. 토론 참여

---

## 📞 피드백

로드맵에 대한 의견이나 제안이 있으시면:
- [GitHub Issues](https://github.com/bart-idea/velox-grid/issues)
- [GitHub Discussions](https://github.com/bart-idea/velox-grid/discussions)

---

**이 로드맵은 계획이며 변경될 수 있습니다.**

*마지막 업데이트: 2025-02-20 (v0.12.0 기준)*
