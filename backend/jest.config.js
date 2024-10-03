const { JEST_COVERAGE_THRESHOLD } = process.env
const JEST_OUTPUT_PATH = `<rootDir>`

/** @type import("jest").Config */
const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverage: false,
  rootDir: '.'
};

if (process.argv.includes('--coverage')) {
  let jestCoverageThreshold = 80

  if (JEST_COVERAGE_THRESHOLD) {
    jestCoverageThreshold = Number(JEST_COVERAGE_THRESHOLD)
  } else {
    console.log(
      `\n🟡 JEST_COVERAGE_THRESHOLD not set, using default coverage threshold of: ${jestCoverageThreshold}\n`,
    )
  }

  jestConfig.collectCoverage = true
  jestConfig.collectCoverageFrom = [
    '<rootDir>/src/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ]
  jestConfig.coveragePathIgnorePatterns = [
    '<rootDir>/src/models',
    '<rootDir>/src/services',
    '<rootDir>/src/utils',
    '<rootDir>/src/routes',
    '<rootDir>/src/types',
    '<rootDir>/src/App.ts',
    '<rootDir>/src/index.ts',
  ]
  jestConfig.coverageDirectory = `${JEST_OUTPUT_PATH}/coverage`
  jestConfig.coverageProvider = 'v8'
  jestConfig.coverageReporters = ['html', 'text', 'text-summary', 'lcov', 'json', 'clover']
  jestConfig.coverageThreshold = {
    global: {
      branches: jestCoverageThreshold,
      functions: jestCoverageThreshold,
      lines: jestCoverageThreshold,
      statements: jestCoverageThreshold,
    },
  }
  jestConfig.reporters = [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: `${JEST_OUTPUT_PATH}/reports`,
        outputName: 'junit.xml',
        uniqueOutputName: 'false',
        classNameTemplate: '{classname}-{title}',
        titleTemplate: '{classname}-{title}',
        ancestorSeparator: ' > ',
        usePathForSuiteName: 'true',
      },
    ],
  ]
}

module.exports = jestConfig;

