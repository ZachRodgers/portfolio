const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const output = path.join(__dirname, '../public/assets/ux_ui/content/portfolio/parallel/mobile/demo');
const virtualConsole = new VirtualConsole();
const errors = [];
virtualConsole.on('jsdomError', error => errors.push(error.message));
virtualConsole.on('error', error => errors.push(String(error)));
const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
  url: 'http://localhost:8786/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole,
});
const window = dom.window;
window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.Worker = class { postMessage() {} terminate() {} addEventListener() {} removeEventListener() {} };
window.URL.createObjectURL = () => 'blob:demo';
window.PARALLEL_MAP_CONFIG = { thunderforestKey: 'demo' };
Object.defineProperty(window.Object.prototype, 'attachEvent', { value() {}, configurable: true });
Object.defineProperty(window.Object.prototype, 'detachEvent', { value() {}, configurable: true });
window.eval(fs.readFileSync(path.join(output, 'app.js'), 'utf8'));
setTimeout(() => {
  try {
    assert.equal(window.document.querySelector('.mobile-loading'), null, 'Loading overlay is removed');
    assert.ok(window.document.querySelector('.leaflet-map-container'), 'Map container is mounted');
    assert.match(window.document.body.textContent, /Enter LotID/, 'Map controls are present');
    assert.deepEqual(errors, []);
    console.log('Mobile startup: loader clears and map controls mount.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
  process.exit(process.exitCode || 0);
}, 4500);
