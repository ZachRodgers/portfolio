const fs = require('fs');
const path = require('path');
const source = process.env.MISSION_CONTROL_SOURCE || '/home/Zach/Repos/mission-control';
const esbuild = require(path.join(source, 'node_modules/esbuild'));
const outdir = path.resolve('public/assets/ux_ui/content/portfolio/mission-control/demo');
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
            "selected={section.id === route} disabled={section.id !== 'launchpad'} title={section.id !== 'launchpad' ? 'This page is not part of the portfolio demo' : undefined}"
          ),
          loader: 'tsx',
          resolveDir: path.dirname(args.path)
        };
      });
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
