import {team} from './people';
type DemoUser={id:string;email:string;name:string|null;role:string;status:string;created_at:string;activity:number[]};
type Upload={id:string;file_name:string;file_type:string;uploaded_at:string;uploaded_by:string;row_count:number;processing_time_ms:number;status:string};
const usersKey='stockhub-demo:admin-users',uploadsKey='stockhub-demo:admin-uploads';
const previousNames=['zach','morgan','sam','taylor','jordan','alex','riley','jamie'];
const activityDays = [
  [0, 5, 9, 15, 20],
  [0, 6, 10, 15],
  [0, 6, 13, 20, 29],
  [2, 8, 16, 24],
  [5, 12, 20, 25],
  [9, 18, 24],
  [],
  [],
];
const initialUsers:DemoUser[]=team.map((person,i)=>({id:i===0?'cedar-bolt-demo':`demo-user-${i}`,email:person.email,name:person.name,role:i<2?'admin':'user',status:i===7?'paused':i===6?'pending':'active',created_at:`2026-0${1+i}-12T10:00:00Z`,activity:Array.from({length:30},(_,d)=>activityDays[i].includes(d)?1:0)}));
const types=['inventory','order','receipt','adjustment','stock_alert','cancelled_order'];
const initialUploads:Upload[]=Array.from({length:18},(_,i)=>({id:`upload-${i}`,file_name:`cedar_bolt_${types[i%types.length]}_${String(24-i%24).padStart(2,'0')}.csv`,file_type:types[i%types.length],uploaded_at:`2026-11-${String(24-i%24).padStart(2,'0')}T13:30:00Z`,uploaded_by:[team[1].name,team[0].name,team[2].name][i%3],row_count:30+i*12,processing_time_ms:340+i*32,status:'processed'}));
function archiveUploads():Upload[] {
  const now=new Date();const start=Date.UTC(now.getUTCFullYear(),0,1);const end=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  const occupied=new Set(initialUploads.map(upload=>upload.uploaded_at.slice(0,10)));
  const archive:Upload[]=[];
  for(let time=start,day=0;time<=end;time+=86400000,day++) {
    const date=new Date(time);const stamp=date.toISOString().slice(0,10);
    if(occupied.has(stamp))continue;
    const type=types[day%types.length];
    archive.push({id:`archive-${stamp}`,file_name:`cedar_bolt_${type}_${stamp}.csv`,file_type:type,uploaded_at:`${stamp}T13:30:00Z`,uploaded_by:[team[1].name,team[0].name,team[2].name][day%3],row_count:30+(day%12)*8,processing_time_ms:300+(day%9)*42,status:'processed'});
  }
  return archive;
}
function read<T>(key:string,initial:T):T {try {const v=localStorage.getItem(key);return v?JSON.parse(v):initial;}catch{return initial;}}
function write(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
export function demoUsers(){return read<DemoUser[]>(usersKey,initialUsers).map(user=>{
  const index=initialUsers.findIndex(initial=>initial.id===user.id);
  const oldPattern=index>=0 && user.activity?.length===14 && user.activity.every((value,day)=>value===(index*3+day*7)%9);
  const previousEmail=index>0 ? `${previousNames[index]}@cedarbolt.example` : '';
  const renamed=index>0 && user.email===previousEmail ? {name:initialUsers[index].name,email:initialUsers[index].email} : {};
  return {...user,...renamed,...(oldPattern ? {activity:initialUsers[index].activity} : {})};
})}
export function demoUploads(){
  const stored=read<Upload[]>(uploadsKey,initialUploads);
  const existing=new Set(stored.map(upload=>upload.id));
  return [...stored,...archiveUploads().filter(upload=>!existing.has(upload.id))].map(upload=>{
    if(!/^upload-\d+$/.test(upload.id)) return upload;
    const names:Record<string,string>={'Morgan Lee':team[1].name,'Sam Rivera':team[2].name};
    return names[upload.uploaded_by] ? {...upload,uploaded_by:names[upload.uploaded_by]} : upload;
  }).sort((a,b)=>b.uploaded_at.localeCompare(a.uploaded_at));
}
export function mutateUsers(method:string,body:any){let users=demoUsers();if(method==='POST'){users=[...users,{id:`demo-${Date.now()}`,email:String(body.email),name:null,role:body.role||'user',status:'pending',created_at:new Date().toISOString(),activity:Array(30).fill(0)}];}else if(method==='DELETE')users=users.filter(u=>u.id!==body.id);else users=users.map(u=>u.id!==body.id?u:{...u,role:body.role??u.role,status:body.action==='pause'?'paused':body.action==='unpause'?'active':u.status});write(usersKey,users);return {ok:true,status:body.action==='pause'?'paused':'active'};}
export function demoAnalytics(){
  const users=demoUsers();const now=new Date();
  const prior=[0,0,1,0,0,1,0,0,0,1,0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0,0];
  const recent=Array.from({length:30},(_,day)=>users.reduce((sum,user)=>sum+(user.activity[day]||0),0));
  const counts=[...prior,...recent];
  const signInTrend=counts.map((signIns,i)=>{const d=new Date(now);d.setUTCDate(d.getUTCDate()-(59-i));return {date:d.toISOString().slice(0,10),signIns}});
  const start=new Date(Date.UTC(now.getUTCFullYear(),0,1));
  const days=Math.floor((Date.UTC(now.getUTCFullYear(),11,31)-start.getTime())/86400000)+1;
  const uploads=demoUploads();
  const uploadConsistency=Array.from({length:days},(_,i)=>{const d=new Date(start.getTime()+i*86400000);const future=d.getTime()>now.getTime();const date=d.toISOString().slice(0,10);const count=!future?uploads.filter(u=>u.uploaded_at.startsWith(date)).length:0;return {date,uploads:count,hasUpload:count?1:0,isFuture:future}});
  const today=recent[29],week=recent.slice(-7).reduce((a,b)=>a+b,0),month=recent.reduce((a,b)=>a+b,0);
  return {users:{total:users.length,active:users.filter(u=>u.status==='active').length,pending:users.filter(u=>u.status==='pending').length,paused:users.filter(u=>u.status==='paused').length,admin:users.filter(u=>u.role==='admin').length,user:users.filter(u=>u.role==='user').length},auth:{signIns:{today,week,month},uniqueUsers30d:users.filter(u=>u.activity.some(v=>v>0)).length},signInTrend,hourlyTrend:Array.from({length:24},(_,hour)=>({hour,label:`${String(hour).padStart(2,'0')}:00`,signIns:hour===10?today:0})),uploadConsistency,insights:{mostVisitedPage:'/inventory',mostVisitedCount:182,avgSessionSeconds:262,mostCommonAction:'search',mostCommonActionCount:146}};
}
export function adminResponse(path:string,p:URLSearchParams,options?:RequestInit):unknown {
 const method=options?.method||'GET';const body=options?.body?JSON.parse(String(options.body)):{};
 if(path==='/api/admin/analytics')return demoAnalytics();
 if(path==='/api/admin/users') {if(method!=='GET')return mutateUsers(method,body);const users=demoUsers(),page=Number(p.get('page')||1),limit=Number(p.get('limit')||10);return {users:users.slice((page-1)*limit,page*limit),total:users.length};}
 if(path==='/api/admin/csv-uploads') {const uploads=demoUploads(),page=Number(p.get('page')||1),limit=Number(p.get('limit')||10);return {uploads:uploads.slice((page-1)*limit,page*limit),total:uploads.length};}
 if(path==='/api/admin/csv-uploads-by-date') {const uploads=demoUploads().filter(u=>u.uploaded_at.startsWith(p.get('date')||''));return {date:p.get('date'),timezone:p.get('tz')||'UTC',count:uploads.length,uploads:uploads.map(u=>({id:u.id,fileName:u.file_name,fileType:u.file_type,status:u.status,rowCount:u.row_count,processingTimeMs:u.processing_time_ms,uploadedAt:u.uploaded_at}))};}
 throw new Error('Unavailable admin endpoint');
}

const pendingUploads=new Map<string,{name:string;type:string}>();
export function beginUpload(path:string,body:Record<string,string>) {
  const id=`demo-upload-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const name=[body.fileName,body.stockFileName,body.unitFileName,body.headerFileName,body.detailFileName].filter(Boolean).join(' + ');
  const kind=path.split('/')[2];const type=({inventory:'inventory',orders:'order',receipts:'receipt',adjustments:'adjustment','stock-alerts':'stock_alert','cancelled-orders':'cancelled_order'} as Record<string,string>)[kind]||kind;
  pendingUploads.set(id,{name,type});const url=`demo-upload://${id}`;
  return {uploadId:id,signedUrl:url,storagePath:id,stockSignedUrl:url,stockPath:id,unitSignedUrl:url,unitPath:id,headerSignedUrl:url,headerPath:id,detailSignedUrl:url,detailPath:id};
}
export function finishUpload(id:string) {
  const upload=pendingUploads.get(id);if(!upload)throw new Error('Unknown demo upload');pendingUploads.delete(id);
  const records=demoUploads();records.unshift({id,file_name:upload.name,file_type:upload.type,uploaded_at:new Date().toISOString(),uploaded_by:'Zach',row_count:0,processing_time_ms:500,status:'processed'});write(uploadsKey,records);return {rowCount:0};
}
