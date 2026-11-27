import axios from 'axios';
import {lot,user} from './user';
let pricing:any={pricingId:'demo-price',hourlyRate:4,dailyMaximumPrice:24,gracePeriod:600,maximumTime:24,ticketAmount:45,freeParking:false,allowValidation:true};
let advanced:any[]=[]; let enabled=false; let counter=0;
let registry:any[]=[
 {registryId:'registry-1',lotId:'demo',plateNumber:'BRONTO1',name:'Bronto Saurus',email:'bronto@dinomail.test',phone:'',permitId:null},
 {registryId:'registry-2',lotId:'demo',plateNumber:'RAPTORX',name:'Veloci Raptor',email:'velo@dinomail.test',phone:'647-555-0199',permitId:null},
 {registryId:'registry-3',lotId:'demo',plateNumber:'TRICERX',name:'Tri Cera Tops',email:'tricera@dinomail.test',phone:'',permitId:null},
 {registryId:'registry-4',lotId:'demo',plateNumber:'ANKYLO7',name:'Anky Lo Saur',email:'anky@dinomail.test',phone:'905-555-7788',permitId:null},
 {registryId:'registry-5',lotId:'demo',plateNumber:'STEGOSA',name:'Stego Saurus',email:'stego@dinomail.test',phone:'',permitId:null},
 {registryId:'registry-6',lotId:'demo',plateNumber:'TREX999',name:'Rex Tinction',email:'rex@dinomail.test',phone:'',permitId:null},
];
const hourWeights = [0.04,0.02,0.02,0.02,0.04,0.10,0.26,0.53,0.82,0.88,0.75,0.84,1,0.93,0.79,0.71,0.80,0.67,0.44,0.28,0.19,0.13,0.08,0.05];
const dailyMetrics=(date:string)=>{
 const d=new Date(date+'T12:00:00'); const day=d.getDay();
 const factor=[0.69,0.92,0.98,1.04,1.01,1.13,0.83][day] * (1 + 0.055*Math.sin(Math.floor(d.getTime()/86400000)*0.73));
 const hours=hourWeights.map((weight,i)=>{
   const variation=1+0.12*Math.sin(i*1.7+d.getDate()*0.38);
   const vehicles=Math.max(0,Math.round(weight*factor*12*variation));
   const registered=Math.round(vehicles*0.23), returning=Math.round(vehicles*0.31), newVisitors=Math.max(0,vehicles-registered-returning);
   const electric=Math.round(vehicles*0.18);
   return {totalRegisteredVehicles:registered,totalUnregisteredReturnVehicles:returning,totalNewVehicles:newVisitors,totalViolations:vehicles>7?1:0,totalElectricVehicles:electric,totalEmissions:Math.round((vehicles-electric)*2.4*10)/10,electricVehicleMakeCount:{Tesla:Math.round(electric*.6),Hyundai:electric-Math.round(electric*.6)},averageVehicleDwellTime:88+Math.round(weight*15),averageRegisteredVehicleDwellTime:145,averageNewVisitorVehicleDwellTime:72,averageReturnVehiclesDwellTime:96,averageElectricVehiclesDwellTime:110,averageViolatorDwellTime:135,timestamp:date+'T'+String(i).padStart(2,'0')+':00:00',totalRevenue:Math.round(vehicles*(4.3+0.3*Math.sin(i))),totalVehicles:vehicles,averageOccupancy:Math.round(15+weight*factor*61),upTime:99.8,pendingRevenue:Math.round(weight*8),subscriberRevenue:Math.round(weight*9),currencyUsed:'CAD'};
 });
 const sum=(key:string)=>hours.reduce((n,h)=>n+Number((h as any)[key]||0),0);
 return {hours, daily:{totalRegisteredVehicles:sum('totalRegisteredVehicles'),totalUnregisteredReturnVehicles:sum('totalUnregisteredReturnVehicles'),totalNewVehicles:sum('totalNewVehicles'),totalViolations:sum('totalViolations'),totalElectricVehicles:sum('totalElectricVehicles'),totalEmissions:sum('totalEmissions'),electricVehicleMakeCount:{Tesla:hours.reduce((n,h)=>n+h.electricVehicleMakeCount.Tesla,0),Hyundai:hours.reduce((n,h)=>n+h.electricVehicleMakeCount.Hyundai,0)},averageVehicleDwellTime:96,averageRegisteredVehicleDwellTime:145,averageNewVisitorVehicleDwellTime:72,averageReturnVehiclesDwellTime:96,averageElectricVehiclesDwellTime:110,averageViolatorDwellTime:135,date,lotId:'demo',totalVehicles:hours.reduce((n,h)=>n+h.totalVehicles,0),totalRevenue:hours.reduce((n,h)=>n+h.totalRevenue,0),averageOccupancy:Math.round(hours.reduce((n,h)=>n+h.averageOccupancy,0)/24),upTime:99.8,pendingRevenue:12,subscriberRevenue:hours.reduce((n,h)=>n+h.subscriberRevenue,0),currencyUsed:'CAD'}};
};
const evidence='./assets/demo-vehicle.png';
const demoRows=[
 {plateNumber:'BRONTO1',vehicleMake:'Toyota',vehicleModel:'Corolla',vehicleColor:'Silver',daysAgo:2,count:2,status:'ACTIVE',plateConfidence:0.98,vehicleConfidence:0.94,initialNotes:'Vehicle exceeded the posted two-hour limit. No active payment found.'},
 {plateNumber:'RAPTORX',vehicleMake:'Honda',vehicleModel:'Civic',vehicleColor:'Blue',daysAgo:4,count:1,status:'DEPARTED',plateConfidence:0.96,vehicleConfidence:0.92,initialNotes:'No valid parking session was found during the visit.'},
 {plateNumber:'TRICERX',vehicleMake:'Ford',vehicleModel:'Escape',vehicleColor:'White',daysAgo:6,count:3,status:'ACTIVE',plateConfidence:0.97,vehicleConfidence:0.91,initialNotes:'Parked beyond the paid session. Follow up if the vehicle returns.'},
 {plateNumber:'STEGOSA',vehicleMake:'Hyundai',vehicleModel:'Elantra',vehicleColor:'Black',daysAgo:9,count:1,status:'DEPARTED',plateConfidence:0.95,vehicleConfidence:0.90,initialNotes:'Vehicle parked in a permit-only space without a registered permit.'},
].map((r,i)=>({...r,latestViolationTimestamp:new Date(Date.now()-r.daysAgo*86400000-4*3600000).toISOString(),latestViolationId:'demo-ticket-'+i,latestLotId:'demo',latestLotName:lot.lotName,lotViolationTotal:r.count,openViolations:r.count,totalAmountOwed:r.count*45,currentlyInLot:r.status==='ACTIVE',allowValidation:true,evidenceURL:i===0?evidence:null,lastSeenLocation:'Harbour Centre'}));
const demoDetails=demoRows.flatMap((r,i)=>Array.from({length:r.count},(_,j)=>({violationTrackerId:j===0?r.latestViolationId:r.latestViolationId+'-'+j,plateNumber:r.plateNumber,lotId:'demo',violationType:['OVERSTAY','UNPAID_SESSION','NO_PERMIT'][(i+j)%3],violationTimestamp:new Date(new Date(r.latestViolationTimestamp).getTime()-j*7*86400000).toISOString(),vehicleMake:r.vehicleMake,vehicleModel:r.vehicleModel,vehicleColor:r.vehicleColor,totalViolationAmount:45,violationStatus:'OPEN',evidenceURL:r.evidenceURL,initialNotes:j===0?r.initialNotes:'Previously observed without a valid parking session.'})));
const messages:any[]=[]; const conversations:any[]=[];
const page=(items:any[])=>({content:items,items,totalElements:items.length,totalPages:1,number:0,size:20,last:true,first:true});
const envelope=(data:any)=>({data:{success:true,data},status:200});
async function request(url:string,body?:any,config?:any):Promise<any>{
 await new Promise(resolve=>setTimeout(resolve,url.includes('send-message')?1000:100));
 if(url.includes('/get-by-id/')) return envelope({...lot,ownerId:user.userId});
 if(url.includes('get-all-operators')||url.includes('get-all-staff')) return envelope([user]);
 if(url.includes('get-lots-by-user')) return envelope([lot]);
 if(url.includes('current-occupancy')) return envelope(74);
 if(url.includes('get-registry-status')) return envelope(lot.registryOn);
 if(url.includes('enable-registry')) {lot.registryOn=true;return envelope(true)}
 if(url.includes('disable-registry')) {lot.registryOn=false;return envelope(false)}
 if(url.includes('get-advanced-pricing-status'))return envelope(enabled);
 if(url.includes('change-advanced-pricing-status')){enabled=url.includes('true');return envelope(enabled)}
 if(url.includes('advanced-settings-state')) {if(body)enabled=body.enabled;return {data:{enabled}}}
 if(url.includes('lotadvancedpricing')) {if(Array.isArray(body))advanced=body;return envelope(advanced)}
 if(url.includes('lotpricing')) {if(body)pricing={...pricing,...body};return envelope(pricing)}
 if(url.includes('/analytics/')){
 const params=config?.params||body?.params||{};
 const date=params.startDate||params.date||new Date().toISOString().slice(0,10);
 if(url.includes('/hourly/'))return envelope(dailyMetrics(date).hours);
 const start=new Date(date+'T12:00:00');const end=new Date((params.endDate||date)+'T12:00:00');
 const count=Math.min(366,Math.max(1,Math.round((+end-+start)/86400000)+1));
 return envelope(Array.from({length:count},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);const key=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');return dailyMetrics(key).daily}));
 }
 if(url.includes('devices')) return envelope(Array.from({length:4},(_,i)=>({deviceId:'demo-camera-'+(i+1),deviceStatus:'Online'})));
 if(url.includes('get-rate-limit')) return envelope({quota:1000,used:messages.length});
 if(url.includes('get-agent-names')) return envelope([{agentKey:'lot_pricing_agent',name:'Pricing',description:'Update parking rates'},{agentKey:'lot_settings_agent',name:'Settings',description:'Manage lot settings'}]);
 if(url.includes('get-conversations')) return envelope(conversations);
 if(url.includes('start-conversation')) {const c={conversationId:'demo-conversation',title:'Harbour Centre',lotId:'demo'};conversations.push(c);return envelope(c)}
 if(url.includes('get-messages')) return envelope({items:messages});
 if(url.includes('send-message')){
 const id=String(++counter); const agent=body.mode==='agent';
 const response={messageId:'reply-'+id,conversationId:body.conversationId,content:agent?'Review this proposed rate change.':'In this demo, Friday afternoons are busiest, with occupancy peaking at 86%. Try comparing the week and month views to explore the pattern.',contentJson:agent?{agent_event:{type:'agent_action_proposal',task_id:'price-'+id,status:'pending',agent_name:'Pricing',agent_key:'lot_pricing_agent',summary:'Change the hourly rate from $4 to $6.',preview:{type:'table',rows:[{label:'Hourly rate',current:'$'+pricing.hourlyRate,proposed:'$6',changed:true}]}}}:undefined};
 messages.push({...response,role:'assistant'});
 return envelope({messageId:id,conversationId:body.conversationId,assistantMessage:response});
 }
 if(url.includes('/agent-actions/')) {const applied=url.endsWith('/confirm');if(applied)pricing.hourlyRate=6;return envelope({taskId:url.split('/')[3],status:applied?'applied':'cancelled'})}
 if(url.includes('warm-context')||url.includes('cancel-request')) return envelope({cancelled:true});
 if(url.includes('/trend'))return envelope(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((dayOfWeek,i)=>({dayOfWeek,count:[0,1,0,2,1,0,1][i]})));
 if(url.includes('violators')){
 const params=new URL(url,'https://demo.test').searchParams;const search=(params.get('search')||'').toUpperCase();
 const rows=demoRows.filter(row=>row.plateNumber.includes(search));const key=params.get('sortBy');const dir=params.get('sortDirection')==='asc'?1:-1;
 if(key)rows.sort((a:any,b:any)=>String(a[key]??'').localeCompare(String(b[key]??''),undefined,{numeric:true})*dir);
 const size=Number(params.get('size'))||10;const index=Number(params.get('page'))||0;return envelope({...page(rows.slice(index*size,(index+1)*size)),totalElements:rows.length,totalPages:Math.max(1,Math.ceil(rows.length/size)),number:index,size});
 }
 if(url.includes('get-open-violations-by-plate')){const plate=new URL(url,'https://demo.test').searchParams.get('plateNumber');return envelope(demoDetails.filter(d=>d.plateNumber===plate));}
 if(url.includes('/notes')){const id=decodeURIComponent(url.split('/')[2]);const detail=demoDetails.find(d=>d.violationTrackerId===id);if(detail)detail.initialNotes=body?.notes||'';const row=demoRows.find(r=>r.latestViolationId===id);if(row)row.initialNotes=body?.notes||'';return envelope(detail);}
 if(url.includes('violations'))return envelope(demoDetails);
 if(url.includes('sessions')){
 const rows=Array.from({length:8},(_,i)=>({sessionId:'visit-'+i,plateNumber:['BRONTO1','RAPTORX','TRICERX','ANKYLO7','STEGOSA','TREX999','SPINO42','DILOPH1'][i],ownerName:'Demo visitor',lotId:'demo',entryTime:new Date(Date.now()-(i+1)*1800000).toISOString(),departed:false,deleted:false,sessionType:'Regular',userType:i===0?'Violator':'Visitor',vehicleRegistered:i===2,totalAmount:(i+1)*3,dwellTime:(i+1)*30}));
 const search=new URL(url,'https://demo.test').searchParams.get('search')?.toLowerCase();
 const filtered=search?rows.filter(r=>r.plateNumber.toLowerCase().includes(search)):rows;
 return envelope(url.includes('paginated')?page(filtered):filtered);
 }
 if(url.includes('lotplateRegistry')){
 if(url.includes('/create'))registry.push({...body,registryId:'permit-'+(++counter)});
 if(url.includes('/update/'))registry=registry.map(row=>row.registryId===url.split('/').pop()?{...row,...body}:row);
 if(url.includes('/delete'))registry=registry.filter(row=>row.registryId!==body?.data?.registryId);
 if(url.includes('paginated')){
  const params=new URL(url,'https://demo.test').searchParams;const search=(params.get('search')||'').toLowerCase();
  const rows=registry.filter(row=>[row.plateNumber,row.name,row.email,row.phone].some(v=>String(v||'').toLowerCase().includes(search)));
  const key=params.get('sortBy')||'plateNumber';const direction=params.get('sortDirection')==='desc'?-1:1;
  rows.sort((a,b)=>String(a[key]||'').localeCompare(String(b[key]||''),undefined,{numeric:true})*direction);
  const size=Number(params.get('size'))||10;const index=Number(params.get('page'))||0;
  return envelope({...page(rows.slice(index*size,(index+1)*size)),totalElements:rows.length,totalPages:Math.max(1,Math.ceil(rows.length/size)),number:index,size});
 }
 return envelope(registry);
 }
 if(url.includes('/permit/'))return envelope(url.includes('paginated')||url.includes('page')?page([]):[]);
 if(url.includes('prediction')||url.includes('notification')||url.includes('ignored-alpr'))return envelope([]);
 throw new Error('Unavailable in this demo: '+url);
}
const api:any={get:(url:string,config?:any)=>request(url,undefined,config),post:request,put:request,patch:request,delete:request};
