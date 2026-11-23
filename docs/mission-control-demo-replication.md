# Reusing this product demo approach

Build portfolio demos from the real product renderer wherever possible. Treat the source components, design tokens, CSS modules, typefaces, icons, and motion as the visual source of truth. Keep the demo in an isolated iframe when the host site has global styles that could alter controls or animation.

1. Identify the product entry screen, its visible component tree, and each component's IPC or backend calls. Read the design tokens, fonts, and motion states before recreating anything.
2. Bundle the product's renderer source into a static app. Add a thin adapter for the product's service boundary and replace data, filesystem, process execution, network calls, and persistence with deterministic local fixtures.
3. Model the demonstration as a timeline with explicit start, intermediate, completion, hold, and reset states. Make controls interactive against local state so visitors can switch views, open menus and files, and inspect the product while it runs. Track interaction for each playthrough: pointer movement or clicks in the app, playback controls, keyboard input, scrolling, touch, and text entry disable the timed restart for that cycle. Keep the Replay button available as an explicit manual reset; a manually restarted cycle remains interaction-protected. Exclude scripted UI events, such as the demo's own typewriter input, from interaction detection.
4. Pause when offscreen or hidden. Respect reduced-motion preferences. Keep demo playback controls in the surrounding portfolio rather than adding chrome to the product interface.
5. Commit only the rendered runtime dependency graph. Lazy-load only the languages/themes the demo needs, include only needed font scripts, keep the license notices for code and fonts actually shipped, and record product-source paths plus checksums in a manifest.
6. Keep the ordinary portfolio build independent of the product checkout. Check in the compact static bundle; provide a rebuild script that reads the product repository without modifying it.

For this demo, run `npm run build:mission-control-demo` to rebuild from the local Mission Control checkout and `npm run test:mission-control-demo` to check the simulation. `MISSION_CONTROL_SOURCE` selects another checkout path. The source manifest shows which product files shaped the build; it does not copy or modify them.

Bundling into static JavaScript still redistributes the dependency code to visitors. Keep the applicable license notices with the bundle; a browser demo does not remove those redistribution terms. Remove a notice only when its package is no longer present in the shipped output.
