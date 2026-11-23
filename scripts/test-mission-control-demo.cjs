const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert/strict');
const source = process.env.MISSION_CONTROL_SOURCE || '/home/Zach/Repos/mission-control';
const esbuild = require(path.join(source, 'node_modules/esbuild'));
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/demo', pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
global.Event = dom.window.Event;
global.localStorage = dom.window.localStorage;
global.location = dom.window.location;
global.parent = dom.window;
global.navigator = dom.window.navigator;
let tick;
global.setInterval = callback => { tick = callback; return 1; };
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-demo-test-'));
esbuild.build({
  stdin: { contents: `
    export { initialize } from './scripts/mission-control-demo/service';
    export { useMissions } from '@app/state/missions';
    export { useWorkspace } from '@app/state/workspace';
  `, resolveDir: process.cwd(), loader: 'ts' },
  outfile: path.join(temp, 'test.cjs'), bundle: true, platform: 'node', format: 'cjs',
  alias: { '@app': path.join(source, 'src/renderer/src'), '@shared': path.join(source, 'src/shared') },
  nodePaths: [path.join(source, 'node_modules')]
}).then(async () => {
  const { initialize, useMissions, useWorkspace } = require(path.join(temp, 'test.cjs'));
  initialize();
  const project = '/projects/mission-control';
  const advance = seconds => { for(let i=0;i<seconds*4;i++) tick(); };
  assert.equal(Object.keys(useMissions.getState().missions).length, 0);
  const message = data => window.dispatchEvent(new window.MessageEvent('message', { origin: 'http://localhost', source: window, data: { type: 'mc-demo', ...data } }));
  message({ paused: true });
  advance(5);
  assert.equal(Object.keys(useMissions.getState().missions).length, 0);
  message({ paused: false, visible: true });
  advance(5);
  assert.equal(Object.keys(useMissions.getState().missions).length, 2);
  assert.ok(useWorkspace.getState().stagesByProject[project].every(s => s.files.length > 0));
  advance(15);
  assert.ok(Object.values(useMissions.getState().missions).every(m => m.status === 'complete' && m.progress === 100));
  const changes = useWorkspace.getState().gitStatuses[project].changes;
  assert.equal(changes.filter(f => f.state === 'added').length, 2);
  assert.equal(changes.filter(f => f.state === 'deleted').length, 1);
  assert.equal(changes.filter(f => f.state === 'modified').length, 6);
  await window.mc.git.stageAddFile(project, 'stage-1', changes[0].path);
  assert.ok(useWorkspace.getState().stagesByProject[project][1].files.some(f => f.path === changes[0].path));
  await window.mc.git.checkout(project, 'feature/workspace');
  assert.equal(useWorkspace.getState().gitStatuses[project].branch, 'feature/workspace');
  await window.mc.git.commitStageAndPush(project, 'stage-1', 'Refine editor layout');
  assert.equal(useWorkspace.getState().stagesByProject[project].length, 1);
  advance(9);
  assert.equal(Object.keys(useMissions.getState().missions).length, 2);
  advance(1);
  assert.equal(Object.keys(useMissions.getState().missions).length, 0);
  assert.equal(useWorkspace.getState().stagesByProject[project].length, 0);
  console.log('PASS: pause/resume, launch, parallel stages, completion, stage movement, checkout, commit, hold, replay');
  dom.window.close();
}).catch(error => {console.error(error);process.exitCode=1;dom.window.close();});
