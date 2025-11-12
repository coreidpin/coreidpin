import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    css: true,
    exclude: ['tests/e2e/**', 'tests/visual/**', 'src/components/__tests__/**', 'node_modules/**'],
    
    // Phase 4: Test Coverage Configuration
    coverage: {
      provider: 'v8', // Use v8 for faster, more accurate coverage
      reporter: ['text', 'json', 'html', 'lcov'], // Multiple output formats
      
      // Coverage thresholds (90%+ requirement)
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      },
      
      // Include source files for coverage
      include: [
        'src/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
        'src/components/**/*.{tsx}',
        'src/backend/**/*.{tsx}'
      ],
      
      // Exclude test files and config from coverage
      exclude: [
        'node_modules/**',
        'tests/**',
        'src/setupTests.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/mockData.ts',
        '**/types/**',
        'src/main.tsx', // Entry point
        'src/vite-env.d.ts'
      ],
      
      // Report uncovered files
      all: true,
      
      // Clean coverage directory before each run
      clean: true,
      
      // Output directory
      reportsDirectory: './coverage'
    }
  },
});
