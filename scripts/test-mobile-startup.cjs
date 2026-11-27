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
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  try {
    await wait(4500);
    assert.equal(window.document.querySelector('.mobile-loading'), null, 'Loading overlay is removed');
    assert.ok(window.document.querySelector('.leaflet-map-container'), 'Map container is mounted');
    assert.match(window.document.body.textContent, /Enter LotID/, 'Map controls are present');
    window.dispatchEvent(new window.MessageEvent('message', { origin: window.location.origin, source: window, data: { mobileFeature: 'Parked' } }));
    let parked = false;
    for (let i = 0; i < 30; i++) {
      await wait(50);
      const incoming = window.document.querySelector('[data-mobile-screen="Parked"]');
      if (incoming && incoming.textContent.includes('You are currently parked at')) { parked = true; break; }
    }
    assert.ok(parked, 'Parked screen loads');
    await wait(150);
    assert.ok(window.document.querySelector('[data-mobile-screen="Map"] .leaflet-map-container'), 'Previous map stays mounted during slide');
    assert.ok(window.document.querySelector('[data-mobile-screen="Parked"].mobile-screen-layer--entering'), 'Incoming screen enters over the map');
    await wait(600);
    assert.equal(window.document.querySelectorAll('.mobile-screen-layer').length, 1, 'Previous screen is removed after transition');
    assert.ok(window.document.querySelector('[data-mobile-screen="Parked"]'), 'Parked screen remains active');
    window.dispatchEvent(new window.MessageEvent('message', { origin: window.location.origin, source: window, data: { mobileFeature: 'Alert' } }));
    let alertReady=false;
    for(let i=0;i<40;i++){ await wait(50); const incoming=window.document.querySelector('[data-mobile-screen="Alert"]'); if(incoming && incoming.textContent.includes('Unpaid Account Balance')) { alertReady=true; break; } }
    assert.ok(alertReady,'Alert screen loads');
    await wait(150);
    assert.ok(window.document.querySelector('[data-mobile-screen="Parked"]'), 'Parked screen stays mounted while Alert slides in');
    assert.ok(window.document.querySelector('[data-mobile-screen="Alert"].mobile-screen-layer--entering'), 'Alert enters over the parked view');
    await wait(600);
    assert.equal(window.document.querySelectorAll('.mobile-screen-layer').length, 1);
    assert.ok(window.document.querySelector('[data-mobile-screen="Alert"]'));
    assert.deepEqual(errors, []);
    console.log('Mobile startup and transitions: map, parked, and alert mount with outgoing screens retained during slides.');
  } catch (error) { console.error(error); process.exitCode = 1; }
  process.exit(process.exitCode || 0);
})();
