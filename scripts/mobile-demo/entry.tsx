import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {NavigationContainer,DefaultTheme} from '@react-navigation/native';
import {SafeAreaProvider,SafeAreaInsetsContext} from 'react-native-safe-area-context';
import MainNavigator from 'mobile/navigation/MainNavigator';
import LoadingLogo from 'mobile/components/LoadingLogo';
import {ThemeProvider} from 'mobile/context/ThemeContext';
import {WalletProvider} from 'mobile/context/WalletContext';
import {AuthProvider} from 'mobile/context/AuthContext';
import {PlateSelectionProvider} from 'mobile/context/PlateSelectionContext';
import {FilterProvider} from 'mobile/context/FilterContext';
import {WebAlertProvider} from 'mobile/components/WebAlert';
import {useAppRedirection} from 'mobile/hooks/useAppRedirection';
import {setScenario} from './api';
import {beginReveal} from './reveal-gate.cjs';
import './style.css';
function DemoNavigator({feature}: {feature:string}){const redirection=useAppRedirection();return <MainNavigator initialRoute={feature==='Alert'?'UnpaidVisits':feature==='Parked'?'CurrentVisit':'Map'} redirectionState={redirection}/>}
type Feature = 'Map'|'Parked'|'Alert';
type Screen = { id:number; feature:Feature; direction:'left'|'right'; initial:boolean };
function ScreenLayer({screen,onComplete}:{screen:Screen;onComplete:(id:number)=>void}) {
 const ref=useRef<HTMLDivElement>(null);
 const [entering,setEntering]=useState(screen.initial);
 useEffect(()=>{
  if(screen.initial)return;
  let finished=false;
  const start=()=>{if(finished)return;finished=true;setEntering(true)};
  const check=()=>{const el=ref.current;if(!el)return;const ready=screen.feature==='Map'?!!el.querySelector('.leaflet-map-container'):screen.feature==='Parked'?el.textContent?.includes('You are currently parked at'):el.textContent?.includes('Unpaid Account Balance');if(ready)start()};
  const poll=setInterval(check,50);const fallback=setTimeout(start,3000);check();
  return()=>{clearInterval(poll);clearTimeout(fallback)};
 },[screen.feature,screen.initial]);
 useEffect(()=>{if(!entering||screen.initial)return;const timer=setTimeout(()=>onComplete(screen.id),450);return()=>clearTimeout(timer)},[entering,screen.id,screen.initial,onComplete]);
 return <div ref={ref} data-mobile-screen={screen.feature} className={'mobile-screen-layer'+(!screen.initial?' mobile-screen-layer--'+screen.direction:'')+(!screen.initial&&entering?' mobile-screen-layer--entering':'')}><NavigationContainer theme={DefaultTheme}><DemoNavigator feature={screen.feature}/></NavigationContainer></div>;
}
function App(){
 const [started,setStarted]=useState(window.parent===window),[revealed,setRevealed]=useState(false),[hidden,setHidden]=useState(false);
 const sequence=useRef(0),selected=useRef<Feature>('Map');
 const [screens,setScreens]=useState<Screen[]>([{id:0,feature:'Map',direction:'right',initial:true}]);
 const finishScreen=React.useCallback((id:number)=>setScreens(current=>current[current.length-1]?.id===id?[{...current[current.length-1],initial:true}]:current),[]);
 const navigateFeature=(value:Feature)=>{if(value===selected.current)return;const direction=['Map','Parked','Alert'].indexOf(value)>['Map','Parked','Alert'].indexOf(selected.current)?'right':'left';selected.current=value;setScenario(value);const next:Screen={id:++sequence.current,feature:value,direction,initial:matchMedia('(prefers-reduced-motion: reduce)').matches};setScreens(current=>next.initial?[next]:[current[current.length-1],next]);};
 useEffect(()=>{const receive=(e:MessageEvent)=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='mobile-start')setStarted(true);const value=e.data?.mobileFeature;if(['Map','Parked','Alert'].includes(value))navigateFeature(value as Feature)};addEventListener('message',receive); if(window.parent!==window) window.parent.postMessage({type:'mobile-preview-ready'},location.origin); return()=>removeEventListener('message',receive)},[]);
 useEffect(()=>{if(started || window.parent===window)return;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setStarted(true);observer.disconnect()}},{threshold:0.15});observer.observe(document.documentElement);return()=>observer.disconnect()},[started]);
 useEffect(()=>{if(started)return;const fallback=setTimeout(()=>setStarted(true),2000);return()=>clearTimeout(fallback)},[started]);
 useEffect(()=>{if(!started)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;return beginReveal({reduced,isReady:()=>!!document.querySelector('.leaflet-tile-loaded') && !!document.querySelector('.leaflet-marker-icon'),onReveal:()=>{setRevealed(true);if(!reduced)window.dispatchEvent(new Event('mobile-reveal'))}})},[started]);
 useEffect(()=>{const pop=()=>{let index=0;const seen=new WeakSet<Element>();const apply=()=>{document.querySelectorAll('.leaflet-marker-pane .leaflet-marker-icon > div').forEach(marker=>{if(seen.has(marker))return;seen.add(marker);const element=marker as HTMLElement;element.style.animationDelay=`${Math.min(index++,20)*55}ms`;element.classList.add('mobile-marker-pop')})};apply();const observer=new MutationObserver(apply);observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),1600)};window.addEventListener('mobile-reveal',pop);return()=>window.removeEventListener('mobile-reveal',pop)},[]);
 useEffect(()=>{if(!revealed)return;const timeout=setTimeout(()=>setHidden(true),matchMedia('(prefers-reduced-motion: reduce)').matches?0:350);return()=>clearTimeout(timeout)},[revealed]);
 return <ThemeProvider><SafeAreaProvider initialMetrics={{frame:{x:0,y:0,width:393,height:860},insets:{top:44,bottom:28,left:0,right:0}}}><SafeAreaInsetsContext.Provider value={{top:44,bottom:28,left:0,right:0}}><WebAlertProvider><WalletProvider><AuthProvider><PlateSelectionProvider><FilterProvider><div className="mobile-screen-stage">{screens.map(screen=><ScreenLayer key={screen.id} screen={screen} onComplete={finishScreen}/>)}</div></FilterProvider></PlateSelectionProvider></AuthProvider></WalletProvider></WebAlertProvider>{!hidden&&<div className={'mobile-loading'+(revealed?' mobile-loading--revealed':'')} aria-label="Loading app" role="status"><LoadingLogo text="" /></div>}</SafeAreaInsetsContext.Provider></SafeAreaProvider></ThemeProvider>;
}
createRoot(document.getElementById('root')!).render(<App/>);
