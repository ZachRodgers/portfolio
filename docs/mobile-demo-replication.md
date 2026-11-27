# Parallel mobile preview

Run `npm run build:mobile-demo` to rebuild from `MOBILE_SOURCE` (default `/home/Zach/Parallel/Code/mobile-app`). The checkout is read only; ordinary portfolio builds use the checked-in bundle.

The runtime imports the original MainNavigator and its web screen tree, including Map, Wallet, Pay, Plates, AccountSettings, CurrentVisit, UnpaidVisits, PreviousVisits, and ScanQR. Original TopBar, Logo, Lucide icons, SVG components, Leaflet map, markers, search sheet, GlassView web fallback, design tokens, and Oxanium font remain in use. No custom app navigation, invented icons, or replacement screen CSS is added.

The iframe uses a fixed 393 × 860 viewport and scales as one unit within the prepared phone frame. Map, Paid, and Alert select original map, recent paid visit, and unpaid visit views using same-origin messages. Replay resets local demo state.

Local adapters replace authentication, backend services, browser storage, configuration, and payment confirmation. Twenty-four fictional Toronto lots, a fictional plate and account, and a saved sample card support exploration. Wallet balance uses cents while session totals use dollars, matching the source screen contracts. Payments never contact Stripe. Card entry uses the product’s existing web fallback. Unknown API reads reject requests rather than reaching the production backend.

Product source paths and checksums are recorded in source-manifest.json. Static dependency notices accompany the output. Native-only Stripe imports are removed at build time; the web implementations and source screen styles remain. Map provider configuration uses Thunderforest Atlas because the source CARTO URLs return an API-key-required tile. The map keeps scroll and pinch zoom, with Leaflet zoom buttons hidden. Zoom is capped at 22; tile loading waits until panning stops and keeps one offscreen tile buffer.

Run `npm run test:mobile-demo` to exercise original map, wallet, paid and unpaid visit screens, and a local saved-card payment. Screenshots are saved to the chat preview directory.

## Atlas configuration

The dedicated public browser key lives in `public/assets/ux_ui/content/portfolio/parallel/mobile/demo/map-config.js` and ships with the static preview. GitHub Pages requires no environment variable or custom configuration step. Edit that file when rotating the key. This key is visible in browser requests regardless of whether it enters the build through source or an environment variable.

Thunderforest’s public API-key documentation does not describe a domain restriction setting. No provider-side restriction has been configured. Hiding the key would require a server-side tile proxy; the preview remains static.

The demo is locked to the original light palette, including when the browser prefers dark mode or account appearance controls are used. The portfolio replay control uses the existing corner placement and RotateCcw icon; replay reloads local state and returns to Map.

The map header enables the original TopBar `useGlassEffect` variant used by Map.native.tsx: a single floating pill with plate, wallet, history, and account actions. Its dimensions, icons, and glass surfaces remain from the source. The native masked blur is adapted to CSS mask-image on web; the scan button uses the native map’s 146px top offset. Other screens retain their own original headers.

The floating map pill has 24px of extra top clearance for the phone island. Lot selections import the original iOS LotFocusCard: rounded glass sheet, pricing dividers, occupancy gradient, favorites, drag expansion, and horizontal lot switching. Favorites use the demo’s in-memory storage and reset on Replay. Directions open OpenStreetMap in a separate tab on web.

A browser pointer adapter on the native card’s handle drives its existing spring and horizontal transition animations. Visitors can drag up to expand, drag down to collapse or dismiss, swipe left/right between lots, or click/keyboard-activate the handle to expand and collapse.

Map credits are available from the info control at the bottom of the phone backdrop. Hover, focus, or activate it to reveal links to Thunderforest and OpenStreetMap; Escape dismisses the opened popover.

The preview uses a fixed Toronto demo location for nearby suggestions and any simulated location-dependent flows. It does not request the visitor’s device location. The expanded search sheet is inset to keep its rounded corners visible, and browser focus styles use neutral colors.
