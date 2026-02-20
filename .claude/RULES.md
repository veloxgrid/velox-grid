# VeloxGrid 프로젝트 작업 규칙

> Claude AI가 VeloxGrid 프로젝트 작업 시 참고해야 할 규칙과 정보

## 📁 프로젝트 정보

- **프로젝트 경로**: `D:\Dev\git\velox-grid`
- **GitHub**: https://github.com/veloxgrid/velox-grid
- **작성자**: veloxgrid (veloxgrid@gmail.com)
- **OS**: Windows
- **현재 버전**: v0.7.1

---

## 📋 문서 작성 규칙

### 기본 원칙
- ✅ **모든 문서는 한글로 작성**
- ✅ 기술 용어는 영어 유지 (예: API, TypeScript, Git)
- ✅ 코드 예제는 영어로 작성 (변수명, 주석 제외)
- ✅ GitHub 경로: https://github.com/veloxgrid/velox-grid
- ✅ 작성자: veloxgrid

### 주요 문서
| 파일 | 언어 | 용도 |
|------|------|------|
| README.md | 한글 | 프로젝트 소개, 사용법 |
| CHANGELOG.md | 한글 | 버전 변경 이력 |
| ROADMAP.md | 한글 | 향후 계획 |
| .claude/PROGRESS.md | 한글 | 개발 진행 상황 |
| .claude/RULES.md | 한글 | 이 파일 |

### 문서 관리 규칙

#### 문서별 목적과 역할

**PROGRESS.md** (.claude/PROGRESS.md):
- **목적**: 개발 진행 상황 추적, AI 컨텍스트
- **독자**: 개발자, Claude AI
- **내용**: 
  - 작업 이력 (시간순)
  - 버그 수정 상세 내역
  - 코드 최적화 기록
  - 다음 작업 계획
  - 기술적 의사결정

**README.md**:
- **목적**: 프로젝트 소개, 사용 가이드
- **독자**: 일반 사용자, 잠재 사용자
- **내용**:
  - 프로젝트 개요
  - 설치 방법
  - 사용 예제
  - API 문서
  - 기능 목록
  - 라이선스

#### 선택적 동기화 규칙

**⚠️ 중요**: 두 문서는 **목적이 다르므로** 전체를 동기화하지 않고, **특정 정보만 선택적으로 동기화**합니다.

**동기화가 필요한 정보**:

| 정보 | PROGRESS.md | README.md | 동기화 방법 |
|------|-------------|-----------|------------|
| 버전 번호 | "프로젝트 현황" → **현재 버전** | 상단 뱃지 또는 소개 | package.json과 일치 |
| 번들 크기 | "프로젝트 현황" → **빌드 정보** | "특징" 또는 "성능" 섹션 | 최신 빌드 결과 반영 |
| 새 기능 | "최근 작업 이력" → Phase 완료 | "기능" + "API 문서" 추가 | 사용자 관점으로 재작성 |
| Live Demo | "프로젝트 현황" → **Live Demo** | 상단 링크 | URL 일치 |
| 프로젝트 구조 | "프로젝트 현황" → **구조** | "프로젝트 구조" (선택) | 사용자에게 필요시만 |

**동기화가 불필요한 정보**:

| 정보 | PROGRESS.md만 | README.md만 |
|------|--------------|-------------|
| 작업 이력 | ✅ 상세 기록 | ❌ 불필요 |
| 버그 수정 상세 | ✅ 기술 상세 | ❌ 불필요 |
| 코드 최적화 | ✅ 리팩토링 기록 | ❌ 불필요 |
| 설치 방법 | ❌ 불필요 | ✅ npm install |
| 사용 예제 | ❌ 불필요 | ✅ 코드 예제 |
| 브라우저 지원 | ❌ 불필요 | ✅ 지원 목록 |

#### 업데이트 워크플로우

**Phase 완료 시**:
```
1. PROGRESS.md 업데이트
   - "최근 작업 이력"에 Phase 완료 기록
   - "현재 상태"에 완료 체크
   - 번들 크기 업데이트

2. README.md 업데이트 (선택적)
   - "기능" 섹션에 새 기능 추가 (사용자 관점)
   - "API 문서"에 새 API 추가 (사용 예제)
   - 번들 크기 동기화 (특징 섹션)
   - 버전 정보 동기화 (package.json 기준)

3. CHANGELOG.md 추가
   - 버전별 변경 사항 기록

4. Git 커밋
```

**버그 수정 시**:
```
1. PROGRESS.md 업데이트
   - "최근 작업 이력"에 버그 수정 기록
   - 상세한 문제/해결 방법 기록

2. README.md 업데이트 (필요시)
   - 사용자에게 영향이 있는 중요 버그만
   - Breaking change가 있는 경우만

3. CHANGELOG.md 추가
```

**README.md 업데이트 체크리스트** (Phase 완료 시):
- [ ] 버전 번호 확인 (package.json과 일치)
- [ ] 번들 크기 동기화 (PROGRESS.md → README.md)
- [ ] 새 기능을 **사용자 관점**으로 재작성
- [ ] API 문서에 **사용 예제** 추가
- [ ] 기존 예제 코드가 여전히 작동하는지 확인
- [ ] Live Demo 링크 확인
- [ ] 설치 방법 변경사항 확인

---

## 🛠️ Claude AI 작업 도구 규칙

### 파일 시스템 작업

#### ✅ 파일 읽기
```
도구: Filesystem:read_file
용도: 파일 내용 읽기
옵션: head, tail, offset 사용 가능
```

#### ✅ 파일 쓰기
```
도구: Filesystem:write_file
용도: 새 파일 생성 또는 전체 덮어쓰기
주의: 기존 파일 덮어쓰므로 신중하게 사용
```

#### ✅ 파일 수정
```
도구: Filesystem:edit_file
용도: 파일 일부 수정 (str_replace)
규칙:
  - oldText와 newText는 정확히 일치해야 함
  - 공백, 들여쓰기까지 정확히 매칭
  - 큰 변경은 여러 번 나눠서 수정
```

#### ✅ 디렉토리 작업
```
도구: Filesystem:list_directory
용도: 디렉토리 내용 확인
```

### 명령 실행 규칙

#### ✅ Shell 선택
```
Windows: cmd (필수)
사용 금지: powershell (인코딩 문제)
```

#### ✅ 경로 이동
```cmd
:: 올바른 방법
cd /d D:\Dev\git\velox-grid

:: 잘못된 방법 (드라이브 변경 안됨)
cd D:\Dev\git\velox-grid
```

#### ✅ 명령 실행
```
도구: Desktop Commander:start_process
shell: cmd (필수)
timeout_ms: 작업에 맞게 설정

예제:
command: cd /d D:\Dev\git\velox-grid & npm run build
shell: cmd
timeout_ms: 30000
```

---

## 💾 Git 작업 규칙

### 기본 명령어

```cmd
:: 1. 상태 확인
cd /d D:\Dev\git\velox-grid & git status

:: 2. 변경사항 스테이징
cd /d D:\Dev\git\velox-grid & git add -A

:: 3. 커밋 (파일 사용)
cd /d D:\Dev\git\velox-grid & git commit -F commit-msg.txt

:: 4. 푸시
cd /d D:\Dev\git\velox-grid & git push origin main

:: 5. 로그 확인
cd /d D:\Dev\git\velox-grid & git log --oneline -5
```

### ⚠️ 중요: 커밋 메시지 작성 규칙

**한글이나 특수문자가 포함된 커밋 메시지는 반드시 파일을 통해 전달해야 합니다.**

#### ❌ 잘못된 방법 (오류 발생)
```cmd
git commit -m "feat: 한글 메시지"
git commit -m "feat: Phase 12 완료"
```

#### ✅ 올바른 방법
```cmd
1. commit-msg.txt 파일 생성 (Filesystem:write_file 사용)
2. git commit -F commit-msg.txt 실행
3. 커밋 후 commit-msg.txt는 자동으로 git에 의해 처리됨
```

### 커밋 메시지 형식

```
feat(phaseN): 간략한 영문 설명 vX.X.X

상세 설명 (한글 가능):
- 변경 내용 1
- 변경 내용 2
- 변경 내용 3

Bundle Size:
- UMD: XX.XX KB (gzip: XX.XX KB)

Files Added:
- src/core/NewModule.ts
- examples/demo.html

Files Modified:
- src/core/VeloxGrid.ts
- src/types/index.ts
```

### Git 커밋 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| feat | 새 기능 추가 | `feat(phase12): add cell validation` |
| fix | 버그 수정 | `fix: resolve tooltip positioning` |
| refactor | 리팩토링 | `refactor: modularize grid components` |
| docs | 문서 수정 | `docs: update README with v0.7.0 features` |
| style | 코드 포맷팅 | `style: apply prettier formatting` |
| test | 테스트 추가 | `test: add validation tests` |
| chore | 빌드/설정 변경 | `chore: update vite config` |

---

## 🔄 작업 진행 순서

### 1. 작업 시작 전
```
1. .claude/PROGRESS.md 파일 읽기
2. 현재 버전 및 완료된 Phase 확인
3. 다음 작업할 Phase 내용 파악
4. .claude/RULES.md 확인 (이 파일)
```

### 2. 코드 작업
```
1. 타입 정의 먼저 수정 (src/types/index.ts)
2. 필요시 새 모듈 생성 (src/core/Grid*.ts)
3. 핵심 로직 구현 (src/core/VeloxGrid.ts)
4. CSS 스타일 추가 (src/styles/velox-grid.css)
5. 버전 업데이트 (package.json, src/index.ts)
```

### 3. 빌드 및 테스트
```
1. npm run build 실행
2. 빌드 오류 확인 및 수정
3. TypeScript 경고 수정
4. 데모 페이지 생성 (examples/phaseN-demo.html)
5. 개발 서버 실행 (npm run dev)
```

### 4. 문서 업데이트 (⚠️ 각 문서 목적에 맞게)
```
1. PROGRESS.md 업데이트 (개발 진행 상황)
   - "최근 작업 이력"에 상세 기록
   - Phase 완료 표시
   - 번들 크기 업데이트
   - 기술적 의사결정 기록

2. README.md 선택적 업데이트 (사용자 문서)
   - 버전 정보 (package.json 기준)
   - 번들 크기 (PROGRESS.md 참조)
   - 새 기능 (사용자 관점으로 재작성)
   - API 문서 (사용 예제 추가)
   - 사용 예제 코드 검증

3. CHANGELOG.md 업데이트 (버전 이력)
   - 버전별 주요 변경사항

4. package.json 메타데이터 확인
   - version 필드
   - description 필드
```

### 5. Git 커밋 및 푸시
```
1. commit-msg.txt 파일 작성
2. git add -A
3. git commit -F commit-msg.txt
4. git push origin main
5. commit-msg.txt는 자동 처리됨
```

---

## 📦 npm 명령어

### 자주 사용하는 명령어

```cmd
:: 개발 서버 실행 (포트 5173 또는 다음 사용 가능한 포트)
cd /d D:\Dev\git\velox-grid & npm run dev

:: 프로덕션 빌드
cd /d D:\Dev\git\velox-grid & npm run build

:: 타입 정의 생성
cd /d D:\Dev\git\velox-grid & npm run build:types

:: 미리보기
cd /d D:\Dev\git\velox-grid & npm run preview

:: 린트
cd /d D:\Dev\git\velox-grid & npm run lint

:: 테스트
cd /d D:\Dev\git\velox-grid & npm run test
```

### 빌드 출력 파일

```
dist/
├── velox-grid.js         # UMD (브라우저 직접 사용)
├── velox-grid.esm.js     # ESM (import 사용)
├── velox-grid.iife.js    # IIFE (스크립트 태그)
├── velox-grid.css        # 스타일시트
└── types/                # TypeScript 타입 정의
```

---

## 🎯 Phase 작업 체크리스트

새로운 Phase 시작 시:

- [ ] .claude/PROGRESS.md에서 요구사항 확인
- [ ] src/types/index.ts 타입 추가/수정
- [ ] 새 모듈 생성 (필요시, src/core/)
- [ ] src/core/VeloxGrid.ts 기능 통합
- [ ] src/styles/velox-grid.css 스타일 추가
- [ ] src/core/index.ts exports 추가
- [ ] npm run build 성공 확인
- [ ] TypeScript 경고 제거
- [ ] examples/phaseN-demo.html 데모 페이지 생성
- [ ] package.json 버전 업데이트
- [ ] src/index.ts VERSION 업데이트
- [ ] **PROGRESS.md 업데이트** (개발 기록)
  - [ ] "최근 작업 이력"에 상세 기록
  - [ ] Phase 완료 표시
  - [ ] 번들 크기 업데이트
  - [ ] 프로젝트 구조 확인
- [ ] **README.md 선택적 업데이트** (사용자 문서)
  - [ ] 버전 정보 일치 (package.json)
  - [ ] 번들 크기 동기화 (PROGRESS.md 참조)
  - [ ] 새 기능을 **사용자 관점**으로 작성
  - [ ] API 문서에 **실제 사용 예제** 추가
  - [ ] 기존 예제 코드 작동 확인
  - [ ] Live Demo 링크 확인
- [ ] CHANGELOG.md 버전 추가
- [ ] commit-msg.txt 작성
- [ ] git commit -F commit-msg.txt
- [ ] git push origin main

---

## 📝 코딩 컨벤션

### TypeScript
- **엄격 모드** 준수
- **모든 public 메서드**에 JSDoc 주석 (한글)
- **타입 정의** 명확히 작성
- **any 사용 지양**

### 파일 헤더
```typescript
/**
 * VeloxGrid - {모듈명}
 * @description {설명}
 * Phase {N}: {기능명}
 */
```

### CSS
- **클래스명**: `velox-{component}--{modifier}` (BEM 스타일)
- **예시**: `velox-cell--selected`, `velox-edit-input`

### 이벤트
- **이벤트명**: `on{Event}` 형식
- **예시**: `onCellClick`, `onValidationError`

### 주석
- **한글 주석** 사용
- 기술 용어는 영어 유지
- **예시**: `// 셀 검증을 위한 Validator 모듈`

---

## ⚠️ 주의사항

### 파일 수정 시
1. **Filesystem:edit_file** 사용 시 정확한 문자열 매칭 필요
2. 큰 파일은 **head/tail/offset**으로 부분 읽기
3. 새 파일 생성은 **Filesystem:write_file** 사용
4. 파일 경로는 항상 **절대 경로** 사용

### 빌드 오류 시
1. TypeScript 타입 오류 먼저 확인
2. import 경로 확인
3. 순환 참조 확인
4. 사용하지 않는 변수 제거

### Git 오류 시
1. 한글/특수문자 → **commit-msg.txt 파일 사용 필수**
2. 충돌 시 → `git status`로 상태 확인
3. 푸시 실패 시 → `git pull` 먼저 실행

### CMD 사용 시
1. 경로 이동 시 **`cd /d`** 사용
2. `&`로 명령어 체이닝
3. PowerShell 사용 금지
4. 긴 출력은 timeout 늘려서 대응

---

## 📂 중요 파일 경로

### 프로젝트 루트
```
D:\Dev\git\velox-grid\
├── README.md              # 프로젝트 소개 & 사용자 가이드 (한글)
│                         │
│                         └─> 목적: 사용자에게 사용법 안내
│                             - 설치 방법
│                             - 사용 예제
│                             - API 문서
│                             - 기능 소개
│
├── CHANGELOG.md           # 변경 이력 (한글)
├── ROADMAP.md             # 로드맵 (한글)
├── package.json           # NPM 패키지 정보
└── .claude/
    ├── PROGRESS.md        # 개발 진행 상황 (한글)
    │                     │
    │                     └─> 목적: 개발 이력 추적
    │                         - 작업 기록 (시간순)
    │                         - 버그 수정 상세
    │                         - 코드 최적화
    │                         - 기술 의사결정
    │
    └── RULES.md           # 이 파일 (한글)
```

**문서 간 관계**:
- PROGRESS.md: 개발자/AI를 위한 **기술 기록**
- README.md: 사용자를 위한 **사용 가이드**
- 특정 정보만 **선택적으로 동기화** (버전, 번들 크기, 새 기능)

### 소스 코드
```
src/
├── core/
│   ├── VeloxGrid.ts       # 메인 클래스 (~2,044줄)
│   ├── GridHistory.ts     # Undo/Redo
│   ├── GridValidator.ts   # 검증
│   ├── GridEditorFactory.ts  # 에디터
│   ├── GridTooltip.ts     # 툴팁
│   └── GridSummary.ts     # Summary (v0.7.1)
├── types/
│   └── index.ts           # 타입 정의
├── styles/
│   └── velox-grid.css     # 스타일
└── index.ts               # 진입점, VERSION 상수
```

---

## 🔗 참고 자료

### 외부 참고
- [RealGrid API 문서](https://docs.realgrid.com/)
- [AG Grid 문서](https://www.ag-grid.com/javascript-data-grid/)
- [SheetJS 문서](https://docs.sheetjs.com/)

### 내부 문서
- `.claude/PROGRESS.md` - 상세 개발 진행 상황
- `README.md` - 프로젝트 소개 및 API 문서
- `CHANGELOG.md` - 버전별 변경 이력
- `ROADMAP.md` - 향후 개발 계획

---

## 🚀 대화 시작 템플릿

### Phase 작업 시작
```
.claude/PROGRESS.md 읽고 Phase N 시작해줘
```

### 빌드 및 테스트
```
빌드하고 테스트해줘
```

### 문서 정리
```
문서 최신화하고 Git에 반영해줘
```

### 특정 기능 구현
```
{기능명} 구현해줘. 필요한 파일 확인하고 시작해줘.
```

---

## 📊 프로젝트 현황 (v0.7.1)

### 완료된 Phase
- ✅ Phase 1-4: 핵심 기능
- ✅ Phase 5-6: 가상 스크롤, 컬럼 고급 기능
- ✅ Phase 7: Selection 고도화
- ✅ Phase 8: Excel Export/Import
- ✅ Phase 9: 키보드 & Undo/Redo
- ✅ Phase 10: 컬럼 재정렬 & 메뉴
- ✅ Phase 11: 행 드래그 앤 드롭
- ✅ Phase 12: 셀 검증, 커스텀 에디터, 툴팁
- ✅ Phase 13: Footer Summary, Aggregation

### 다음 작업
- ⏭️ Phase 14: Fixed Left 옵션 설계
- ⏭️ Phase 15: Group Summary
- ⏭️ Phase 16: React 래퍼

### 번들 크기
- **UMD**: 80.71 KB (gzip: 20.76 KB)
- **ESM**: 111.12 KB (gzip: 25.63 KB)
- **CSS**: 17.76 KB (gzip: 3.45 KB)

---

*마지막 업데이트: 2025-02-05*
