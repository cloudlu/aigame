import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 测试文件匹配模式
    include: ['tests/**/*.test.js'],
    // 排除的文件
    exclude: ['node_modules', 'dist'],
    // 排除的文件
    exclude: ['node_modules', 'dist'],
    // 全局变量
    globals: true,
    // 环境
    environment: 'node',
    // 覆盖率配置
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.js',
        '**/*.spec.js',
        'coverage/'
      ],
      // 覆盖率目标
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      }
    },
    // 并行测试
    threads: true,
    // 超时时间
    testTimeout: 10000,
    // 监听模式
    watch: false
  }
});
