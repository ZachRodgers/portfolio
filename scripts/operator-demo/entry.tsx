import React from 'react';
import {createRoot} from 'react-dom/client';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import App from 'operator/App';
sessionStorage.removeItem('operator_demo_walkthrough_session');
sessionStorage.setItem('demo_lot_active','true');
localStorage.removeItem('walkthrough_completed_v1');
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><App/></QueryClientProvider>);
document.addEventListener('click',event=>{
 const target=(event.target as HTMLElement).closest('[data-nav-path],a') as HTMLElement|null;
 if(!target)return;
 const route=target.getAttribute('data-nav-path');
 const href=target.getAttribute('href');
 if((route&&!/\/dashboard(?:\/|$)|\/(settings|advanced|registry|occupants|violators)$/.test(route))||(href&&/^https?:|mailto:/.test(href))){
  event.preventDefault();event.stopPropagation();
 }
},true);
