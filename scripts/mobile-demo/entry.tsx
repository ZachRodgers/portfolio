import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {NavigationContainer,DefaultTheme,createNavigationContainerRef} from '@react-navigation/native';
import {SafeAreaProvider,SafeAreaInsetsContext} from 'react-native-safe-area-context';
import MainNavigator from 'mobile/navigation/MainNavigator';
import {ThemeProvider} from 'mobile/context/ThemeContext';
import {WalletProvider} from 'mobile/context/WalletContext';
import {AuthProvider} from 'mobile/context/AuthContext';
import {PlateSelectionProvider} from 'mobile/context/PlateSelectionContext';
import {FilterProvider} from 'mobile/context/FilterContext';
import {WebAlertProvider} from 'mobile/components/WebAlert';
import {useAppRedirection} from 'mobile/hooks/useAppRedirection';
import {setScenario} from './api';
import './style.css';
const navigation=createNavigationContainerRef<any>();
function DemoNavigator({feature}:any){const redirection=useAppRedirection();return <MainNavigator initialRoute={feature==='Alert'?'UnpaidVisits':feature==='Parked'?'CurrentVisit':'Map'} redirectionState={redirection}/>}
function App(){const [feature,setFeature]=useState('Map');useEffect(()=>{const receive=(e:MessageEvent)=>{if(e.origin!==location.origin||e.source!==parent)return;const value=e.data?.mobileFeature;if(!['Map','Parked','Alert'].includes(value))return;setScenario(value);setFeature(value)};addEventListener('message',receive);return()=>removeEventListener('message',receive)},[]);
return <ThemeProvider><SafeAreaProvider initialMetrics={{frame:{x:0,y:0,width:393,height:860},insets:{top:44,bottom:28,left:0,right:0}}}><SafeAreaInsetsContext.Provider value={{top:44,bottom:28,left:0,right:0}}><WebAlertProvider><WalletProvider><AuthProvider><PlateSelectionProvider><FilterProvider><NavigationContainer key={feature} ref={navigation} theme={DefaultTheme}><DemoNavigator feature={feature}/></NavigationContainer></FilterProvider></PlateSelectionProvider></AuthProvider></WalletProvider></WebAlertProvider></SafeAreaInsetsContext.Provider></SafeAreaProvider></ThemeProvider>}
createRoot(document.getElementById('root')!).render(<App/>);
