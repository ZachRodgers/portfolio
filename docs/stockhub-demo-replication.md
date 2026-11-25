# Stockhub inventory preview

The first section uses the product inventory renderer and its UI components in an isolated static iframe. Cedar & Bolt is a fictional hardware retailer; all 30 item descriptions, identifiers, quantities, bins, and warehouses are invented in `scripts/stockhub-demo/local.ts`. No customer records, database connection, credentials, or server routes are included. Fetch is replaced inside the iframe with a local adapter that rejects unknown endpoints. Telemetry is disabled.

Run `npm run build:stockhub-demo` to rebuild. `STOCKHUB_SOURCE` selects the product's `apps/web` directory. The script currently uses the existing compiled CSS at `.next/static/css/app/layout.css` and the bundler installed in `/home/Zach/Repos/mission-control/node_modules/esbuild`. Product dependencies must be installed. Ordinary portfolio builds need neither checkout. Source hashes accompany the static bundle.

Search, column sorting, warehouse selection, row details, totals, pagination, and spreadsheet export use the product components. Replay reloads the preview. The shell uses the original ProtectedSidebar, AppSidebar, warehouse selector, breadcrumb, account menu, theme provider, warehouse asset, and Geist font files. Only Next navigation and image delivery are adapted for static hosting. The preview renders at 1440 × 900 and scales as one unit. No product order data is imported. The remaining sections and rationale content remain for subsequent passes. The rationale button is intentionally disabled.

The demo-only branding adapter uses the portfolio StockHub wordmark (cropped to its icon when collapsed), with Zach as the fictional account. The runtime uses the product React dependencies. Product hover, focus, transition, and menu classes are preserved in the compiled product stylesheet. Navigation to workflows not yet included remains outside the preview.

The portfolio preview displays eight rows per page, uses Toronto and Ottawa locations, narrows the description column, and hides the Bin table column; item details retain the bin. These presentation adaptations are applied during the demo build.

On load or replay, the sidebar starts collapsed and opens after a short delay (immediately for reduced motion). A visitor interaction cancels the automatic opening. The inventory adapter delays the first successful request for each eight-row page by one second so the product's existing skeleton appears; returning to an already loaded page is immediate. Reloading the preview resets this sequence.

The second section renders the original Order Lookup screen using 24 fictional orders and line items linked to the same hardware products. Its local adapter supports browsing, searching, sorting, location and status filters, expansion, pagination, and export. The preview isolates each section's search state; links to workflows not yet included do not navigate away from the demonstration.

Order Lookup opens the first order and its three line items on initial load and replay. Status badges have preview-specific dark colors; the underlying product files are unchanged.

Order line item links open the product History view with the selected item and status. Fictional history records are derived from the same orders, and shipment document links return to Order Lookup. Navigation stays inside the preview; replay returns to its starting screen.
