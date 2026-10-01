const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../shared/countdown.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const countdownModule = { exports: {} };
vm.runInNewContext(compiled, { exports: countdownModule.exports, module: countdownModule });
const { getRemainingTime } = countdownModule.exports;
const snapshot = remaining => JSON.parse(JSON.stringify(remaining));

test('countdown carries seconds into minutes, hours, and days correctly', () => {
  const target = Date.UTC(2026, 9, 3, 14, 30);
  assert.deepEqual(snapshot(getRemainingTime(target, target - 90061000)), {
    days: 1, hours: 1, minutes: 1, seconds: 1, hasStarted: false,
  });
  assert.deepEqual(snapshot(getRemainingTime(target, target - 60000)), {
    days: 0, hours: 0, minutes: 1, seconds: 0, hasStarted: false,
  });
  assert.equal(getRemainingTime(target, target - 59999).seconds, 59);
});

test('countdown stops at zero for a session whose start time has passed', () => {
  for (const now of [1000, 2000]) {
    assert.deepEqual(snapshot(getRemainingTime(1000, now)), {
      days: 0, hours: 0, minutes: 0, seconds: 0, hasStarted: true,
    });
  }
});

test('invalid dates never display NaN timer digits', () => {
  assert.equal(getRemainingTime(NaN, Date.now()), null);
  assert.equal(getRemainingTime(Infinity, Date.now()), null);
  assert.equal(getRemainingTime(Date.now(), NaN), null);
});
