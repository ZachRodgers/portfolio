import React from 'react';

export default function FrameworkRule({ className = '' }: { className?: string }) {
    return (
        <div className={`ux-framework-rule ${className}`} aria-hidden="true">
            <span className="ux-framework-joint ux-framework-joint--left" />
            <span className="ux-framework-joint ux-framework-joint--right" />
        </div>
    );
}
