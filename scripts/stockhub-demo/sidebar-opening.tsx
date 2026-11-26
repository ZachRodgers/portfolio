import {useEffect} from 'react';
import {useSidebar} from '@/components/ui/sidebar';

export function SidebarOpening() {
  const {setOpen} = useSidebar();
  useEffect(() => {
    const scene = new URLSearchParams(location.search).get('scene');
    if (scene && scene !== 'orders') return;
    let visible = parent === window;
    let opened = false;
    let cancelled = false;
    let timer: number | undefined;
    const schedule = () => {
      if (!visible || opened || cancelled || document.hidden || timer !== undefined) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        opened = true;
        setOpen(true);
      } else {
        timer = window.setTimeout(() => { timer = undefined; opened = true; setOpen(true); }, 350);
      }
    };
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'mc-demo' || typeof event.data.visible !== 'boolean') return;
      visible = event.data.visible;
      if (!visible) { window.clearTimeout(timer); timer = undefined; }
      else schedule();
    };
    const visibility = () => {
      if (document.hidden) { window.clearTimeout(timer); timer = undefined; }
      else schedule();
    };
    const cancel = () => { cancelled = true; window.clearTimeout(timer); timer = undefined; };
    window.addEventListener('message', receive);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pointerdown', cancel, {once: true});
    window.addEventListener('keydown', cancel, {once: true});
    if (parent === window) schedule();
    else parent.postMessage({type:'mc-demo-ready'}, location.origin);
    return () => {window.clearTimeout(timer);window.removeEventListener('message', receive);document.removeEventListener('visibilitychange', visibility);window.removeEventListener('pointerdown', cancel);window.removeEventListener('keydown', cancel)};
  }, []);
  return null;
}
