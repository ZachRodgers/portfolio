import {useMemo, useSyncExternalStore} from 'react';
import {toast} from 'sonner';

const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};
const snapshot = () => window.location.search;
export function useTelemetry(){return {track:()=>{}}}
export function navigate(href: string) {
  const target = new URL(href, window.location.origin);
  if (!['/history', '/order-lookup'].includes(target.pathname)) {
    toast.info('Explore this workflow in its portfolio section.');
    return;
  }
  const params = new URLSearchParams(target.search);
  params.set('scene', 'orders');
  if (target.pathname === '/history') params.set('view', 'history');
  window.history.pushState(null, '', `${window.location.pathname}?${params}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
export function useRouter(){return {push:navigate, back:()=>window.history.back()}}
export function usePathname(){
  const search=useSyncExternalStore(subscribe,snapshot,snapshot);
  const params=new URLSearchParams(search);
  return params.get('view') === 'history' ? '/history' : params.get('scene') === 'orders' ? '/order-lookup' : '/inventory';
}
export function useSearchParams(){
  const search=useSyncExternalStore(subscribe,snapshot,snapshot);
  return useMemo(()=>new URLSearchParams(search),[search]);
}
