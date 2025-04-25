// This is a build-time helper script to copy module files
const fs = require('fs');
const path = require('path');

// Create the directory structure
console.log('Setting up module aliases for build...');

try {
  // Make sure the directory exists
  const targetDir = path.join(__dirname, 'node_modules', '@');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Create a symlink from @/lib to the actual lib directory
  const libSourcePath = path.join(__dirname, 'lib');
  const libTargetPath = path.join(targetDir, 'lib');
  
  // Remove existing symlink if it exists
  if (fs.existsSync(libTargetPath)) {
    if (fs.lstatSync(libTargetPath).isSymbolicLink()) {
      fs.unlinkSync(libTargetPath);
    } else {
      fs.rmSync(libTargetPath, { recursive: true, force: true });
    }
  }
  
  // Create directory and copy files
  fs.mkdirSync(libTargetPath, { recursive: true });
  
  // Copy all files from lib to node_modules/@/lib
  const files = fs.readdirSync(libSourcePath);
  for (const file of files) {
    const sourcePath = path.join(libSourcePath, file);
    const targetPath = path.join(libTargetPath, file);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${sourcePath} to ${targetPath}`);
  }
  
  console.log('Module aliases setup completed successfully!');
} catch (error) {
  console.error('Error setting up module aliases:', error);
  process.exit(1);
} 