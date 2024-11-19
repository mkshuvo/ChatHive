import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};

export default config;