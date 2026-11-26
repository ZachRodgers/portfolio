const fs=require('fs'),path=require('path'),crypto=require('crypto');
const source=process.env.OPERATOR_SOURCE||'/home/Zach/Parallel/Code/operator';
const out='public/assets/ux_ui/content/portfolio/parallel/demo';
const esbuild=require('/home/Zach/Repos/mission-control/node_modules/esbuild');
fs.mkdirSync(out,{recursive:true});
(async()=>{
const result=await esbuild.build({entryPoints:['scripts/operator-demo/entry.tsx'],bundle:true,minify:true,metafile:true,jsx:'automatic',outfile:out+'/app.js',define:{'process.env.NODE_ENV':'"production"','process.env.PUBLIC_URL':'"."'},alias:{operator:source+'/src',react:source+'/node_modules/react','react-dom':source+'/node_modules/react-dom'},nodePaths:[source+'/node_modules'],loader:{'.svg':'file','.png':'file','.jpg':'file','.woff2':'file'},assetNames:'assets/[name]-[hash]',plugins:[{name:'local-demo',setup(b){
b.onResolve({filter:/^\/public\/assets\//},args=>({path:source+args.path}));
b.onResolve({filter:/^\.\/user$/},()=>({path:path.resolve('scripts/operator-demo/user.tsx')}));
b.onResolve({filter:/UserContext$/},()=>({path:path.resolve('scripts/operator-demo/user.tsx')}));
b.onLoad({filter:/utils\/ProtectedRoute.tsx$/},()=>({contents:'export default function ProtectedRoute({children}) {return children}',loader:'tsx'}));
b.onLoad({filter:/utils\/api.ts$/},args=>{const original=fs.readFileSync(args.path,'utf8');return {contents:fs.readFileSync('scripts/operator-demo/api-prefix.ts','utf8')+'\n'+original.slice(original.indexOf('export const userService')),loader:'ts',resolveDir:path.dirname(args.path)}});
b.onLoad({filter:/src\/App.tsx$/},args=>({contents:fs.readFileSync(args.path,'utf8').replace('BrowserRouter as Router','MemoryRouter as Router').replace('import WalkthroughOverlay', 'import DemoBridge from "'+path.resolve('scripts/operator-demo/theme-bridge.tsx')+'";\nimport WalkthroughOverlay').replace('<ThemeProvider>', '<ThemeProvider><DemoBridge />').replace('import WalkthroughOverlay', 'import { useWalkthrough } from "./components/Walkthrough/WalkthroughContext";\nfunction DemoStart(){const {start}=useWalkthrough();const ref=React.useRef(start);ref.current=start;React.useEffect(()=>{const timer=setTimeout(()=>ref.current(),1200);return ()=>clearTimeout(timer)},[]);return null}\nimport WalkthroughOverlay').replace('<WalkthroughOverlay />','<WalkthroughOverlay /><DemoStart />').replace('<Router>','<Router initialEntries={["/lot/demo/dashboard"]}>'),loader:'tsx',resolveDir:path.dirname(args.path)}));
b.onLoad({filter:/pages\/Dashboard\/DashboardHeader\.tsx$/},args=>{
 let contents=fs.readFileSync(args.path,'utf8');
 const before='<span>{getFormattedDateRange(timeframe)}</span>';
 const after=`<span title={getFormattedDateRange(timeframe)}>{getFormattedDateRange(timeframe)
   .replace(/\\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\\b/g, day => day.slice(0, 3))
   .replace(/\\b(January|February|March|April|May|June|July|August|September|October|November|December)\\b/g, month => month.slice(0, 3))
   .replace(/(\\d+)(st|nd|rd|th)\\b/g, '$1')
   .replace(/, \\d{4} \\(Today\\)/, '')
   .replace(/, \\d{4} \\(This Week\\)/, '')
   .replace(/ \\d{4} \\(This Month to Today\\)/, ' (to date)')
   .replace(/, \\d{4}(?![0-9])/, '')
   .replace(' (This Year to Today)', ' (to date)')}</span>`;
 if(!contents.includes(before))throw new Error('Dashboard date display changed');
 return {contents:contents.replace(before,after).replaceAll('/assets/','./assets/'),loader:'tsx',resolveDir:path.dirname(args.path)};
});
b.onLoad({filter:/pages\/Dashboard\/Occupancy\.tsx$/},args=>{
 let contents=fs.readFileSync(args.path,'utf8');
 const before='weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC"';
 if(!contents.includes(before))throw new Error('Occupancy peak date format changed');
 contents=contents.split(before).join('weekday: "short", month: "short", day: "numeric", timeZone: "UTC"');
 return {contents:contents.replaceAll('/assets/','./assets/'),loader:'tsx',resolveDir:path.dirname(args.path)};
});
b.onLoad({filter:/pages\/Dashboard\/(Emissions|DwellTime)\.tsx$/},args=>{
 let contents=fs.readFileSync(args.path,'utf8');
 if(args.path.endsWith('Emissions.tsx')){
  const before='Total: <motion.span>{displayVehicles}</motion.span> Other vehicles';
  if(!contents.includes(before))throw new Error('Emissions total changed');
  contents=contents.replace(before,'Total: {Math.max(0, metrics.totalVehicles - metrics.totalEV)} other vehicles').replace('kg of CO₂ last week.', 'kg of CO₂ in this period.');
 } else contents=contents.replace('Last week, on average vehicles parked for', 'In this period, vehicles parked for');
 return {contents:contents.replaceAll('/assets/','./assets/'),loader:'tsx',resolveDir:path.dirname(args.path)};
});
b.onLoad({filter:/components\/Walkthrough\/steps\.ts$/},args=>{
 const sourceText=fs.readFileSync(args.path,'utf8');
 const downloadStep=/  \{\n    id: "download",[\s\S]*?(?=  \{\n    id: "ai-ask",)/;
 if(!downloadStep.test(sourceText))throw new Error('Walkthrough download step changed');
 return {contents:sourceText.replace(downloadStep,''),loader:'ts',resolveDir:path.dirname(args.path)};
});
b.onLoad({filter:/components\/ai\/Chat\.tsx$/},args=>{
  let contents=fs.readFileSync(args.path,'utf8');
  const changes=[
    ['messageEndRef.current?.scrollIntoView({ behavior: "auto" });','if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;'],
    ['messageEndRef.current?.scrollIntoView({ behavior });','messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior });'],
    ['const totalDuration = animSource.length > 200 ? 800 : 400;','const totalDuration = animSource.length > 200 ? 1400 : 1000;'],
  ];
  for(const [before,after] of changes){if(!contents.includes(before))throw new Error('Chat preview source changed: '+before);contents=contents.replace(before,after)}
  return {contents:contents.replaceAll('/assets/','./assets/'),loader:'tsx',resolveDir:path.dirname(args.path)};
});
b.onLoad({filter:/\.[jt]sx?$/},args=>{if(!args.path.startsWith(source+'/src/'))return;return {contents:fs.readFileSync(args.path,'utf8').replaceAll('/assets/','./assets/').replace('                  Phone Number\n                  <img', '                  Phone\n                  <img').replaceAll('dashboard/Selected_Dashboard.svg','nav/DashboardSelected.svg').replaceAll('assets/MoreVertical.svg','assets/occupants/mobile_more.svg').replace('className={`violator-row', 'data-walkthrough={row === items[0] ? "first-violator-row" : undefined} className={`violator-row').replace('if (!isDemoLotActive()) return;', '').replace("notes: violationDetails[row.plateNumber]?.[0]?.initialNotes || ''", "notes: violationDetails[row.plateNumber]?.[0]?.initialNotes || (row as any).initialNotes || ''").replaceAll('walkthrough_session_handled','operator_demo_walkthrough_session'),loader:args.path.endsWith('tsx')?'tsx':'ts',resolveDir:path.dirname(args.path)}});
b.onLoad({filter:/\.css$/},args=>({contents:fs.readFileSync(args.path,'utf8').replace(/@import url\([^\n]+\);/g,''),loader:'css',resolveDir:path.dirname(args.path)}));
}}]});
fs.cpSync('scripts/operator-demo/fonts',out+'/fonts',{recursive:true});
fs.appendFileSync(out+'/app.css',fs.readFileSync('scripts/operator-demo/demo.css','utf8'));
fs.appendFileSync(out+'/app.css',[400,600,700].map(weight=>`@font-face{font-family:Montserrat;font-style:normal;font-weight:${weight};font-display:swap;src:url(./fonts/montserrat-${weight}.ttf) format('truetype')}`).join(''));
fs.copyFileSync(source+'/LICENSE',out+'/LICENSE');
fs.copyFileSync(source+'/public/Favicon.png',out+'/favicon.png');
fs.cpSync(source+'/public/assets',out+'/assets',{recursive:true});
fs.copyFileSync('scripts/operator-demo/demo-vehicle.png',out+'/assets/demo-vehicle.png');
fs.writeFileSync(out+'/index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; connect-src \'none\'; img-src \'self\' data: blob:; font-src \'self\' data:"><title>Parallel Operator tutorial</title><link rel="stylesheet" href="app.css"></head><body><div id="root"></div><script src="app.js"></script></body></html>');
fs.writeFileSync(out+'/source-manifest.json',JSON.stringify(Object.keys(result.metafile.inputs).filter(f=>f.startsWith(source+'/src')).map(f=>({path:path.relative(source,f),sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')})),null,2));
})();
