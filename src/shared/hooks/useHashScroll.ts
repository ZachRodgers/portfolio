import { useEffect } from 'react';

export default function useHashScroll() {
    useEffect(() => {
        let observer: MutationObserver | undefined;
        let frame: number | undefined;

        const scrollToHash = () => {
            observer?.disconnect();
            if (frame !== undefined) cancelAnimationFrame(frame);
            let id: string;
            try {
                id = decodeURIComponent(window.location.hash.slice(1));
            } catch {
                return;
            }
            if (!id) return;

            const findTarget = () => {
                const target = document.getElementById(id);
                if (!target) return;
                observer?.disconnect();
                frame = requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth' }));
            };

            observer = new MutationObserver(findTarget);
            observer.observe(document.body, { childList: true, subtree: true });
            findTarget();
        };

        scrollToHash();
        window.addEventListener('hashchange', scrollToHash);
        return () => {
            observer?.disconnect();
            if (frame !== undefined) cancelAnimationFrame(frame);
            window.removeEventListener('hashchange', scrollToHash);
        };
    }, []);
}
