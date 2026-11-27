import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {NavigationContainer,DefaultTheme,createNavigationContainerRef} from '@react-navigation/native';
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
const navigation=createNavigationContainerRef<any>();
function DemoNavigator({feature}: {feature:string}){const redirection=useAppRedirection();return <MainNavigator initialRoute={feature==='Alert'?'UnpaidVisits':feature==='Parked'?'CurrentVisit':'Map'} redirectionState={redirection}/>}
function App(){
 const [started,setStarted]=useState(window.parent===window),[revealed,setRevealed]=useState(false),[hidden,setHidden]=useState(false);
 const [feature,setFeature]=useState('Map');
 const navigateFeature=(value:string)=>{setScenario(value);setFeature(value)};
 useEffect(()=>{const receive=(e:MessageEvent)=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='mobile-start')setStarted(true);const value=e.data?.mobileFeature;if(['Map','Parked','Alert'].includes(value))navigateFeature(value)};addEventListener('message',receive); if(window.parent!==window) window.parent.postMessage({type:'mobile-preview-ready'},location.origin); return()=>removeEventListener('message',receive)},[]);
 useEffect(()=>{if(started || window.parent===window)return;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setStarted(true);observer.disconnect()}},{threshold:0.15});observer.observe(document.documentElement);return()=>observer.disconnect()},[started]);
 useEffect(()=>{if(started)return;const fallback=setTimeout(()=>setStarted(true),2000);return()=>clearTimeout(fallback)},[started]);
 useEffect(()=>{if(!started)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;return beginReveal({reduced,isReady:()=>!!document.querySelector('.leaflet-tile-loaded') && !!document.querySelector('.leaflet-marker-icon'),onReveal:()=>{setRevealed(true);if(!reduced)window.dispatchEvent(new Event('mobile-reveal'))}})},[started]);
 useEffect(()=>{const pop=()=>{let index=0;const seen=new WeakSet<Element>();const apply=()=>{document.querySelectorAll('.leaflet-marker-pane .leaflet-marker-icon > div').forEach(marker=>{if(seen.has(marker))return;seen.add(marker);const element=marker as HTMLElement;element.style.animationDelay=`${Math.min(index++,20)*55}ms`;element.classList.add('mobile-marker-pop')})};apply();const observer=new MutationObserver(apply);observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),1600)};window.addEventListener('mobile-reveal',pop);return()=>window.removeEventListener('mobile-reveal',pop)},[]);
 useEffect(()=>{if(!revealed)return;const timeout=setTimeout(()=>setHidden(true),matchMedia('(prefers-reduced-motion: reduce)').matches?0:350);return()=>clearTimeout(timeout)},[revealed]);
 return <ThemeProvider><SafeAreaProvider initialMetrics={{frame:{x:0,y:0,width:393,height:860},insets:{top:44,bottom:28,left:0,right:0}}}><SafeAreaInsetsContext.Provider value={{top:44,bottom:28,left:0,right:0}}><WebAlertProvider><WalletProvider><AuthProvider><PlateSelectionProvider><FilterProvider><NavigationContainer key={feature} ref={navigation} theme={DefaultTheme}><DemoNavigator feature={feature}/></NavigationContainer></FilterProvider></PlateSelectionProvider></AuthProvider></WalletProvider></WebAlertProvider>{!hidden&&<div className={'mobile-loading'+(revealed?' mobile-loading--revealed':'')} aria-label="Loading app" role="status"><LoadingLogo text="" /></div>}</SafeAreaInsetsContext.Provider></SafeAreaProvider></ThemeProvider>;
}
createRoot(document.getElementById('root')!).render(<App/>);
