const test = require('node:test');
const assert = require('node:assert/strict');
const { beginReveal } = require('./mobile-demo/reveal-gate.cjs');
function harness(reduced = false) {
  let time = 0, ready = false, count = 0, poll, deadline;
  const stop = beginReveal({ reduced, clock: () => time, isReady: () => ready, onReveal: () => count++, scheduleInterval: fn => (poll = fn), cancelInterval: () => {}, scheduleTimeout: fn => (deadline = fn), cancelTimeout: () => {} });
  return { at(value) { time = value; poll(); }, ready() { ready = true; }, deadline() { deadline(); }, get count() { return count; }, stop };
}
test('waits for both the initial delay and map readiness', () => { const gate=harness(); gate.ready(); gate.at(999); assert.equal(gate.count,0); gate.at(1000); assert.equal(gate.count,1); gate.deadline(); assert.equal(gate.count,1); });
test('reveals even if map tiles fail and never fires twice', () => { const gate=harness(); gate.at(2500); assert.equal(gate.count,0); gate.deadline(); assert.equal(gate.count,1); gate.ready(); gate.at(4000); assert.equal(gate.count,1); });
test('reduced motion skips the delay and cleanup cancels a late reveal', () => { const gate=harness(true); gate.ready(); gate.at(0); assert.equal(gate.count,1); const other=harness(); other.stop(); other.deadline(); assert.equal(other.count,0); });
