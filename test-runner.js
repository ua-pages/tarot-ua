// Простий test runner без залежностей
class TestRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  describe(suiteName, callback) {
    const suite = {
      name: suiteName,
      tests: [],
    };
    this.currentSuite = suite;
    callback();
    this.suites.push(suite);
    this.currentSuite = null;
  }

  test(testName, testFn) {
    if (!this.currentSuite) {
      throw new Error('test() повинен бути всередині describe()');
    }
    this.currentSuite.tests.push({ name: testName, fn: testFn });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        `${message || 'assertEquals failed'}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`
      );
    }
  }

  assertArrayLength(arr, expected, message) {
    if (!Array.isArray(arr)) {
      throw new Error(`${message || 'assertArrayLength'}: не масив`);
    }
    if (arr.length !== expected) {
      throw new Error(
        `${message || 'assertArrayLength'}: очікував ${expected}, отримав ${arr.length}`
      );
    }
  }

  assertIncludes(arr, value, message) {
    if (!arr.includes(value)) {
      throw new Error(`${message || 'assertIncludes'}: ${value} не в масиві`);
    }
  }

  assertTrue(condition, message) {
    if (condition !== true) {
      throw new Error(`${message || 'assertTrue'}: очікував true, отримав ${condition}`);
    }
  }

  assertFalse(condition, message) {
    if (condition !== false) {
      throw new Error(`${message || 'assertFalse'}: очікував false, отримав ${condition}`);
    }
  }

  assertTypeOf(value, expectedType, message) {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(
        `${message || 'assertTypeOf'}: очікував ${expectedType}, отримав ${actualType}`
      );
    }
  }

  assertHasProperty(obj, prop, message) {
    if (!obj.hasOwnProperty(prop)) {
      throw new Error(`${message || 'assertHasProperty'}: властивість "${prop}" не знайдена`);
    }
  }

  assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `${message || 'assertDeepEqual'}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`
      );
    }
  }

  async run() {
    console.log('\n🧪 Запуск тестів...\n');

    for (const suite of this.suites) {
      console.log(`📦 ${suite.name}`);

      for (const test of suite.tests) {
        this.results.total++;
        try {
          await test.fn();
          this.results.passed++;
          console.log(`  ✅ ${test.name}`);
        } catch (error) {
          this.results.failed++;
          console.log(`  ❌ ${test.name}`);
          console.log(`     ${error.message}`);
          this.results.errors.push({
            suite: suite.name,
            test: test.name,
            error: error.message,
          });
        }
      }
      console.log();
    }

    this.printSummary();
    return this.results.failed === 0;
  }

  printSummary() {
    const { total, passed, failed } = this.results;
    console.log('═'.repeat(60));
    console.log(`📊 Результати: ${passed}/${total} пройшло`);
    if (failed > 0) {
      console.log(`❌ Помилок: ${failed}`);
      process.exit(1);
    } else {
      console.log('✅ Усі тести пройшли!');
      process.exit(0);
    }
  }
}

export const runner = new TestRunner();
