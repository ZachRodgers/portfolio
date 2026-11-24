const descriptions=['Claw hammer 16 oz','Steel tape measure 8 m','Cordless drill 18 V','Drill bit set 21 piece','Wood screws 50 mm box','Deck screws 75 mm box','Wall anchors assorted','Adjustable wrench 250 mm','Socket set metric','Combination pliers','Utility knife retractable','Replacement blades pack','Spirit level 600 mm','Safety glasses clear','Work gloves medium','Dust masks pack','Paint roller 230 mm','Paint brush 50 mm','Drop cloth cotton','Exterior wood stain','PVC elbow 25 mm','Copper coupling 15 mm','Pipe wrench 350 mm','PTFE sealing tape','Garden hose 15 m','Brass hose connector','Door hinge satin nickel','Deadbolt lock set','Shelf bracket steel','Extension cord 10 m'];
export const items=descriptions.map((description,i)=>({id:i+1,item_number:`CB-${1001+i}`,warehouse:i%2?'Ottawa':'Toronto',reel_id:`PK-${2001+i}`,description,count_qty:String(24+i*7),committed_count:String(i%5*3),uncommitted_count:String(24+i*7-i%5*3),count_unit:'EA',bin:`${i%2?'B':'A'}-${String(i+1).padStart(2,'0')}`}));
window.fetch=async(input:any)=>{const u=new URL(String(input),location.origin),p=u.searchParams;const q=(p.get('search')||'').toLowerCase();let rows=items.filter(r=>(!q||[r.item_number,r.description,r.reel_id].some(v=>p.get('exact')==='1'?v.toLowerCase()===q:v.toLowerCase().includes(q)))&&(!p.get('warehouses')||p.get('warehouses')!.split(',').includes(r.warehouse)));const col=p.get('sort')||'item_number';rows.sort((a,b)=>String(a[col as keyof typeof a]).localeCompare(String(b[col as keyof typeof b]),undefined,{numeric:true})*(p.get('order')==='desc'?-1:1));let body:any;
if(u.pathname==='/api/warehouses')body={warehouses:['Toronto','Ottawa']};
else if(u.pathname.endsWith('/version'))body={version:'cedar-bolt-v1'};
else if(u.pathname.endsWith('/totals'))body={totals:rows.reduce((a,r)=>({count_qty:a.count_qty+Number(r.count_qty),committed_count:a.committed_count+Number(r.committed_count),uncommitted_count:a.uncommitted_count+Number(r.uncommitted_count)}),{count_qty:0,committed_count:0,uncommitted_count:0})};
else if(u.pathname.endsWith('/lookups')) {
  const query=(p.get('query')||'').trim().toLowerCase();
  const limit=Math.max(1,Math.min(20,Number(p.get('limit')||8)));
  const fields=[['item','Items','item_number'],['description','Descriptions','description'],['reel','Reel IDs','reel_id']] as const;
  const groups=query.length<2?[]:fields.map(([type,label,key])=>({type,label,results:[...new Set(rows.map(row=>row[key]))].filter(value=>value.toLowerCase().includes(query)).sort().slice(0,limit).map(value=>({type,value}))})).filter(group=>group.results.length);
  body={groups,total:groups.reduce((sum,group)=>sum+group.results.length,0)};
}
else if(u.pathname.endsWith('/pending-orders'))body={rows:[]};
else if(u.pathname==='/api/inventory'){const limit=Number(p.get('limit')||10),page=Number(p.get('page')||1);body={rows:rows.slice((page-1)*limit,page*limit),total:rows.length};}
else throw new Error('Unavailable demo endpoint');return new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json'}})};
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.action==='replay')location.reload()});

document.addEventListener('submit',event=>{if((event.target as HTMLFormElement).getAttribute('action')==='/auth/sign-out')event.preventDefault()});
