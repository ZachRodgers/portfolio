import {items} from './items';
import {orderGroups} from './orders';
const loadedPages = new Set<number | string>();
window.fetch=async(input:any, options?: RequestInit)=>{const u=new URL(String(input),location.origin),p=u.searchParams;const q=(p.get('search')||'').toLowerCase();let rows=items.filter(r=>(!q||[r.item_number,r.description,r.reel_id].some(v=>p.get('exact')==='1'?v.toLowerCase()===q:v.toLowerCase().includes(q)))&&(!p.get('warehouses')||p.get('warehouses')!.split(',').includes(r.warehouse)));const col=p.get('sort')||'item_number';rows.sort((a,b)=>String(a[col as keyof typeof a]).localeCompare(String(b[col as keyof typeof b]),undefined,{numeric:true})*(p.get('order')==='desc'?-1:1));let body:any;
if (u.pathname === '/api/me') body = {user: {role:'user'}};
else if (u.pathname.startsWith('/api/history')) {
  if (u.pathname.endsWith('/version')) body={version:'cedar-bolt-history-v1'};
  else if (u.pathname.endsWith('/item-totals')) {
    body=rows.length === 1 ? {itemNumber:rows[0].item_number,totals:{count_qty:Number(rows[0].count_qty),committed_count:Number(rows[0].committed_count),uncommitted_count:Number(rows[0].uncommitted_count)}} : {itemNumber:null,totals:null};
  } else {
    const term=(p.get('search')||p.get('query')||'').trim().toLowerCase();
    const allowed=(p.get('warehouses')||'').split(',').filter(Boolean);
    const types=(p.get('doc_types')||'').split(',').filter(Boolean);
    const exact=p.get('exact')==='1';
    const status=p.get('status');
    const match=(v:string|null)=>exact ? (v||'').toLowerCase()===term : (v||'').toLowerCase().includes(term);
    let records=orderGroups.flatMap(group=>group.rows.map(row=>({...row,document_type:'shipment'}))).filter(row=>
      (!status || row.status===status) && (!allowed.length || allowed.includes(row.warehouse)) && (!types.length || types.includes(row.document_type)) &&
      (!term || [row.item_number,row.description,row.reel_id,row.nedco_document,row.customer_document,row.ordered_by].some(match)) &&
      (!p.get('date_from') || (row.ship_date||row.order_date)>=p.get('date_from')!) && (!p.get('date_to') || (row.ship_date||row.order_date)<=p.get('date_to')!));
    if(u.pathname.endsWith('/lookups')) {
      const fields=[['item','Items',records.map(r=>r.item_number)],['description','Descriptions',records.map(r=>r.description)],['nedco_doc','Orders',records.map(r=>r.nedco_document)],['customer_doc','Customer documents',records.map(r=>r.customer_document)]] as const;
      const groups=term.length<2?[]:fields.map(([type,label,values])=>({type,label,results:[...new Set(values)].filter(v=>v && match(v)).slice(0,Number(p.get('limit')||10)).map(value=>({type,value}))})).filter(group=>group.results.length);
      body={groups,total:groups.reduce((sum,group)=>sum+group.results.length,0)};
    } else {
      const col=p.get('sort')||'ship_date'; const dir=p.get('order')==='asc'?1:-1;
      records.sort((a,b)=>String(a[col as keyof typeof a]??'').localeCompare(String(b[col as keyof typeof b]??''),undefined,{numeric:true})*dir);
      const limit=Number(p.get('limit')||8),page=Number(p.get('page')||1);
      body={rows:records.slice((page-1)*limit,page*limit),total:records.length};
    }
  }
}
else if (u.pathname.startsWith('/api/order-lookup')) {
  if (u.pathname.endsWith('/version')) body = {version:'cedar-bolt-orders-v1'};
  else {
    const term=(p.get('doc') || p.get('query') || '').trim().toLowerCase();
    const allowed=(p.get('warehouses') || '').split(',').filter(Boolean);
    const status=p.get('status');
    let groups=orderGroups.filter(g => (!allowed.length || allowed.includes(g.header.warehouse)) && (!status || g.header.status===status));
    const match=(value: string | null) => (value || '').toLowerCase().includes(term);
    if (u.pathname.endsWith('/lookups')) {
      const fields=[['item','Items',groups.flatMap(g=>g.rows.map(r=>r.item_number))],['document','Orders',groups.map(g=>g.header.nedco_document)],['customer','Customer documents',groups.map(g=>g.header.customer_document)]] as const;
      const suggestions=term.length<2?[]:fields.map(([type,label,values])=>({type,label,results:[...new Set(values)].filter(match).slice(0,Number(p.get('limit')||10)).map(value=>({type,value}))})).filter(g=>g.results.length);
      body={groups:suggestions,total:suggestions.reduce((sum,g)=>sum+g.results.length,0)};
    } else {
      if(term) groups=groups.filter(g=>match(g.header.nedco_document)||match(g.header.customer_document)||g.rows.some(r=>match(r.item_number)||match(r.description)));
      const sort=p.get(u.pathname.endsWith('/browse')?'sort':'header_sort') || 'nedco_document';
      const direction=p.get(u.pathname.endsWith('/browse')?'order':'header_order') === 'asc' ? 1 : -1;
      groups.sort((a,b)=>String(a.header[sort as keyof typeof a.header] ?? '').localeCompare(String(b.header[sort as keyof typeof b.header] ?? ''),undefined,{numeric:true})*direction);
      const limit=Number(p.get('limit')||8),page=Number(p.get('page')||1);
      const delayKey='orders-'+page;
      if(limit===8 && !loadedPages.has(delayKey)) {
        const signal=options?.signal;
        if(signal?.aborted) throw new DOMException('Aborted','AbortError');
        await new Promise<void>((resolve,reject)=>{ const abort=()=>{window.clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));}; const timer=window.setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve()},1000); signal?.addEventListener('abort',abort,{once:true}); });
        loadedPages.add(delayKey);
      }
      if(u.pathname.endsWith('/browse')) body={headers:groups.slice((page-1)*limit,page*limit).map(g=>g.header),total:groups.length};
      else if(groups.length===1){
        let lines=[...groups[0].rows];const col=p.get('sort')||'item_number';const dir=p.get('order')==='desc'?-1:1;
        lines.sort((a,b)=>String(a[col as keyof typeof a]??'').localeCompare(String(b[col as keyof typeof b]??''),undefined,{numeric:true})*dir);
        body={mode:'single',header:groups[0].header,rows:lines.slice((page-1)*limit,page*limit),total:lines.length};
      } else body={mode:'multiple',header:null,rows:[],groups:groups.slice((page-1)*limit,page*limit),total:groups.length};
    }
  }
}
else if(u.pathname==='/api/warehouses')body={warehouses:['Toronto','Ottawa']};
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
else if(u.pathname==='/api/inventory'){
  const limit=Number(p.get('limit')||8),page=Number(p.get('page')||1);
  if (limit === 8 && !loadedPages.has(page)) {
    const signal=options?.signal;
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise<void>((resolve,reject)=>{
      const onAbort=()=>{window.clearTimeout(timer);reject(new DOMException('Aborted', 'AbortError'));};
      const timer=window.setTimeout(()=>{signal?.removeEventListener('abort',onAbort);resolve();},1000);
      signal?.addEventListener('abort',onAbort,{once:true});
    });
    loadedPages.add(page);
  }
  body={rows:rows.slice((page-1)*limit,page*limit),total:rows.length};
}
else throw new Error('Unavailable demo endpoint');return new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json'}})};
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.action==='replay'){const scene=new URLSearchParams(location.search).get('scene');try{sessionStorage.removeItem('stockhub:shared-search:'+(scene||'inventory'))}catch{}history.replaceState(null,'',location.pathname+(scene==='orders'?'?scene=orders':''));location.reload()}});

document.addEventListener('submit',event=>{if((event.target as HTMLFormElement).getAttribute('action')==='/auth/sign-out')event.preventDefault()});
