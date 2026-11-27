import React from 'react';

const roles = [
    'Founder', 'Product Designer', 'UX/UI Designer', 'CTO', 'Design Engineer',
    'Creative Director', 'Full-Stack Developer', 'Product Design Lead', 'Software Engineer',
    'Creative Technologist', 'Industrial Designer', 'Game Designer', 'Frontend Developer',
    'UX Researcher', 'Interaction Designer', 'AI Developer', 'Design Systems Designer',
    'Entrepreneur', 'Technical Founder', 'Visual Designer', 'Prototyper',
    'React Developer', 'Product Strategist', 'Brand Designer',
    'Mobile App Developer', 'Systems Thinker', '3D Artist',
    'Software Architect', 'Game Developer', 'Team Leader',
    'AI Interaction Designer', 'Technical Artist', 'UX Strategist',
    'Concept Designer', 'Design Researcher', 'Project Manager',
    'Product Builder',
    'Designer', 'Zach Rodgers',
];

export function carouselProgress(time: number) {
    const t = Math.max(0, Math.min(1, (time - 16) / 3.5));
    // Zero velocity at both ends, with the fastest passage at the midpoint.
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function RoleCarousel({ time }: { time: number }) {
    const progress = carouselProgress(time);
    const nameGap = 3;
    const distance = (roles.length - 1) * 7 + nameGap + 97;

    return (
        <div className="ux-role-carousel">
            <div className="ux-role-wheel" aria-hidden="true">
                {roles.map((role, index) => {
                    const isName = index === roles.length - 1;
                    const y = 110 + index * 7 + (isName ? nameGap : 0) - progress * distance;
                    if (y < -12 || y > 112) return null;
                    const angle = Math.max(-55, Math.min(55, (50 - y) * 1.1));
                    const opacity = isName
                        ? Math.min(1, Math.max(0, (110 - y) / 25))
                        : Math.max(0, Math.min(1, (y - 14) / 26, (108 - y) / 28));
                    return (
                        <div key={index} className={`ux-role-row ${isName ? 'ux-role-name' : ''}`}
                            style={{
                                top: `calc(${y - 13 * progress}% + var(--ux-name-center) * ${progress})`,
                                opacity,
                                transform: `translateY(-50%) perspective(900px) rotateX(${isName ? angle * (1 - progress) : angle}deg)`,
                            }}>
                            {role}
                        </div>
                    );
                })}
            </div>
            <span className="ux-role-reduced" aria-hidden="true">Zach Rodgers</span>
            <span className="ux-sr-only">{roles.join('. ')}.</span>
        </div>
    );
}
