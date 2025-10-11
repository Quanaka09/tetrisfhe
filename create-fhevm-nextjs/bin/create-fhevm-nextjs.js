#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

// Simple recursive copy function
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const projectName = process.argv[2];

if (!projectName) {
  console.error('Please specify the project directory:');
  console.log('  npx create-fhevm-nextjs my-app');
  console.log('\nFor example:');
  console.log('  npx create-fhevm-nextjs my-nextjs-app');
  process.exit(1);
}

const currentDir = process.cwd();
const projectDir = path.join(currentDir, projectName);
const templateDir = path.join(__dirname, '../templates/nextjs-template');
const bundledSdkDir = path.join(templateDir, 'fhevm-sdk'); // Path to the bundled SDK in template
const hardhatDir = path.join(templateDir, 'hardhat'); // Path to the bundled Hardhat in template

console.log(`Creating a new Next.js FHEVM app in ${projectDir}`);

// Create project directory
fs.mkdirSync(projectDir, { recursive: true });

// Copy template files
const templateFiles = fs.readdirSync(templateDir);
templateFiles.forEach(file => {
  const srcPath = path.join(templateDir, file);
  const destPath = path.join(projectDir, file);
  copyRecursive(srcPath, destPath);
});

// Copy FHEVM SDK from bundled template
const sdkDestDir = path.join(projectDir, 'fhevm-sdk');
fs.mkdirSync(sdkDestDir, { recursive: true });

// Copy SDK dist folder from bundled template
const sdkDistSrc = path.join(bundledSdkDir, 'dist');
const sdkDistDest = path.join(sdkDestDir, 'dist');
copyRecursive(sdkDistSrc, sdkDistDest);

// Copy SDK package.json from bundled template
const sdkPackageSrc = path.join(bundledSdkDir, 'package.json');
const sdkPackageDest = path.join(sdkDestDir, 'package.json');
fs.copyFileSync(sdkPackageSrc, sdkPackageDest);

// Copy Hardhat directory from bundled template
const hardhatDestDir = path.join(projectDir, 'hardhat');
copyRecursive(hardhatDir, hardhatDestDir);

// Update package.json for local SDK dependency
const packageJsonPath = path.join(projectDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.dependencies['fhevm-sdk'] = 'file:./fhevm-sdk';
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Project created successfully!');
console.log('Next steps:');
console.log(`  cd ${projectName}`);
console.log('  npm install');
console.log('  npm run dev');