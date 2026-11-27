import {items} from './items';
import {computeFlag} from '@/lib/processing/stock-alerts-flags';

type Settings = {peakMonths:number[]; bufferMonths:number};
type Override = {mode:'suppress'|'critical'|'alert'; until:string};
const defaults: Settings = {peakMonths:[8,9,10,11],bufferMonths:3};
const settingsKey='stockhub-demo:alert-settings';
const overridesKey='stockhub-demo:alert-overrides';
function read<T>(key:string, fallback:T):T {try {const value=localStorage.getItem(key);return value?JSON.parse(value):fallback;} catch{return fallback;}}
function write(key:string,value:unknown){try {localStorage.setItem(key,JSON.stringify(value))}catch{}}
export function alertSettings():Settings {
  const s=read<Settings>(settingsKey,defaults);
  return Array.isArray(s?.peakMonths) && s.peakMonths.length>0 && s.peakMonths.every(m=>Number.isInteger(m)&&m>=1&&m<=12) && Number.isInteger(s.bufferMonths) && s.bufferMonths>=1 && s.bufferMonths<=4 ? s : defaults;
}
export function saveAlertSettings(value:Settings) {write(settingsKey,value); return alertSettings();}
export function updateOverride(body:{branch:string;productNumber:string;mode:Override['mode'];days:number},remove:boolean) {
  const all=read<Record<string,Override>>(overridesKey,{});const key=`${body.branch}|${body.productNumber}`;
  if(remove) delete all[key]; else all[key]={mode:body.mode,until:new Date(Date.now()+body.days*86400000).toISOString()};
  write(overridesKey,all);
}
export function alertRows() {
  const settings=alertSettings();const overrides=read<Record<string,Override>>(overridesKey,{});const now=Date.now();
  return items.map((item,i)=>{
    const monthValues=Array.from({length:12},(_,m)=> 20 + ((i*13+m*7)%65));
    const peak=settings.peakMonths.reduce((sum,month)=>sum+monthValues[(11-month+12)%12],0);
    const avg=peak/settings.peakMonths.length;
    const onHand=Number(item.count_qty);const onOrder=i%3===1?12:0;
    const override=overrides[`${item.warehouse}|${item.item_number}`];
    const active=override && new Date(override.until).getTime()>now ? override : undefined;
    const inputs={on_hand:onHand,on_order:onOrder,mtd_unit_sales:monthValues[0],month_1:monthValues[0],month_2:monthValues[1],month_3:monthValues[2],month_4:monthValues[3],average_month_usage:avg};
    return {id:item.id,branch:item.warehouse,product_number:item.item_number,sap:`SKU-${3001+i}`,keyword:item.description.split(' ')[0],description:item.description,uom:item.count_unit,on_hand:onHand,allocated:Number(item.committed_count),on_order:onOrder,mtd_unit_sales:monthValues[0],...Object.fromEntries(monthValues.map((v,m)=>[`month_${m+1}`,v])),twelve_months_unit_sales:monthValues.reduce((a,b)=>a+b,0),report_anchor_date:'2026-12-01',peak_usage:peak,average_month_usage:avg,months_on_hand:avg?(onHand+onOrder)/avg:null,buffer_1:avg,buffer_2:avg*2,buffer_3:avg*3,buffer_4:avg*4,flag:computeFlag(inputs,active,now),override_mode:active?.mode??null,override_until:active?.until??null};
  });
}
