import {useEffect} from 'react';
import {useSidebar} from '@/components/ui/sidebar';

export function SidebarOpening() {
  const {setOpen} = useSidebar();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOpen(true);
      return;
    }
    const timer = window.setTimeout(() => setOpen(true), 350);
    const cancel = () => window.clearTimeout(timer);
    window.addEventListener('pointerdown', cancel, {once:true});
    window.addEventListener('keydown', cancel, {once:true});
    return () => { window.clearTimeout(timer); window.removeEventListener('pointerdown', cancel); window.removeEventListener('keydown', cancel); };
  }, []);
  return null;
}
