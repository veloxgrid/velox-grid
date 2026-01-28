# VeloxGrid 프로젝트 작업 규칙

> Claude AI가 VeloxGrid 프로젝트 작업 시 참고해야 할 규칙과 정보

## 📁 프로젝트 정보

- **프로젝트 경로**: `D:\Dev\git\velox-grid`
- **GitHub**: `https://github.com/bart-idea/velox-grid.git`
- **사용자**: 범키 (ki89.choi@samsung.com)
- **OS**: Windows

---

## 🔄 작업 진행 순서

### 1. 작업 시작 전
```
1. PROGRESS.md 파일 읽기
2. 현재 버전 및 완료된 Phase 확인
3. 다음 작업할 Phase 내용 파악
```

### 2. 코드 작업
```
1. 타입 정의 먼저 수정 (src/types/index.ts)
2. 핵심 로직 구현 (src/core/VeloxGrid.ts)
3. 필요시 유틸리티 추가 (src/utils/)
4. 버전 업데이트 (package.json, src/index.ts)
```

### 3. 빌드 및 테스트
```
1. npm run build 실행
2. 빌드 오류 확인 및 수정
3. 데모 페이지 생성 (examples/phaseN-demo.html)
```

### 4. 문서 업데이트
```
1. README.md 업데이트 (새 기능, API, Changelog)
2. PROGRESS.md 업데이트 (완료 표시, 다음 작업)
```

### 5. Git 커밋 및 푸시
```
1. git add -A
2. git commit (커밋 메시지 파일 사용)
3. git push origin main
```

---

## 💾 Git 명령어 사용 규칙

### 기본 설정
```cmd
cd /d D:\Dev\git\velox-grid
```

### 커밋 메시지 규칙
Windows CMD에서 한글이나 특수문자가 포함된 커밋 메시지는 **파일을 통해** 전달해야 함:

```cmd
:: 잘못된 방법 (오류 발생)
git commit -m "feat: 한글 메시지"

:: 올바른 방법
1. commit-msg.txt 파일 생성
2. git commit -F commit-msg.txt
3. del commit-msg.txt
```

### 커밋 메시지 형식
```
feat(phaseN): 간단한 영문 설명 vX.X.X

- 세부 변경 내용 1
- 세부 변경 내용 2
- 세부 변경 내용 3
```

### 자주 사용하는 명령어
```cmd
:: 상태 확인
git status

:: 스테이징
git add -A

:: 커밋 (파일 사용)
git commit -F commit-msg.txt

:: 푸시
git push origin main

:: 로그 확인
git log --oneline -5
```

---

## 🖥️ CMD 명령어 사용 규칙

### 필수 설정
- **Shell**: `cmd` (PowerShell 아님)
- **경로 이동**: `cd /d D:\경로` (드라이브 변경 시 /d 필수)
- **인코딩**: UTF-8 문제로 한글 출력이 깨질 수 있음

### npm 명령어
```cmd
:: 빌드
cd /d D:\Dev\git\velox-grid && npm run build

:: 개발 서버
cd /d D:\Dev\git\velox-grid && npm run dev

:: 테스트
cd /d D:\Dev\git\velox-grid && npm run test
```

### 파일 검색 (findstr)
```cmd
:: 파일 내용 검색
findstr /n "검색어" 파일경로

:: 대소문자 무시
findstr /i /n "검색어" 파일경로

:: 여러 패턴
findstr /n "패턴1\|패턴2" 파일경로
```

### 주의사항
- `head`, `tail`, `grep` 등 Unix 명령어는 Windows에서 사용 불가
- 파이프(`|`)와 리다이렉션(`>`) 사용 시 주의
- 긴 출력은 `2>&1`로 stderr도 캡처

---

## 📝 대화 요약 방법

### 컴팩션 시 포함할 정보
```
1. [PROJECT STATUS] 현재 버전, 완료된 Phase
2. [SESSION ACTIONS] 이번 대화에서 수행한 작업
3. [FILES MODIFIED] 수정된 파일 목록
4. [BUILD RESULTS] 빌드 결과 (번들 크기)
5. [GIT COMMITS] 커밋 해시 및 메시지
6. [NEXT STEPS] 다음 작업 사항
```

### 중요 파일 경로
```
D:\Dev\git\velox-grid\.claude\PROGRESS.md   # 진행 상황
D:\Dev\git\velox-grid\.claude\RULES.md      # 이 파일
D:\Dev\git\velox-grid\src\core\VeloxGrid.ts # 핵심 코드
D:\Dev\git\velox-grid\src\types\index.ts    # 타입 정의
D:\Dev\git\velox-grid\package.json          # 버전 정보
D:\Dev\git\velox-grid\README.md             # 문서
```

---

## 🏗️ 빌드 정보

### 빌드 명령어
```cmd
cd /d D:\Dev\git\velox-grid && npm run build
```

### 출력 파일
```
dist/velox-grid.js      # UMD (브라우저 직접)
dist/velox-grid.esm.js  # ESM (import용)
dist/velox-grid.iife.js # IIFE (스크립트 태그용)
dist/velox-grid.css     # 스타일
dist/types/             # TypeScript 타입 정의
```

### 버전 업데이트 위치
```
package.json         → "version": "X.X.X"
src/index.ts         → export const VERSION = 'X.X.X';
```

---

## 📋 Phase 작업 체크리스트

새로운 Phase 시작 시:

- [ ] PROGRESS.md에서 요구사항 확인
- [ ] src/types/index.ts 타입 추가/수정
- [ ] src/core/VeloxGrid.ts 기능 구현
- [ ] src/utils/ 유틸리티 추가 (필요시)
- [ ] npm run build 성공 확인
- [ ] examples/phaseN-demo.html 데모 페이지 생성
- [ ] package.json 버전 업데이트
- [ ] src/index.ts VERSION 업데이트
- [ ] README.md 문서 업데이트
- [ ] PROGRESS.md 상태 업데이트
- [ ] git commit & push

---

## ⚠️ 주의사항

### 파일 수정 시
1. **str_replace** 사용 시 정확한 문자열 매칭 필요
2. 큰 파일은 **offset/length**로 부분 읽기
3. 새 파일 생성은 **write_file** 사용

### 빌드 오류 시
1. TypeScript 타입 오류 먼저 확인
2. import 경로 확인
3. 순환 참조 확인

### Git 오류 시
1. 한글/특수문자 → 파일로 커밋 메시지 전달
2. 충돌 시 → git status로 상태 확인

---

## 🔗 참고 링크

- [RealGrid API 참고](https://docs.realgrid.com/)
- [AG Grid 참고](https://www.ag-grid.com/javascript-data-grid/)
- [SheetJS 문서](https://docs.sheetjs.com/)

---

## 📞 대화 시작 템플릿

```
D:\Dev\git\velox-grid\.claude\PROGRESS.md 읽고 [작업내용] 해줘
```

또는

```
velox-grid 프로젝트 Phase N 진행해줘
```

---

## 📚 개발 가이드라인

### 코딩 컨벤션
1. **TypeScript 엄격 모드** 준수
2. **모든 public 메서드**에 JSDoc 주석
3. **한글 주석** 사용 (기술 용어는 영어)
4. **CSS 클래스명**: `velox-{component}--{modifier}` 형식
5. **이벤트명**: `on{Event}` 형식 (예: `onCellClick`)

### Git 커밋 메시지 타입
```
feat: 새 기능 추가
fix: 버그 수정
refactor: 리팩토링
docs: 문서 수정
style: 코드 포맷팅
test: 테스트 추가
chore: 빌드/설정 변경
```

### 파일 생성 시 헤더
```typescript
/**
 * VeloxGrid - {모듈명}
 * @description {설명}
 * Phase {N}: {기능명}
 */
```

### Phase 작업 시작 방법
1. **Phase 선택**: PROGRESS.md에서 다음 Phase 확인
2. **타입 먼저 정의**: `src/types/index.ts`에 필요한 타입 추가
3. **모듈 생성**: `src/core/Grid{Name}.ts` 파일 생성 (필요시)
4. **VeloxGrid.ts 통합**: 메인 클래스에 기능 연결
5. **CSS 추가**: `src/styles/velox-grid.css`에 스타일 추가
6. **데모 생성**: `examples/phase{N}-demo.html` 작성 (IIFE 형태)
7. **빌드 & 테스트**: `npm run build`로 확인
8. **문서 업데이트**: README.md, PROGRESS.md
9. **커밋**: 의미있는 단위로 커밋

### 주의사항
1. **VeloxGrid.ts 크기**: 현재 ~2600줄. 새 기능은 별도 모듈로 분리 권장
2. **번들 크기**: 60KB 이하 유지 목표
3. **의존성**: 외부 라이브러리 추가 지양 (SheetJS 제외)
4. **하위 호환성**: 기존 API 변경 시 주의

### 주요 파일 위치
- 메인 클래스: `src/core/VeloxGrid.ts`
- 타입 정의: `src/types/index.ts`
- 스타일: `src/styles/velox-grid.css`
- 빌드 설정: `vite.config.ts`
