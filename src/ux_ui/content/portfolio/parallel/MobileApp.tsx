import React, { useState } from 'react';
import DesignRationale from '../mission-control/DesignRationale';
import './MobileApp.css';

const slides = ['Map', 'Paid', 'Alert'];

export default function MobileApp() {
    const [active, setActive] = useState('Map');
    return <section id="parallel-mobile" className="parallel-mobile-app" aria-label="Parallel mobile app">
        <div className="parallel-mobile-layout">
            <div className="parallel-mobile-phone" aria-label="Mobile app preview coming soon"><img src="/assets/ux_ui/content/portfolio/parallel/mobile/phone_border.png" alt="" /></div>
            <div className="parallel-mobile-content">
                <div className="mission-showcase-tabs parallel-mobile-slider" role="tablist" aria-label="Explore app features" style={{ '--selected-tab': slides.indexOf(active) } as React.CSSProperties}>
                    <span className="mission-showcase-indicator" aria-hidden="true" />
                    {slides.map(slide => <button key={slide} role="tab" aria-selected={active === slide} onClick={() => setActive(slide)}>{slide}</button>)}
                </div>
                <p>Cameras check you in when you arrive. When you leave, Parallel handles the rest.</p>
                <p>You have 48 hours to pay, and reminders help you keep track. Turn on autopay if you’d rather not think about it. Unpaid plates may be flagged across Parallel lots.</p>
                <p>A blue check confirms your payment, and updates appear in real time.</p>
                <div className="parallel-mobile-downloads">
                    <a href="https://apps.apple.com/" aria-label="Download on the App Store"><img src="/assets/parallel_app_ios_download.svg" alt="Download on the App Store" /></a>
                    <a href="https://play.google.com/store" aria-label="Get it on Google Play"><img src="/assets/parallel_app_android_download.svg" alt="Get it on Google Play" /></a>
                    <a href="/" aria-label="Open Parallel on the web"><img src="/assets/parallel_app_web.svg" alt="Parallel web app" /></a>
                    <DesignRationale project="parallel" page={3} />
                </div>
            </div>
        </div>
    </section>;
}
