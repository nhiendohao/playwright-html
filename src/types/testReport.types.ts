import { TestCase, TestResult } from "@playwright/test/reporter";

export interface TestReport {
    testCase: TestCase,
    result: TestResult,
  }