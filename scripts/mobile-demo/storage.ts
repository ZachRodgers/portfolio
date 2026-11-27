const values=new Map<string,string>([['theme_mode','light'],['selectedPlate_demo-user','DEMO123']]);
export default {getItem:async(k:string)=>values.get(k)??null,setItem:async(k:string,v:string)=>{values.set(k,v)},removeItem:async(k:string)=>{values.delete(k)},multiRemove:async(keys:string[])=>keys.forEach(k=>values.delete(k))};
