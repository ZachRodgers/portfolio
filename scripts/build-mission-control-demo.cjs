const fs = require('fs');
const path = require('path');
const source = process.env.MISSION_CONTROL_SOURCE || '/home/Zach/Repos/mission-control';
const esbuild = require(path.join(source, 'node_modules/esbuild'));
const outdir = path.resolve('public/assets/ux_ui/content/portfolio/mission-control/demo');
const demoSkills = ['advanced-planning', 'ui-mockup', 'skeleton'].map(name => {
  const body = fs.readFileSync(path.join(source, 'resources/skills', name, 'SKILL.md'), 'utf8')
    .split('\n').filter(line => !/claude|codex|anthropic|openai|mission control|\bai\b|assistant|model|tool/i.test(line)).join('\n');
  const description = /^description:\s*(.*)$/m.exec(body)?.[1] || 'Create visual plans with a clear implementation path and reviewable details.';
  return { name, description, body };
});
fs.writeFileSync(path.resolve('scripts/mission-control-demo/bundled-skills.json'), JSON.stringify(demoSkills));
esbuild.buildSync({
  entryPoints: ['scripts/mission-control-demo/plan-design-engine.ts'],
  bundle: true, minify: true, target: 'es2022',
  outfile: path.resolve('public/assets/ux_ui/content/portfolio/mission-control/plan-design-engine.js'),
  alias: { '@shared': path.join(source, 'src/shared') }
});
esbuild.build({
  entryPoints: ['scripts/mission-control-demo/entry.tsx'],
  bundle: true, splitting: true, format: 'esm', target: 'es2022',
  outdir, entryNames: 'app-[hash]', chunkNames: 'chunks/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]', minify: true, legalComments: 'none',
  jsx: 'automatic',
  alias: { 'react': path.join(source, 'node_modules/react'), 'react-dom': path.join(source, 'node_modules/react-dom'), '@app': path.join(source, 'src/renderer/src'), '@shared': path.join(source, 'src/shared') },
  nodePaths: [path.join(source, 'node_modules')],
  loader: { '.woff2': 'file', '.woff': 'file', '.svg': 'dataurl', '.png': 'file' },
  plugins: [{
    name: 'demo-index-motion',
    setup(build) {
      build.onLoad({ filter: /\/renderer\/src\/screens\/Index\/IndexGraph\.tsx$/ }, args => ({
        contents: fs.readFileSync(args.path, 'utf8').replace("Date.now() >= interactionUntilRef.current && document.visibilityState === 'visible'", "Date.now() >= interactionUntilRef.current && document.visibilityState === 'visible' && !(window as any).__demoPaused").replace('elapsed * 0.000035', 'elapsed * 0.000075').replace('Date.now() + 4_000', 'Date.now() + 800').replace('.slice(0, 8)', '.slice(0, 3)').replace('const timer = window.setTimeout(() => graphRef.current?.zoomToFit(700, 90), 80)\n    return () => window.clearTimeout(timer)', "const timer = window.setTimeout(() => graphRef.current?.zoomToFit(700, 10), 80)\n    const zoom = window.setTimeout(() => { const api = graphRef.current; if (!api || Date.now() < interactionUntilRef.current) return; const camera = api.camera().position; api.cameraPosition({ x: camera.x * .58, y: camera.y * .58, z: camera.z * .58 }, { x: 0, y: 0, z: 0 }, 450) }, 850)\n    return () => { window.clearTimeout(timer); window.clearTimeout(zoom) }"),
        loader: 'tsx', resolveDir: path.dirname(args.path)
      }));
    }
  }, {
    name: 'demo-model-options',
    setup(build) {
      build.onLoad({ filter: /\/src\/shared\/types\.ts$/ }, args => {
        const contents = fs.readFileSync(args.path, 'utf8');
        const models = `export const MODELS: { id: string; label: string; blurb: string; provider: Provider }[] = [
  { id: 'gpt-6-astra', label: 'Astra', blurb: 'Flagship', provider: 'codex' },
  { id: 'gpt-6.1-sol', label: 'Sol', blurb: 'Balanced', provider: 'codex' },
  { id: 'fable', label: 'Fable', blurb: 'Best $', provider: 'claude' },
  { id: 'opus', label: 'Opus', blurb: 'Frontier', provider: 'claude' },
  { id: 'sonnet', label: 'Sonnet', blurb: 'Balanced', provider: 'claude' }
]`;
        return {
          contents: contents.replace(/export const MODELS: \{ id: string; label: string; blurb: string; provider: Provider \}\[\] = \[[\s\S]*?\n\]/, () => models),
          loader: 'ts',
          resolveDir: path.dirname(args.path)
        };
      });
    }
  }, {
    name: 'demo-route-availability',
    setup(build) {
      build.onLoad({ filter: /\/renderer\/src\/App\.tsx$/ }, args => {
        const contents = fs.readFileSync(args.path, 'utf8');
        return {
          contents: contents.replace(
            'selected={section.id === route}',
            "selected={section.id === route} disabled={section.id !== route} title={section.id !== route ? 'This page is not part of the portfolio demo' : undefined}"
          ),
          loader: 'tsx',
          resolveDir: path.dirname(args.path)
        };
      });
    }
  }, {
    name: 'planning-scene-sidebar',
    setup(build) {
      build.onLoad({ filter: /\/renderer\/src\/screens\/NoProject\/index\.tsx$/ }, args => {
        const contents = fs.readFileSync(args.path, 'utf8');
        return {
          contents: contents.replace(
            'const [explorerOpen, setExplorerOpen] = useState(true)',
            "const [explorerOpen, setExplorerOpen] = useState(() => !['planning', 'browser-design', 'feature-brand'].includes(new URLSearchParams(window.location.search).get('scene') ?? ''))"
          ),
          loader: 'tsx',
          resolveDir: path.dirname(args.path)
        };
      });
    }
  }, {
    name: 'planning-scene-canvas-tabs',
    setup(build) {
      build.onLoad({ filter: /\/renderer\/src\/components\/preview\/PreviewCanvas\.tsx$/ }, args => {
        let contents = fs.readFileSync(args.path, 'utf8');
        const componentMarker = 'export default function PreviewCanvas()';
        if (!contents.includes(componentMarker)) throw new Error('Could not find PreviewCanvas for the portfolio scenes.');
        contents = contents.replace(
          componentMarker,
          "const planningDemo = new URLSearchParams(window.location.search).get('scene') === 'planning';\nconst browserDemo = new URLSearchParams(window.location.search).get('scene') === 'browser-design';\nexport default function PreviewCanvas()"
        );
        contents = contents.replace(
          'const [flashRect, setFlashRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)',
          'const [browserCaptureDrawing, setBrowserCaptureDrawing] = useState(false)\n  const [flashRect, setFlashRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)'
        );
        for (const tab of ['files', 'terminal']) {
          const pattern = new RegExp(`\\n\\s*<button\\n\\s*className=\\{tabClass\\('${tab}'\\)\\}[\\s\\S]*?\\n\\s*<\\/button>`);
          const match = contents.match(pattern);
          if (!match) throw new Error(`Could not find the ${tab} canvas tab for the planning scene.`);
          contents = contents.replace(pattern, `\n          {!planningDemo && !browserDemo && (${match[0].trim()})}`);
        }
        contents = contents.replace('{hasPreview && <button', '{!browserDemo && hasPreview && <button');
        contents = contents.replace('{hasTasks && <button', '{!browserDemo && hasTasks && <button');
        contents = contents.replace(
          /\n\s*\{ui\.activeProject && <button className=\{tabClass\('brand'\)\}[\s\S]*?<\/button>\}/,
          "\n          {!planningDemo && !browserDemo && ui.activeProject && <button className={tabClass('brand')} onClick={() => ui.selectPreviewTab('brand')}>\n            <Palette size={13} /> Styles\n          </button>}"
        );
        contents = contents.replace(
          /\n\s*<CanvasAddMenu[\s\S]*?\/>/,
          match => `\n          {!planningDemo && !browserDemo && (${match.trim()})}`
        );
        contents = contents.replace(
          '{ui.browserAgentActiveMissionId && (',
          '{(browserDemo ? Boolean(ui.browserAgentActiveMissionId || ui.browserAgentCommand) : Boolean(ui.browserAgentActiveMissionId)) && ('
        );
        contents = contents.replace(
          '{!snipping && !ui.browserAgentActiveMissionId && (',
          '{(browserDemo || (!snipping && !ui.browserAgentActiveMissionId)) && ('
        );
        contents = contents.replace(
          /<div className=\{styles\.agentWorkingBar\}>[\s\S]*?<\/div>/,
          match => `{!browserDemo && (${match})}`
        );
        contents = contents.replace(
          'className={styles.agentTakeover}',
          'className={styles.agentTakeover} style={browserDemo ? { pointerEvents: \'none\' } : undefined}'
        );
        // Keep agent navigation inside the guest page, not its cropped ancestors.
        contents = contents.replaceAll(
          "el.scrollIntoView({ block: 'center', inline: 'center' });",
          "if (window.location.pathname.endsWith('browser-preview.html')) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - (window.innerHeight - el.getBoundingClientRect().height) / 2, behavior: 'instant' }); else el.scrollIntoView({ block: 'center', inline: 'center' });"
        );
        contents = contents.replace(
          'setAgentCursor({\n          x: captureRect.x + captureRect.width / 2,\n          y: captureRect.y + captureRect.height / 2\n        })',
          "if (browserDemo) {\n          await moveCursorTo({ x: captureRect.x, y: captureRect.y });\n          setBrowserCaptureDrawing(true);\n          setFlashRect({ left: captureRect.x, top: captureRect.y, width: 0, height: 0 });\n          await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)));\n          setFlashRect({ left: captureRect.x, top: captureRect.y, width: captureRect.width, height: captureRect.height });\n          await moveCursorTo({ x: captureRect.x + captureRect.width, y: captureRect.y + captureRect.height });\n          await new Promise((resolve) => window.setTimeout(resolve, 250));\n          setBrowserCaptureDrawing(false);\n        } else setAgentCursor({ x: captureRect.x + captureRect.width / 2, y: captureRect.y + captureRect.height / 2 })"
        );
        contents = contents.replace(
          'className={styles.snipFlash} style={flashRect}',
          "className={styles.snipFlash} style={browserDemo && browserCaptureDrawing ? { ...flashRect, animation: 'none', background: 'rgba(90, 200, 250, .14)', border: '1px solid #5ac8fa', transition: 'width 500ms ease, height 500ms ease' } : flashRect}"
        );
        contents = contents.replace(
          'setAgentCursor({ x: guest.clientWidth / 2, y: guest.clientHeight / 2 })',
          'if (browserDemo) await moveCursorTo({ x: guest.clientWidth / 2, y: guest.clientHeight / 2 }); else setAgentCursor({ x: guest.clientWidth / 2, y: guest.clientHeight / 2 })'
        );
        return { contents, loader: 'tsx', resolveDir: path.dirname(args.path) };
      });
    }
  }, {
    name: 'planning-demo-toolbar',
    setup(build) {
      build.onLoad({ filter: /\/renderer\/src\/components\/preview\/DesignToolbar\.tsx$/ }, args => {
        let contents = fs.readFileSync(args.path, 'utf8');
        contents = contents.replace(
          'const visible = tools.filter((item) => !(planMode && item.hideInPlan))',
          "const planningPreview = surface === 'preview' && new URLSearchParams(window.location.search).get('scene') === 'planning'\n  const visible = tools.filter((item) => planningPreview ? item.id === 'pointer' || item.id === 'comment' : !(planMode && item.hideInPlan))"
        );
        contents = contents.replace(
          /      <span className=\{styles\.divider\} \/>\n      <button className=\{styles\.tool\} title="Undo \(Ctrl\/Cmd\+Z\)"[\s\S]*?<\/button>\n      <button className=\{styles\.tool\} title="Redo \(Ctrl\/Cmd\+Shift\+Z\)"[\s\S]*?<\/button>/,
          match => `      {!planningPreview && (<>\n${match}\n      </>)}`
        );
        return { contents, loader: 'tsx', resolveDir: path.dirname(args.path) };
      });
    }
  }, {
    name: 'static-browser-surface',
    setup(build) {
      build.onLoad({ filter: /\/renderer\/src\/components\/preview\/BrowserSurface\.tsx$/ }, args => ({
        loader: 'tsx',
        resolveDir: path.dirname(args.path),
        contents: `
          import React, { memo, useRef } from 'react';
          import styles from './PreviewCanvas.module.css';
          export type BrowserWebview = HTMLElement & {
            executeJavaScript: (code: string, userGesture?: boolean) => Promise<unknown>;
            getWebContentsId: () => number;
            getURL: () => string;
            isLoading: () => boolean;
            loadURL: (url: string) => Promise<void>;
          };
          export const BrowserSurface = memo(function BrowserSurface({ sessionId, initialUrl, surfaceRef }: {
            sessionId: string; initialUrl: string; surfaceRef: React.RefObject<BrowserWebview | null>
          }): React.JSX.Element {
            const srcRef = useRef(initialUrl);
            const attach = (node: HTMLIFrameElement | null): void => {
              if (!node) { (surfaceRef as any).current = null; return; }
              const guest = node as unknown as BrowserWebview;
              guest.executeJavaScript = (code: string) => Promise.resolve(node.contentWindow?.eval(code));
              guest.getWebContentsId = () => 1;
              guest.getURL = () => node.contentWindow?.location.href ?? node.src;
              guest.isLoading = () => false;
              guest.loadURL = (url: string) => new Promise(resolve => {
                node.addEventListener('load', () => resolve(), { once: true });
                node.src = url;
              });
              (surfaceRef as any).current = guest;
              const notifyInteraction = () => node.contentWindow?.parent.postMessage({ type: 'mc-demo-interaction' }, location.origin);
              node.addEventListener('load', () => {
                node.dispatchEvent(new Event('dom-ready'));
                for (const eventName of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']) {
                  node.contentWindow?.addEventListener(eventName, notifyInteraction, { passive: true });
                }
              });
            };
            return <iframe key={sessionId} ref={attach} className={styles.iframe} src={srcRef.current} aria-label="Live browser preview" />;
          });
          export function browserLabel(url: string): string {
            try { const parsed = new URL(url); return parsed.pathname.split('/').filter(Boolean).at(-1) ?? parsed.host; }
            catch { return url; }
          }
          export function agentActionLabel(action?: string): string { return action ? 'Working…' : 'Viewing…'; }
        `
      }));
    }
  }, {
    name: 'focused-shiki',
    setup(build) {
      build.onResolve({ filter: /^shiki$/ }, () => ({ path: 'shiki', namespace: 'focused-shiki' }));
      build.onLoad({ filter: /.*/, namespace: 'focused-shiki' }, () => ({
        loader: 'js',
        resolveDir: path.join(source, 'node_modules'),
        contents: `
          import { createSingletonShorthands, guessEmbeddedLanguages, createBundledHighlighter } from '@shikijs/core';
          import { createOnigurumaEngine } from '@shikijs/engine-oniguruma';
          import wasm from 'shiki/wasm';
          import typescript from 'shiki/langs/typescript.mjs';
          import tsx from 'shiki/langs/tsx.mjs';
          import javascript from 'shiki/langs/javascript.mjs';
          import jsx from 'shiki/langs/jsx.mjs';
          import css from 'shiki/langs/css.mjs';
          import json from 'shiki/langs/json.mjs';
          import diff from 'shiki/langs/diff.mjs';
          import html from 'shiki/langs/html.mjs';
          import markdown from 'shiki/langs/markdown.mjs';
          import shellscript from 'shiki/langs/shellscript.mjs';
          import oneDarkPro from 'shiki/themes/one-dark-pro.mjs';
          export const bundledLanguages = { typescript:[typescript], tsx:[tsx], javascript:[javascript], jsx:[jsx], css:[css], json:[json], diff:[diff], html:[html], markdown:[markdown], shellscript:[shellscript] };
          export const bundledThemes = { 'one-dark-pro':[oneDarkPro] };
          const createHighlighter = createBundledHighlighter({ langs:bundledLanguages, themes:bundledThemes, engine:()=>createOnigurumaEngine(wasm) });
          export const { getSingletonHighlighter } = createSingletonShorthands(createHighlighter,{guessEmbeddedLanguages});
        `
      }));
    }
  }, {
    name: 'demo-orb-playback',
    setup(build) {
      build.onResolve({ filter: /^thinking-orbs$/ }, () => ({ path: 'orb', namespace: 'demo-orb' }));
      build.onLoad({ filter: /.*/, namespace: 'demo-orb' }, () => ({
        resolveDir: source,
        loader: 'jsx',
        contents: `
          import React, { useSyncExternalStore } from 'react';
          import { ThinkingOrb as OriginalOrb } from '${path.join(source, 'node_modules/thinking-orbs/dist/index.es.js')}';
          export * from '${path.join(source, 'node_modules/thinking-orbs/dist/index.es.js')}';
          const subscribe = fn => { window.addEventListener('demo-motion', fn); return () => window.removeEventListener('demo-motion', fn); };
          export function ThinkingOrb(props) {
            const paused = useSyncExternalStore(subscribe, () => Boolean(window.__demoPaused) || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            return <OriginalOrb {...props} paused={paused || props.paused}/>;
          }
        `
      }));
    }
  }, {
    name: 'raw-svg',
    setup(build) {
      build.onResolve({ filter: /\?raw$/ }, args => ({ path: path.resolve(args.resolveDir, args.path.slice(0, -4)), namespace: 'raw' }));
      build.onLoad({ filter: /.*/, namespace: 'raw' }, args => ({ contents: fs.readFileSync(args.path, 'utf8'), loader: 'text' }));
    }
  }],
  metafile: true
}).then(result => {
  const entry = Object.entries(result.metafile.outputs).find(([name, value]) => value.entryPoint?.endsWith('entry.tsx') && name.endsWith('.js'));
  const script = path.basename(entry[0]);
  const css = path.basename(entry[1].cssBundle);
  fs.writeFileSync(path.join(outdir, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mission Control</title><link rel="stylesheet" href="./' + css + '"></head><body><div id="root"></div><script type="module" src="./' + script + '"></script></body></html>');
  const keep = new Set(Object.keys(result.metafile.outputs).map(name => path.resolve(name)));
  for (const name of ['index.html', 'sources.json', 'LICENSES.txt']) keep.add(path.join(outdir, name));
  const prune = dir => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) prune(file);
    else if (!keep.has(file)) fs.unlinkSync(file);
  }};
  prune(outdir);
  const licenseRoots = new Set();
  for (const input of Object.keys(result.metafile.inputs)) {
    if (!input.includes('node_modules')) continue;
    let dir = path.dirname(path.resolve(input));
    while (dir !== path.dirname(dir)) {
      if (fs.existsSync(path.join(dir, 'package.json'))) { licenseRoots.add(dir); break; }
      dir = path.dirname(dir);
    }
  }
  const licenses = [];
  for (const dir of licenseRoots) {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    for (const file of fs.readdirSync(dir).filter(name => /^(license|ofl)(\.|$)/i.test(name))) {
      if (fs.statSync(path.join(dir,file)).isFile()) licenses.push(pkg.name + '\n' + fs.readFileSync(path.join(dir,file), 'utf8'));
    }
  }
  fs.writeFileSync(path.join(outdir, 'LICENSES.txt'), licenses.join('\n\n'));
  const sources = Object.keys(result.metafile.inputs).filter(p => p.includes('/src/renderer/') || p.includes('/src/shared/'));
  fs.writeFileSync(path.join(outdir, 'sources.json'), JSON.stringify({ files: sources.map(p => { const file = p.replace(/^raw:/, ''); return { path: path.relative(source, file), sha256: require('crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex') }; }) }, null, 2));
  console.log('Built original renderer: ' + sources.length + ' source files');
}).catch(error => { console.error(error); process.exit(1); });
