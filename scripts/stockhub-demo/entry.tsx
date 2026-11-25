import React, {useEffect} from 'react';
import {useTheme} from 'next-themes';
import {createRoot} from 'react-dom/client';
import Inventory from '@/app/(protected)/inventory/page';
import OrderLookup from '@/app/(protected)/order-lookup/page';
import History from '@/app/(protected)/history/page';
import StockAlerts from '@/app/(protected)/stock-alerts/page';
import {usePathname} from './stubs';
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
  return <ThemeProvider><ThemeBridge /><div className="h-svh flex flex-col overflow-hidden">
    <ProtectedSidebar user={user}>{pathname === '/history' ? <History /> : pathname === '/order-lookup' ? <OrderLookup /> : pathname === '/stock-alerts' ? <StockAlerts /> : <Inventory />}</ProtectedSidebar>
  </div><Toaster /></ThemeProvider>;
}
createRoot(document.getElementById('root')!).render(<App />);
