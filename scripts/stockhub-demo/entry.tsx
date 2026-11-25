import React, {useEffect} from 'react';
import {useTheme} from 'next-themes';
import {createRoot} from 'react-dom/client';
import Inventory from '@/app/(protected)/inventory/page';
import OrderLookup from '@/app/(protected)/order-lookup/page';
import History from '@/app/(protected)/history/page';
import StockAlerts from '@/app/(protected)/stock-alerts/page';
import Analytics from '@/app/(protected)/admin/analytics/page';
import Users from '@/app/(protected)/admin/users/page';
import CsvUploads from '@/app/(protected)/admin/csv-uploads/page';
import {AdminBar} from '@/components/layout/admin-bar';
import {usePathname, navigate} from './stubs';
import {ProtectedSidebar} from '@/components/layout/protected-sidebar';
import {ThemeProvider} from '@/components/theme-provider';
import {Toaster} from '@/components/ui/sonner';
import './local';

const user = {id:'cedar-bolt-demo', email:'zach@cedarbolt.example', role:'user' as const};
function ThemeBridge() {
  const {resolvedTheme, setTheme} = useTheme();
  useEffect(() => {
    if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
      window.parent.postMessage({type:'stockhub-theme', theme:resolvedTheme}, window.location.origin);
    }
  }, [resolvedTheme]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === window.parent && event.data?.type === 'stockhub-set-theme' && (event.data.theme === 'light' || event.data.theme === 'dark')) setTheme(event.data.theme);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [setTheme]);
  return null;
}
function App() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin/');
  useEffect(() => {
    if (!isAdmin) return;
    const view=pathname.split('/').pop();
    window.parent.postMessage({type:'stockhub-admin-page', page:view},window.location.origin);
    const receive=(event:MessageEvent)=>{if(event.origin===location.origin && event.source===window.parent && event.data?.type==='stockhub-admin-set-page' && ['analytics','users','csv-uploads'].includes(event.data.page) && pathname !== '/admin/'+event.data.page) navigate('/admin/'+event.data.page)};
    const interact=(event:Event)=>{if(event.isTrusted)window.parent.postMessage({type:'mc-showcase-interaction'},location.origin)};
    window.addEventListener('message',receive);
    for(const name of ['pointerdown','pointermove','keydown','wheel','touchstart','input','change']) window.addEventListener(name,interact,{capture:true,passive:true});
    return ()=>{window.removeEventListener('message',receive);for(const name of ['pointerdown','pointermove','keydown','wheel','touchstart','input','change'])window.removeEventListener(name,interact,true)};
  },[isAdmin,pathname]);
  return <ThemeProvider><ThemeBridge /><div className="h-svh flex flex-col overflow-hidden">
    {isAdmin && <AdminBar />}
    <ProtectedSidebar user={isAdmin ? {...user,role:'admin'} : user}>{pathname === '/admin/analytics' ? <Analytics /> : pathname === '/admin/users' ? <Users /> : pathname === '/admin/csv-uploads' ? <CsvUploads /> : pathname === '/history' ? <History /> : pathname === '/order-lookup' ? <OrderLookup /> : pathname === '/stock-alerts' ? <StockAlerts /> : <Inventory />}</ProtectedSidebar>
  </div><Toaster /></ThemeProvider>;
}
createRoot(document.getElementById('root')!).render(<App />);
