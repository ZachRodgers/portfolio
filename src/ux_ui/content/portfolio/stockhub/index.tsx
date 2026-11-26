import React from 'react';
import BrowserBar from './BrowserBar';
import AdminShowcase from './AdminShowcase';
import MissionDemoFrame from '../mission-control/MissionDemoFrame';
import DesignRationale from '../mission-control/DesignRationale';
import './stockhub.css';

export default function Stockhub() {
    return <>
        <section className="mission-overview stockhub-overview stockhub-tone-inventory" aria-label="Stockhub inventory preview">
            <div className="mission-overview-inner">
                <MissionDemoFrame src="/assets/ux_ui/content/portfolio/stockhub/demo/index.html" title="Stockhub interactive hardware inventory" showPause={false} themeControl browserBar={<BrowserBar />} nativeWidth={1440} nativeHeight={900} />
                <div className="mission-feature-grid">
                    <article><h3>Inventory</h3><p>A searchable, sortable inventory puts item details and stock levels in one place. On-hand, committed, and available quantities sit side by side, making the next decision easier to see.</p></article>
                    <article><h3>Multi-Warehouse</h3><p>A shared location selector carries across the workspace. Staff can work with one warehouse or compare several at once, without switching accounts or repeating their search.</p></article>
                </div>
            </div>
            <DesignRationale project="stockhub" page={0} />
        </section>
        <section id="stockhub-orders" className="mission-overview stockhub-overview stockhub-tone-orders" aria-label="Stockhub order lookup">
            <div className="mission-overview-inner">
                <MissionDemoFrame src="/assets/ux_ui/content/portfolio/stockhub/demo/index.html?scene=orders" title="Stockhub interactive order lookup" showPause={false} themeControl browserBar={<BrowserBar />} nativeWidth={1440} nativeHeight={900} />
                <div className="stockhub-order-bottom">
                    <DesignRationale project="stockhub" page={1} />
                    <article><h3>Order Lookup</h3><p>Search by item or order reference, then expand a result to inspect its line items and status. Links carry the item into History, connecting the details needed to trace an order without moving between separate tools.</p></article>
                </div>
            </div>
        </section>
        <section id="stockhub-alerts" className="mission-overview stockhub-overview stockhub-tone-alerts" aria-label="Stockhub stock alerts">
            <div className="mission-overview-inner">
                <div className="stockhub-alert-frame"><MissionDemoFrame src="/assets/ux_ui/content/portfolio/stockhub/demo/index.html?scene=alerts" title="Stockhub interactive stock alerts" showPause={false} themeControl browserBar={<BrowserBar />} nativeWidth={1440} nativeHeight={900} /></div>
                <div className="stockhub-alert-bottom">
                    <article><h3>Stock Alerts</h3><p>Turn a wide spreadsheet into a focused view of stock and demand. Configurable peak months and buffers help surface exceptions, while temporary overrides let staff respond when the numbers need context.</p></article>
                    <DesignRationale project="stockhub" page={2} />
                </div>
            </div>
        </section>
        <AdminShowcase />
    </>;
}
