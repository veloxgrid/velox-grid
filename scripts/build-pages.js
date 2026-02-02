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

// docs/dist 디렉토리 생성
if (!fs.existsSync(docsDistDir)) {
  fs.mkdirSync(docsDistDir, { recursive: true });
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
    // types 폴더 복사
    copyDirectory(srcFile, destFile);
    console.log(`  ✓ ${file}/ (directory)`);
  }
});

// 예제 파일 매핑
const demoMapping = {
  'phase7-demo.html': 'selection-demo.html',
  'phase8-demo.html': 'excel-demo.html',
  'phase9-demo.html': 'keyboard-demo.html',
  'phase10-11-demo.html': 'column-menu-demo.html',
  'phase10-11-demo.html': 'row-drag-demo.html', // 중복이지만 실제로는 하나만 존재
  'phase12-demo.html': 'validation-demo.html'
};

// 실제 매핑 (파일 존재 확인)
const actualMapping = {
  'phase7-demo.html': 'selection-demo.html',
  'phase8-demo.html': 'excel-demo.html',
  'phase9-demo.html': 'keyboard-demo.html',
  'phase10-11-demo.html': 'column-menu-demo.html',
  'phase12-demo.html': 'validation-demo.html'
};

console.log('\n📄 Processing demo files...');

// 예제 파일 복사 및 경로 수정
Object.entries(actualMapping).forEach(([srcName, destName]) => {
  const srcFile = path.join(examplesDir, srcName);
  const destFile = path.join(docsDemosDir, destName);
  
  if (fs.existsSync(srcFile)) {
    let content = fs.readFileSync(srcFile, 'utf8');
    
    // 경로 수정: ../dist/ → ../dist/
    content = content.replace(/\.\.\/dist\//g, '../dist/');
    
    fs.writeFileSync(destFile, content);
    console.log(`  ✓ ${srcName} → ${destName}`);
  } else {
    console.log(`  ⚠ ${srcName} not found, skipping...`);
  }
});

// phase10-11-demo.html을 두 개로 복사
if (fs.existsSync(path.join(examplesDir, 'phase10-11-demo.html'))) {
  const content = fs.readFileSync(path.join(examplesDir, 'phase10-11-demo.html'), 'utf8');
  
  // column-menu-demo.html 생성
  let columnContent = content.replace(/\.\.\/dist\//g, '../dist/');
  fs.writeFileSync(path.join(docsDemosDir, 'column-menu-demo.html'), columnContent);
  console.log('  ✓ phase10-11-demo.html → column-menu-demo.html');
  
  // row-drag-demo.html 생성 (동일 내용)
  fs.writeFileSync(path.join(docsDemosDir, 'row-drag-demo.html'), columnContent);
  console.log('  ✓ phase10-11-demo.html → row-drag-demo.html');
}

console.log('\n✅ GitHub Pages build completed!');
console.log(`📁 Output directory: ${docsDir}`);

// 디렉토리 복사 헬퍼 함수
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
