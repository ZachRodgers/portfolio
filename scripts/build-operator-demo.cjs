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
b.onLoad({filter:/src\/App.tsx$/},args=>({contents:fs.readFileSync(args.path,'utf8').replace('BrowserRouter as Router','MemoryRouter as Router').replace('import WalkthroughOverlay', 'import { useWalkthrough } from "./components/Walkthrough/WalkthroughContext";\nfunction DemoStart(){const {start}=useWalkthrough();const ref=React.useRef(start);ref.current=start;React.useEffect(()=>{const timer=setTimeout(()=>ref.current(),1200);return ()=>clearTimeout(timer)},[]);return null}\nimport WalkthroughOverlay').replace('<WalkthroughOverlay />','<WalkthroughOverlay /><DemoStart />').replace('<Router>','<Router initialEntries={["/lot/demo/dashboard"]}>'),loader:'tsx',resolveDir:path.dirname(args.path)}));
b.onLoad({filter:/\.[jt]sx?$/},args=>{if(!args.path.startsWith(source+'/src/'))return;return {contents:fs.readFileSync(args.path,'utf8').replaceAll('/assets/','./assets/').replaceAll('dashboard/Selected_Dashboard.svg','nav/DashboardSelected.svg').replaceAll('assets/MoreVertical.svg','assets/occupants/mobile_more.svg').replace('className={`violator-row', 'data-walkthrough="first-violator-row" className={`violator-row').replace('if (!isDemoLotActive()) return;', '').replaceAll('walkthrough_session_handled','operator_demo_walkthrough_session'),loader:args.path.endsWith('tsx')?'tsx':'ts',resolveDir:path.dirname(args.path)}});
b.onLoad({filter:/\.css$/},args=>({contents:fs.readFileSync(args.path,'utf8').replace(/@import url\([^\n]+\);/g,''),loader:'css',resolveDir:path.dirname(args.path)}));
}}]});
fs.cpSync('scripts/operator-demo/fonts',out+'/fonts',{recursive:true});
fs.appendFileSync(out+'/app.css',[400,600,700].map(weight=>`@font-face{font-family:Montserrat;font-style:normal;font-weight:${weight};font-display:swap;src:url(./fonts/montserrat-${weight}.ttf) format('truetype')}`).join(''));
fs.copyFileSync(source+'/LICENSE',out+'/LICENSE');
fs.cpSync(source+'/public/assets',out+'/assets',{recursive:true});
fs.writeFileSync(out+'/index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; connect-src \'none\'; img-src \'self\' data: blob:; font-src \'self\' data:"><title>Parallel Operator tutorial</title><link rel="stylesheet" href="app.css"></head><body><div id="root"></div><script src="app.js"></script></body></html>');
const packages=new Set();for(const f of Object.keys(result.metafile.inputs)){const pos=f.lastIndexOf('/node_modules/');if(pos<0)continue;const parts=f.slice(pos+14).split('/');packages.add(f.slice(0,pos+14)+parts.slice(0,parts[0].startsWith('@')?2:1).join('/'))}
let notices='';for(const dir of packages){if(!fs.existsSync(dir))continue;for(const name of fs.readdirSync(dir).filter(n=>/^(license|copying|notice)(\.|$)/i.test(n))){const file=path.join(dir,name);if(fs.statSync(file).isFile())notices+='\n'+path.basename(dir)+' — '+name+'\n'+fs.readFileSync(file,'utf8')+'\n'}}
fs.writeFileSync(out+'/THIRD_PARTY_NOTICES.txt',notices);
fs.writeFileSync(out+'/source-manifest.json',JSON.stringify(Object.keys(result.metafile.inputs).filter(f=>f.startsWith(source+'/src')).map(f=>({path:path.relative(source,f),sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')})),null,2));
})();
