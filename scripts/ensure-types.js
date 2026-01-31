const { execSync } = require('child_process');

function hasPackage(name) {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
}

if (!hasPackage('typescript') || !hasPackage('@types/react')) {
  console.log('ensure-types: missing TypeScript or @types/react. Installing now...');
  try {
    // Install without saving to package.json to avoid modifying lockfile drastically
    execSync('npm install typescript @types/react --no-save', { stdio: 'inherit' });
    console.log('ensure-types: installation completed');
  } catch (err) {
    console.error('ensure-types: failed to install packages', err);
    process.exit(1);
  }
} else {
  console.log('ensure-types: TypeScript and @types/react already present');
}
