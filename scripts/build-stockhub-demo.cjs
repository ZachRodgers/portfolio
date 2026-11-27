const fs=require('fs'),path=require('path'),crypto=require('crypto');
const source=process.env.STOCKHUB_SOURCE||'/home/Zach/Parallel/Nedco/nedco-stockhub/apps/web';
const deps=path.join(source,'node_modules');
const esbuild=require('/home/Zach/Repos/mission-control/node_modules/esbuild');
const out='public/assets/ux_ui/content/portfolio/stockhub/demo';fs.mkdirSync(out,{recursive:true});
(async()=>{const result=await esbuild.build({entryPoints:['scripts/stockhub-demo/entry.tsx'],bundle:true,minify:true,metafile:true,jsx:'automatic',outfile:out+'/app.js',alias:{'@':path.join(source,'src'),react:path.join(deps,'react'),'react-dom':path.join(deps,'react-dom')},nodePaths:[deps],plugins:[{name:'preview-layout',setup(b){
  b.onLoad({filter:/\/src\/app\/\(protected\)\/inventory\/page\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    const changes=[['const PAGE_SIZE = 10;', 'const PAGE_SIZE = 8;'],['label: "Warehouse",   width:', 'label: "Location",    width:'],['label: "Description", width: "w-[16rem]"', 'label: "Description", width: "w-[12rem]"'],['  { key: "bin",               label: "Bin",         width: "w-[5rem]" },\n',''],['                  <TableCell className="truncate">{row.bin ?? "—"}</TableCell>\n',''],['                <TableCell />\n                <TableCell />\n', '                <TableCell />\n'],['{ label: "Warehouse",     value:', '{ label: "Location",      value:']];
    for(const [before,after] of changes){if(!contents.includes(before))throw new Error('Inventory preview source changed: '+before);contents=contents.replace(before,after)}
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/app\/\(protected\)\/order-lookup\/page\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    for(const [before,after] of [['const PAGE_SIZE = 10;', 'const PAGE_SIZE = 8;'],['Nedco Doc','Order #'],['Warehouse','Location']]) {
      if(!contents.includes(before))throw new Error('Order lookup source changed: '+before);
      if(before === 'Warehouse') contents=contents.replace(/(?<=["">])Warehouse(?=["<])/g, 'Location');
      else contents=contents.split(before).join(after);
    }
    const initialChanges = [
      ['useEffect, useState, useCallback, useMemo, Suspense', 'useEffect, useState, useCallback, useMemo, useRef, Suspense'],
      ['const [browseHeaders, setBrowseHeaders] = useState<OrderHeader[]>([]);', 'const [browseHeaders, setBrowseHeaders] = useState<OrderHeader[]>([]);\n  const initialOrderOpened = useRef(false);'],
      ['setBrowseHeaders(body.headers ?? []);', 'setBrowseHeaders(body.headers ?? []);\n        if (!initialOrderOpened.current && body.headers?.[0]?.nedco_document) {\n          initialOrderOpened.current = true;\n          const first = body.headers[0].nedco_document;\n          setExpandedOrders([first]);\n          void loadBrowseRows(first);\n        }'],
      ['<span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeClasses(status)}`}>', '<span data-order-status={status.toLowerCase()} className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeClasses(status)}`}>']
    ];
    for(const [before,after] of initialChanges){if(!contents.includes(before))throw new Error('Order preview source changed: '+before);contents=contents.replace(before,after)}
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/components\/admin\/create-user-modal\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    for(const [before,after] of [['An invite email will be sent. The user will set their own password and complete\n            account setup before signing in.', 'This creates a local demo account. No invitation email is sent.'],['Invite sent to ${email}', 'Demo account added: ${email}'],['Send Invite','Add Demo User']]) {
      if(!contents.includes(before))throw new Error('Create user preview source changed: '+before);
      contents=contents.replace(before,after);
    }
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/app\/\(protected\)\/stock-alerts\/page\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    for(const [before,after] of [['const PAGE_SIZE = 10;', 'const PAGE_SIZE = 8;'],['>Branch</SortableHead>', '>Location</SortableHead>'],['17 + 12 + visibleBufferCols.length','15 + 12 + visibleBufferCols.length'],['<TableCell className={cn(\n                    "whitespace-nowrap sticky right-0 z-10', '<TableCell data-alert-status={suppressed ? "suppressed" : row.flag ?? "normal"} className={cn(\n                    "whitespace-nowrap sticky right-0 z-10']]) {
      if(!contents.includes(before))throw new Error('Stock alerts preview source changed: '+before);
      contents=before === '17 + 12 + visibleBufferCols.length' ? contents.split(before).join(after) : contents.replace(before,after);
    }
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/app\/\(protected\)\/history\/page\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    for(const [before,after] of [['const PAGE_SIZE = 10;', 'const PAGE_SIZE = 8;'],['Nedco Doc','Order #'],['Warehouse','Location']]) {
      if(!contents.includes(before))throw new Error('History preview source changed: '+before);
      if(before === 'Warehouse') contents=contents.replace(/(?<=["\>])Warehouse(?=["<])/g, 'Location');
      else contents=contents.split(before).join(after);
    }
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/lib\/shared-search\.ts$/},args=>{
    const contents=fs.readFileSync(args.path,'utf8').replace('"stockhub:shared-search"', '"stockhub:shared-search:" + (new URLSearchParams(window.location.search).get("scene") || "inventory")');
    return {contents,loader:'ts',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/components\/layout\/protected-sidebar\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    const before='<SidebarProvider className="flex-1">';
    if(!contents.includes(before))throw new Error('Protected sidebar source changed');
    contents=contents.replace(before, '<SidebarProvider defaultOpen={false} className="flex-1"><SidebarOpening />');
    contents=contents.replace('"use client";', '"use client";\nimport { SidebarOpening } from "' + path.resolve('scripts/stockhub-demo/sidebar-opening.tsx') + '";');
    const breadcrumb='<BreadcrumbLink href={crumb.href} className="text-foreground hover:text-foreground/70">{crumb.label}</BreadcrumbLink>';
    if(!contents.includes(breadcrumb))throw new Error('Protected breadcrumb source changed');
    contents=contents.replace(breadcrumb, '<BreadcrumbLink asChild><Link href={crumb.href} className="text-foreground hover:text-foreground/70">{crumb.label}</Link></BreadcrumbLink>');
    contents=contents.replace('"use client";', '"use client";\nimport Link from "next/link";');
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/components\/app-sidebar\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    const before='title: "Cancelled Orders"';
    if(!contents.includes(before))throw new Error('Sidebar label changed');
    contents=contents.replace(before,'title: "Cancelled"');
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/app\/\(protected\)\/admin\/analytics\/page\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    const before='className="grid grid-cols-1 gap-4 xl:grid-cols-2"';
    if(!contents.includes(before))throw new Error('Analytics grid source changed');
    contents=contents.split(before).join('className="stockhub-analytics-grid grid grid-cols-1 gap-4 xl:grid-cols-2"');
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/app\/\(protected\)\/admin\/csv-uploads\/page\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    const before='                            Cancelled Orders\n                          </Badge>';
    if(!contents.includes(before))throw new Error('Cancelled upload badge changed');
    contents=contents.replace(before,'                            Cancelled\n                          </Badge>');
    const overlay='className="mx-auto flex w-full max-w-lg flex-col gap-4"';
    if(!contents.includes(overlay))throw new Error('CSV upload overlay source changed');
    contents=contents.replace(overlay,'className="stockhub-upload-grid"');
    const successMessages=contents.match(/toast\.success\((?:successMessage\(rowCount\)|`[^`]*\$\{rowCount\.toLocaleString\(\)\}[^`]*`)\);/g) || [];
    if(successMessages.length!==5)throw new Error('CSV upload success messages changed');
    for(const message of successMessages) contents=contents.replace(message, 'toast.success("Upload simulated; no data was imported.");');
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
  b.onLoad({filter:/\/src\/components\/warehouse-selector\.tsx$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    for(const [before,after] of [['All Warehouses','All Locations'],['All warehouses','All locations'],['No warehouses found','No locations found'],['\n              Warehouses\n','\n              Locations\n'],['alt="Warehouse"','alt="Location"'],['className="w-[--radix-dropdown-menu-trigger-width] min-w-52 rounded-lg"','className="stockhub-location-menu w-[--radix-dropdown-menu-trigger-width] min-w-52 rounded-lg"']]) {if(!contents.includes(before))throw new Error('Location selector source changed: '+before);contents=contents.split(before).join(after)}
    return {contents,loader:'tsx',resolveDir:path.dirname(args.path)};
  });
}},{name:'local-services',setup(b){b.onResolve({filter:/^@\/components\/brand-logo$/},()=>({path:path.resolve('scripts/stockhub-demo/brand.tsx')}));b.onResolve({filter:/^next\/(link|image)$/},args=>({path:path.resolve('scripts/stockhub-demo/'+args.path.split('/')[1]+'.tsx')}));b.onResolve({filter:/^(next\/navigation|@\/lib\/hooks\/use-telemetry)$/},()=>({path:path.resolve('scripts/stockhub-demo/stubs.ts')}))}}]});
fs.mkdirSync(out+'/assets',{recursive:true});
const cssPath=path.join(source,'.next/static/css/app/layout.css');
const css=fs.readFileSync(cssPath,'utf8').replace(/url\(\/_next\/static\/media\/([^)]*)\)/g,(_,name)=>{fs.copyFileSync(path.join(source,'.next/static/media',name),out+'/assets/'+name);return `url(./assets/${name})`;}).replace(/\/\*[\s\S]*?\*\//g,'');
fs.writeFileSync(out+'/app.css',css+'\n'+fs.readFileSync('scripts/stockhub-demo/branding.css','utf8'));
fs.copyFileSync('public/assets/ux_ui/hero/stockhub.png',out+'/assets/stockhub.png');
for(const name of ['warehouse.svg'])fs.copyFileSync(path.join(source,'public',name),out+'/assets/'+name);
const fontClass=/\.(\_\_className_[a-z0-9]+)\s*\{font-family: 'Geist'/.exec(css)?.[1];
if(!fontClass)throw new Error('Geist body class missing from product CSS');
fs.writeFileSync(out+'/index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Stockhub · Cedar & Bolt</title><link rel="stylesheet" href="app.css"></head><body class="'+fontClass+'"><div id="root"></div><script src="app.js"></script></body></html>');
fs.writeFileSync(out+'/source-manifest.json',JSON.stringify(Object.keys(result.metafile.inputs).filter(f=>f.startsWith(source+'/src')).map(f=>({path:path.relative(source,f),sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')})),null,2));
})().catch(e=>{console.error(e);process.exit(1)});
