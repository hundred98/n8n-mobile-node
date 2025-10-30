const fs = require('fs');
const path = require('path');

// 创建目标目录（如果不存在）
const targetDir = path.join(__dirname, '..', 'dist', 'nodes', 'MobileApp');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 复制SVG文件
const sourceFile = path.join(__dirname, '..', 'src', 'nodes', 'MobileApp', 'mobile.svg');
const targetFile = path.join(targetDir, 'mobile.svg');

fs.copyFileSync(sourceFile, targetFile);

console.log('SVG图标文件已复制到dist目录');