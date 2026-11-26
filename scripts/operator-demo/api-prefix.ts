import axios from 'axios';
import {lot,user} from './user';
let pricing:any={pricingId:'demo-price',hourlyRate:4,dailyMaximumPrice:24,gracePeriod:600,maximumTime:24,ticketAmount:45,freeParking:false,allowValidation:true};
let advanced:any[]=[]; let enabled=false; let counter=0;
let registry:any[]=[];
const messages:any[]=[]; const conversations:any[]=[];
const page=(items:any[])=>({content:items,items,totalElements:items.length,totalPages:1,number:0,size:20,last:true,first:true});
const envelope=(data:any)=>({data:{success:true,data},status:200});
async function request(url:string,body?:any,config?:any):Promise<any>{
 await new Promise(resolve=>setTimeout(resolve,url.includes('send-message')?800:100));
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
 const hourly=url.includes('/hourly/');
 const start=new Date(params.startDate||params.date||new Date().toISOString().slice(0,10));
 const end=new Date(params.endDate||start);
 const count=hourly?24:Math.min(366,Math.max(1,Math.round((+end-+start)/86400000)+1));
 return envelope(Array.from({length:count},(_,i)=>{const date=new Date(+start+i*86400000).toISOString().slice(0,10);return {date,hour:i,lotId:'demo',totalVehicles:String(50+i%9*7),subscriberRevenue:60,totalRevenue:240+i%7*41,revenue:240+i%7*41,parkedCars:50+i%9*7,totalParkedCars:50+i%9*7,occupancy:40+i%8*6,averageOccupancy:58,upTime:99.8,pendingRevenue:12,dwellTime:86,averageDwellTime:86,gasoline:30,electric:12,hybrid:8,registered:12,unregistered:38}}));
 }
 if(url.includes('devices')) return envelope([{deviceId:'demo-camera',deviceStatus:'Online'}]);
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
 if(url.includes('violators')&&!url.includes('/trend')) return envelope(page([{plateNumber:'DEMO 101',status:'ACTIVE',violationCount:2,latestViolationId:'demo-ticket',latestViolationTimestamp:new Date().toISOString(),allowValidation:true,openViolations:2,totalAmountOwed:90,currentlyInLot:true,lotId:'demo',lotName:lot.lotName}]));
 if(url.includes('/trend'))return envelope(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((dayOfWeek,i)=>({dayOfWeek,count:i%3})));
 if(url.includes('violations'))return envelope([{violationTrackerId:'demo-ticket',plateNumber:'DEMO 101',amount:45,violationAmount:45,status:'OPEN',createdOn:new Date().toISOString(),notes:'Exceeded posted parking duration.'}]);
 if(url.includes('sessions')){
 const rows=Array.from({length:8},(_,i)=>({sessionId:'visit-'+i,plateNumber:'DEMO '+(101+i),ownerName:'Demo visitor',lotId:'demo',entryTime:new Date(Date.now()-(i+1)*1800000).toISOString(),departed:false,deleted:false,sessionType:'Regular',userType:i===0?'Violator':'Visitor',vehicleRegistered:i===2,totalAmount:(i+1)*3,dwellTime:(i+1)*30}));
 const search=new URL(url,'https://demo.test').searchParams.get('search')?.toLowerCase();
 const filtered=search?rows.filter(r=>r.plateNumber.toLowerCase().includes(search)):rows;
 return envelope(url.includes('paginated')?page(filtered):filtered);
 }
 if(url.includes('lotplateRegistry')){
 if(url.includes('/create'))registry.push({...body,registryId:'permit-'+(++counter)});
 if(url.includes('/update/'))registry=registry.map(row=>row.registryId===url.split('/').pop()?{...row,...body}:row);
 if(url.includes('/delete'))registry=registry.filter(row=>row.registryId!==body?.data?.registryId);
 return envelope(url.includes('paginated')?page(registry):registry);
 }
 if(url.includes('/permit/'))return envelope(url.includes('paginated')||url.includes('page')?page([]):[]);
 if(url.includes('prediction')||url.includes('notification')||url.includes('ignored-alpr'))return envelope([]);
 throw new Error('Unavailable in this demo: '+url);
}
const api:any={get:(url:string,config?:any)=>request(url,undefined,config),post:request,put:request,patch:request,delete:request};
