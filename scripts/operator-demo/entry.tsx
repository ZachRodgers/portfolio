import React from 'react';
import {createRoot} from 'react-dom/client';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import App from 'operator/App';
if (process.env.SUPERADMIN_DEMO !== 'true') {
 sessionStorage.removeItem('operator_demo_walkthrough_session');
 sessionStorage.setItem('demo_lot_active','true');
 localStorage.removeItem('walkthrough_completed_v1');
}
const root=createRoot(document.getElementById('root')!);
const start=()=>{
 if(process.env.SUPERADMIN_DEMO === 'true') window.dispatchEvent(new Event('superadmin-preview-start'));
 root.render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><App/></QueryClientProvider>);
};
if(process.env.SUPERADMIN_DEMO === 'true' && window.parent !== window){
 const onVisibility=(event:MessageEvent)=>{
  if(event.origin!==location.origin || event.source!==window.parent || event.data?.type!=='mc-demo' || !event.data.visible)return;
  window.removeEventListener('message',onVisibility);
  start();
 };
 window.addEventListener('message',onVisibility);
}else start();
document.addEventListener('click',event=>{
 const target=(event.target as HTMLElement).closest('[data-nav-path],a') as HTMLElement|null;
 if(!target)return;
 const route=target.getAttribute('data-nav-path');
 const href=target.getAttribute('href');
 if((process.env.SUPERADMIN_DEMO !== 'true'&&route&&!/\/dashboard(?:\/|$)|\/(settings|advanced|registry|occupants|violators)$/.test(route))||(href&&/^https?:|mailto:/.test(href))){
  event.preventDefault();event.stopPropagation();
 }
},true);
