const fs = require('fs');
const path = require('path');

console.log('🚀 Building GitHub Pages...\n');

// 디렉토리 경로
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const examplesDir = path.join(rootDir, 'examples');
const docsDir = path.join(rootDir, 'docs');
const docsDistDir = path.join(docsDir, 'dist');
const docsDemosDir = path.join(docsDir, 'demos');

const imgDir = path.join(rootDir, 'img');
const docsImgDir = path.join(docsDir, 'img');

// docs/dist, docs/demos, docs/img 디렉토리 생성
[docsDistDir, docsDemosDir, docsImgDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// img 파일 복사 (로고 등 정적 에셋)
if (fs.existsSync(imgDir)) {
  console.log('\n🖼  Copying img assets...');
  copyDirectory(imgDir, docsImgDir);
  console.log(`  ✓ img/`);
}

// dist 파일 복사
console.log('📦 Copying dist files...');
const distFiles = fs.readdirSync(distDir);
distFiles.forEach(file => {
  const srcFile = path.join(distDir, file);
  const destFile = path.join(docsDistDir, file);

  if (fs.statSync(srcFile).isFile()) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`  ✓ ${file}`);
  } else if (fs.statSync(srcFile).isDirectory()) {
    copyDirectory(srcFile, destFile);
    console.log(`  ✓ ${file}/ (directory)`);
  }
});

// phase* 접두사 제거 함수
// phase7-, phase10-11-, phase14-1- 등 다양한 패턴을 처리
// 예: phase7-selection-demo.html → selection-demo.html
//     phase10-11-column-menu-demo.html → column-menu-demo.html
//     phase14-1-display-order-demo.html → display-order-demo.html
function stripPhasePrefix(filename) {
  return filename.replace(/^phase[\d]+([-.][\d]+)*-/, '');
}

// 데모 파일 복사 (examples/phase*-xxx-demo.html → docs/demos/xxx-demo.html)
// dev.html / advanced.html / index.html 등 phase 접두사 없는 파일은 제외
const EXCLUDE_FILES = new Set(['dev.html', 'advanced.html', 'index.html']);

console.log('\n📄 Processing demo files...');
const exampleFiles = fs.readdirSync(examplesDir).filter(file => {
  return file.endsWith('.html') && !EXCLUDE_FILES.has(file) && /^phase/.test(file);
});

exampleFiles.forEach(srcName => {
  const destName = stripPhasePrefix(srcName);
  const srcFile = path.join(examplesDir, srcName);
  const destFile = path.join(docsDemosDir, destName);

  let content = fs.readFileSync(srcFile, 'utf8');
  content = content.replace(/\.\.\/dist\//g, '../dist/');

  fs.writeFileSync(destFile, content);
  console.log(`  ✓ ${srcName} → ${destName}`);
});

console.log('\n✅ GitHub Pages build completed!');
console.log(`📁 Output directory: ${docsDir}`);
console.log(`📊 Demo files copied: ${exampleFiles.length}`);

// 디렉토리 복사 헬퍼 함수
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
