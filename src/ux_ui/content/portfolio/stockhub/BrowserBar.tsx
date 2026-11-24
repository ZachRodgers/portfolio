import React from 'react';
import { ArrowLeft, ArrowRight, Menu, Minus, RotateCw, X, Maximize2 } from 'lucide-react';

export default function BrowserBar() {
    return <div className="stockhub-browser-bar" aria-hidden="true">
        <div className="stockhub-browser-navigation"><ArrowLeft size={15} /><ArrowRight size={15} /><RotateCw size={14} /></div>
        <div className="stockhub-browser-address">
            <span className="stockhub-browser-favicon"><img src="/assets/ux_ui/hero/stockhub.png" alt="" /></span>
            <span>www.stockhub.ca</span>
        </div>
        <div className="stockhub-browser-actions"><Menu size={17} /><div className="stockhub-window-controls"><span><X size={10} strokeWidth={2.2} /></span><span><Minus size={10} strokeWidth={2.2} /></span><span><Maximize2 size={9} strokeWidth={2.2} /></span></div></div>
    </div>;
}
