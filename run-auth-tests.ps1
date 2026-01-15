# Google Auth Testing Script - Runs unit tests with detailed error logging

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Google Auth Unit Tests with Error Logging" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Configuring Jest..." -ForegroundColor Yellow

$jestConfig = @'
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  verbose: true,
};

module.exports = config;
'@

Set-Content -Path "jest.config.js" -Value $jestConfig

$jestSetup = "import '@testing-library/jest-dom';"
Set-Content -Path "jest.setup.js" -Value $jestSetup

Write-Host "`n[2/3] Running Google Auth unit tests..." -ForegroundColor Yellow
npm test -- --testPathPattern=auth.test --verbose --coverage

Write-Host "`n[3/3] Test Results Summary" -ForegroundColor Yellow

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "Error logging is working correctly." -ForegroundColor Green
} else {
    Write-Host "`nSOME TESTS FAILED" -ForegroundColor Red
    Write-Host "Review the error logs above." -ForegroundColor Yellow
}

Write-Host ""
