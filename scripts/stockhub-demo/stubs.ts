import {useMemo, useSyncExternalStore} from 'react';
import {toast} from 'sonner';

const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};
const snapshot = () => window.location.search;
export function useTelemetry(){return {track:()=>{}}}
export function previewHref(href: string): string | null {
  let target: URL;
  try { target = new URL(href, window.location.origin); } catch { return null; }
  if (target.origin !== window.location.origin) return null;
  if (target.pathname === '/admin') target.pathname = '/admin/analytics';
  const isAdmin = new URLSearchParams(location.search).get('scene') === 'admin';
  const allowed = isAdmin ? ['/admin/analytics','/admin/users','/admin/csv-uploads'] : ['/history','/order-lookup'];
  if (!allowed.includes(target.pathname)) return null;
  const params = new URLSearchParams(target.search);
  params.set('scene', isAdmin ? 'admin' : 'orders');
  if (isAdmin) params.set('view', target.pathname.split('/').pop()!);
  else if (target.pathname === '/history') params.set('view', 'history');
  return `${window.location.pathname}?${params}`;
}
export function navigate(href: string) {
  const destination = previewHref(href);
  if (!destination) { toast.info('Explore this workflow in its portfolio section.'); return; }
  window.history.pushState(null, '', destination);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
export function useRouter(){return {push:navigate, replace:navigate, back:()=>window.history.back()}}
export function usePathname(){
  const search=useSyncExternalStore(subscribe,snapshot,snapshot);
  const params=new URLSearchParams(search);
  if(params.get('scene') === 'admin') {const view=params.get('view');return ['/admin/users','/admin/csv-uploads'].includes('/admin/'+view) ? '/admin/'+view : '/admin/analytics';}
  return params.get('view') === 'history' ? '/history' : params.get('scene') === 'orders' ? '/order-lookup' : params.get('scene') === 'alerts' ? '/stock-alerts' : '/inventory';
}
export function useSearchParams(){
  const search=useSyncExternalStore(subscribe,snapshot,snapshot);
  return useMemo(()=>new URLSearchParams(search),[search]);
}
