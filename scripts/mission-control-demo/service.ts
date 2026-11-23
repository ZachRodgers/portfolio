import { useUi } from '@app/state/ui';
import { useWorkspace, workspaceKey } from '@app/state/workspace';
import { useMissions } from '@app/state/missions';
import { useSessions } from '@app/state/sessions';
import { browserScopeKey, useComments } from '@app/state/comments';

const project = '/projects/demo-repo';
const scene = new URLSearchParams(window.location.search).get('scene');
const planningScene = scene === 'planning';
const browserDesignScene = scene === 'browser-design';
const planningMissionId = 'planning-demo';
const planningSessionKey = 'planning-demo-agent';
const browserMissionId = 'browser-design-demo';
const browserSessionKey = 'browser-design-agent';
const planningPlanUrl = '/assets/ux_ui/content/portfolio/mission-control/plan.html';
const browserPreviewUrl = '/assets/ux_ui/content/portfolio/mission-control/browser-preview.html';
const planningTasks = [
  { content: 'Define the Toronto stay and its guests', status: 'completed', activeForm: 'Defining the stay and its guests' },
  { content: 'Map the homepage and booking journey', status: 'completed', activeForm: 'Mapping the booking journey' },
  { content: 'Draft the homepage preview', status: 'completed', activeForm: 'Drafting the homepage preview' },
  { content: 'Check the mobile booking layout', status: 'completed', activeForm: 'Checking the mobile booking layout' },
  { content: 'Build the stay and booking sections', status: 'in_progress', activeForm: 'Building the stay and booking sections' },
  { content: 'Polish the Toronto imagery and copy', status: 'pending', activeForm: 'Polishing the imagery and copy' },
  { content: 'Review booking accessibility', status: 'pending', activeForm: 'Reviewing booking accessibility' }
];
const prompt = 'Build Casa Toronto: create the stay homepage and booking experience in parallel, with a separate stage for each.';
const fileData = [
  ['src/components/StayHero.tsx', 'added', 0],
  ['src/components/BookingForm.tsx', 'modified', 1],
  ['src/data/stays.ts', 'added', 0],
  ['src/components/SiteNav.tsx', 'modified', 0],
  ['src/styles/booking.css', 'modified', 1],
  ['src/App.tsx', 'modified', 0],
  ['src/styles/tokens.css', 'modified', 1],
  ['src/components/OldBooking.tsx', 'deleted', 0],
  ['src/components/StayGallery.tsx', 'modified', 1],
];
const paths = [...fileData.map(f => f[0] as string), 'src/main.tsx', 'package.json', 'README.md', 'tsconfig.json'];
const names = ['stay-homepage', 'booking-experience'];
const titles = ['Stay homepage', 'Booking experience'];
const listeners = new Map<string, Set<Function>>();
let elapsed = 0, paused = true, visible = false, started = false, launched = false, released = 0, lastStep = '', branch = 'main';
let stageData: any[] = [];
let changes: any[] = [];
let missionData: Record<string, any> = {};
let stoppedMissions = new Set<string>();
let runTargets: any[] = [];
let runSessions: any[] = [];
let nextRunId = 0;
let promptTyped = false;
let typingTimer: number | null = null;
let previewOpenTimer: number | null = null;
let previewOpenPending = false;
let previewOpenReady = false;
let interacted = false;
let planningQuestionShown = false;
let planningQuestionAnswered = false;
let planningQuestionGeneration = 0;
let browserAgentStep = 0;
let browserAgentFinishedAt: number | null = null;
let browserAgentCommandId = 0;
let browserDemoFrameWidth = 1100;
const browserDemoCanvasWidth = (frameWidth: number) => {
  return Math.max(560, Math.round(frameWidth - 400));
};
let ideaNotes: any[] = [{ id: 'demo-idea-1', name: 'Highlight Toronto neighbourhoods', body: 'Add a short guide to nearby cafés and waterfront walks.' }];
const updateMotion = () => { (window as any).__demoPaused = paused || !visible; window.dispatchEvent(new Event('demo-motion')); };
let settings: any = { hasOnboarded: true, recentProjects: [project], enabledProviders: ['codex', 'claude'], defaultModel: 'sonnet', defaultServiceTier: 'default', permModeCounts: { auto: 3 }, thinkingCounts: { '2': 3 }, indexingEnabled: false, lastBranchByProject: {} };
const ok = { ok: true, detail: '' };
const status = () => ({ isRepo: true, branch, ahead: 0, behind: 0, changes: [...changes], conflicted: false, hasRemote: true });
const sync = () => { useWorkspace.getState().setGitStatusFor(project, status()); useWorkspace.getState().setStagesFor(project, structuredClone(stageData)); };
const sourceFor = (file: string) => file.endsWith('.css') ? '.booking-form {\n  display: flex;\n  gap: var(--s-4);\n}\n' : file.includes('Booking') ? 'export function BookingForm() {\n  return <form aria-label="Check availability">Choose dates and guests</form>;\n}\n' : 'export function StayHero() {\n  return <section><h1>A slower kind of escape.</h1><p>Discover Casa Toronto.</p></section>;\n}\n';
const listDir = (dir = '') => {
  const entries = new Map();
  for (const file of paths) {
    if (dir && !file.startsWith(dir + '/')) continue;
    const relative = dir ? file.slice(dir.length + 1) : file;
    const name = relative.split('/')[0], path = dir ? dir + '/' + name : name;
    entries.set(name, { name, path, type: relative.includes('/') ? 'dir' : 'file', gitState: changes.find(c => c.path === path)?.state });
  }
  return [...entries.values()].sort((a,b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
};
const transcripts = (i: number, step: number) => {
  const file = i === 0 ? 'src/components/StayHero.tsx' : 'src/components/BookingForm.tsx';
  const items: any[] = [
    { type: 'user', id: 'user-' + i, text: i === 0 ? prompt : 'Build the date and guest booking form with clear, responsive controls. Keep the work in its own stage.' },
    { type: 'text', id: 'intro-' + i, content: i === 0 ? 'I’ll build the stay homepage and booking flow in parallel, with a separate stage for each.' : 'I’ll build the date and guest controls and check the form on smaller screens.', streaming: false },
    { type: 'tool', id: 'read-' + i, toolUseId: 'read-' + i, name: 'Read', input: { file_path: file }, result: sourceFor(file), running: false }
  ];
  if (step >= 1) items.push({ type: 'thinking', id: 'thinking-' + i, content: 'Checking the homepage sections and booking requirements before making changes.', streaming: step === 1 });
  if (step >= 2) items.push({ type: 'tool', id: 'edit-' + i, toolUseId: 'edit-' + i, name: 'Edit', input: { file_path: file, old_string: 'gap: 12px', new_string: 'gap: var(--s-4)' }, result: 'File updated successfully.', running: step === 2 });
  if (step >= 3) items.push({ type: 'text', id: 'update-' + i, content: i === 0 ? 'The homepage now introduces the stay and its Toronto setting. I’m checking navigation and the responsive layout.' : 'The booking form now groups dates and guests. I’m checking the controls on mobile.', streaming: false });
  if (step >= 3) items.push({ type: 'tool', id: 'read-related-' + i, toolUseId: 'read-related-' + i, name: 'Read', input: { file_path: i === 0 ? 'src/data/stays.ts' : 'src/styles/tokens.css' }, result: sourceFor(file), running: false });
  if (step >= 4) items.push({ type: 'tool', id: 'test-' + i, toolUseId: 'test-' + i, name: 'Bash', input: { command: 'npm run typecheck' }, result: step === 5 ? 'tsc --noEmit\nCompleted successfully.' : undefined, running: step === 4 });
  if (step >= 4) items.push({ type: 'tool', id: 'diff-' + i, toolUseId: 'diff-' + i, name: 'Bash', input: { command: 'git diff --check' }, result: step === 5 ? 'No whitespace errors found.' : undefined, running: step === 4 });
  if (step >= 5) items.push({ type: 'text', id: 'done-' + i, content: 'The changes are ready for review in **' + names[i] + '**. Type checks pass.', streaming: false });
  return items;
};
function startPromptTyping() {
  if (typingTimer !== null) window.clearTimeout(typingTimer);
  promptTyped = false;
  let index = 0;
  const typeNext = () => {
    if (paused || !visible || document.hidden) { typingTimer = window.setTimeout(typeNext, 80); return; }
    const input = document.querySelector<HTMLTextAreaElement>('textarea');
    if (!input) { typingTimer = window.setTimeout(typeNext, 80); return; }
    if (index >= prompt.length) { promptTyped = true; typingTimer = null; return; }
    const next = prompt.slice(0, ++index);
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(input, next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    typingTimer = window.setTimeout(typeNext, 22);
  };
  typingTimer = window.setTimeout(typeNext, 160);
}
function startDemo() {
  if (started || !visible) return;
  started = true;
  if (planningScene) startPlanningScene();
  else if (browserDesignScene) startBrowserDesignScene();
  else startPromptTyping();
}
function launch() {
  if (launched) return missionData['demo-0'];
  launched = true; elapsed = Math.max(2, elapsed);
  stageData = names.map((name, i) => ({ id: 'stage-' + i, name, files: [] }));
  missionData = Object.fromEntries(names.map((name,i) => {
    const id = 'demo-' + i;
    return [id, { id, title: titles[i], prompt, projectPath: project, projectPaths: [project], createdAt: Date.now() + i, updatedAt: Date.now(), status: 'running', agents: [{ role: 'solo', roleLabel: 'Developer', sessionKey: id, status: 'working', costUsd: 0, activity: 'Inspecting the stay components', orbState: 'searching' }], skills: [], attachments: [], planMode: false, model: 'sonnet', permissionMode: 'auto', maxThinkingTokens: 16384, totalCostUsd: 0, progress: 0, chatStage: { name, stageIds: { [project]: 'stage-' + i } } }];
  }));
  useMissions.setState({ missions: {...missionData}, activeMissionId: 'demo-0', loaded: true });
  tickState(); sync();
  return missionData['demo-0'];
}
function tickState() {
  if (!launched) return;
  const steps = [0,1].map(i => {
    const endAt = i === 0 ? 20 : 27;
    return elapsed >= endAt ? 5 : Math.min(4, Math.floor((elapsed - 2) / (i === 0 ? 3.6 : 4.8)));
  });
  const stepKey = steps.join(':');
  if (stepKey !== lastStep) {
    useSessions.setState({
      transcripts: Object.fromEntries([0,1].map(i => ['demo-' + i, transcripts(i,steps[i])])),
      statuses: Object.fromEntries([0,1].map(i => ['demo-' + i, stoppedMissions.has('demo-' + i) ? 'idle' : steps[i] === 5 ? 'complete' : 'working']))
    });
    lastStep = stepKey;
  }
  const states = ['searching','weaving','solving','connecting','composing','breathing'];
  const activities = ['Inspecting the stay components','Planning the two site features','Building the stay website','Checking the booking controls','Running type checks','Ready for review'];
  for (let i=0; i<2; i++) {
    const id = 'demo-' + i, m = missionData[id];
    if (!m || stoppedMissions.has(id)) continue;
    const step = steps[i], done = step === 5;
    const progress = done ? 100 : Math.max(0, Math.round((elapsed-2)/(i === 0 ? 18 : 25)*100));
    missionData[id] = { ...m, progress, status: done ? 'complete' : 'running', unread: done, agents: m.agents.map((a: any) => ({...a, status: done ? 'complete' : 'working', activity: activities[step], orbState: states[(step+i)%states.length] })) };
  }
  useMissions.setState({ missions: {...missionData} });
  const wanted = elapsed < 3 ? 0 : Math.min(9, Math.floor((elapsed - 3)*1.5)+2);
  while (released < wanted) {
    const [path,state,stage] = fileData[released++];
    const change = { path, state, staged: false };
    changes.push(change);
    stageData.find(s => s.id === 'stage-' + stage)?.files.push({path,state});
    sync();
  }
}
function planningPreview() {
  return {
    missionId: planningMissionId,
    projectPath: project,
    files: [{ name: 'plan.html', url: planningPlanUrl, kind: 'html', relPath: 'plan.html', mtime: 1 }]
  };
}
function startBrowserDesignScene() {
  if (launched) return;
  launched = true;
  browserAgentStep = 0;
  browserAgentFinishedAt = null;
  const mission = {
    id: browserMissionId,
    title: 'Review the Casa Toronto homepage',
    prompt: 'Review the live homepage, check its rhythm as you scroll, and capture the hero for feedback.',
    projectPath: project,
    projectPaths: [project],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'running',
    agents: [{ role: 'solo', roleLabel: 'Product designer', sessionKey: browserSessionKey, status: 'working', costUsd: 0, activity: 'Opening the live page', orbState: 'searching' }],
    skills: [], attachments: [], planMode: false, model: 'sonnet', permissionMode: 'auto', maxThinkingTokens: 16384, totalCostUsd: 0, progress: 8
  };
  missionData = { [browserMissionId]: mission };
  useMissions.setState({ missions: { ...missionData }, activeMissionId: browserMissionId, loaded: true });
  useSessions.setState({
    transcripts: { [browserSessionKey]: [
      { type: 'user', id: 'browser-user', text: mission.prompt },
      { type: 'text', id: 'browser-review', content: 'I’m reviewing the live page in context, then I’ll capture the hero so we can discuss the details together.', streaming: false }
    ] },
    statuses: { [browserSessionKey]: 'working' },
    hasTasks: { [browserSessionKey]: false },
    taskVersions: { [browserSessionKey]: 0 }
  });
  useUi.setState({
    activeProject: project,
    selectedProjects: [project],
    blankMode: false,
    route: { name: 'launchpad' },
    previewOpen: true,
    previewTab: 'browser',
    preview: null,
    browser: { sessionId: 'browser-design-demo', url: browserPreviewUrl, projectPath: project },
    browserAgentCommand: null,
    browserAgentActiveMissionId: browserMissionId,
    designTool: 'pointer',
    designEdits: [],
    canvasWidth: browserDemoCanvasWidth(browserDemoFrameWidth),
    canvasEngaged: false,
    filePinned: false
  });
}
function runBrowserAgentAction(action: string, details: Record<string, unknown> = {}) {
  useUi.setState({ browserAgentCommand: {
    id: 'browser-demo-action-' + (++browserAgentCommandId),
    missionId: browserMissionId,
    projectPath: project,
    action,
    ...details
  } as any });
}
function tickBrowserDesignScene() {
  if (!launched) return;
  const mission = missionData[browserMissionId];
  if (!mission) return;
  const progress = Math.min(96, 8 + Math.round(elapsed * 9));
  const activity = elapsed < 4.5 ? 'Exploring the page' : elapsed < 7 ? 'Capturing the hero for review' : 'Reviewing the details';
  missionData[browserMissionId] = { ...mission, progress, agents: mission.agents.map((agent: any) => ({ ...agent, activity, orbState: elapsed < 4.5 ? 'searching' : elapsed < 7 ? 'composing' : 'weaving' })) };
  useMissions.setState({ missions: { ...missionData } });
  const steps: Array<[number, string, Record<string, unknown>]> = [
    [0.5, 'scroll', { scrollY: 240 }],
    [1.7, 'hover', { selector: '.hero-links .solid-link' }],
    [2.8, 'click', { selector: '.hero-links .solid-link' }],
    [3.8, 'scroll', { scrollY: -240 }],
    [5, 'hover', { selector: '.hero-photo' }],
    [6, 'screenshot', { selector: '.hero-photo' }],
    [7.8, 'hover', { selector: '.hero-copy h1' }],
    [9, 'hover', { selector: '.hero-links .text-link' }],
  ];
  if (browserAgentStep < steps.length && elapsed >= steps[browserAgentStep][0] && !useUi.getState().browserAgentCommand) {
    const [, action, details] = steps[browserAgentStep++];
    runBrowserAgentAction(action, details);
  }
  if (browserAgentStep === steps.length && elapsed >= 10.5 && !useUi.getState().browserAgentCommand) {
    browserAgentStep++;
    browserAgentFinishedAt = elapsed;
    useUi.getState().setBrowserAgentActiveMissionId(null);
  }
}
function openPlanningPreview() {
  if (!previewOpenPending || !previewOpenReady || !visible || paused || document.hidden) return;
  previewOpenPending = false;
  useUi.setState({ previewOpen: true });
}
function startPlanningScene() {
  if (launched) return;
  launched = true;
  const mission = {
    id: planningMissionId,
    title: 'Casa Toronto website plan',
    prompt: 'Help me plan a calm, welcoming website for Casa Toronto. Ask a few questions, then prepare a homepage preview and task list before building.',
    projectPath: project,
    projectPaths: [project],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'running',
    agents: [{ role: 'solo', roleLabel: 'Product designer', sessionKey: planningSessionKey, status: 'working', costUsd: 0, activity: 'Reviewing the stay brief', orbState: 'searching' }],
    skills: [], attachments: [], planMode: true, model: 'sonnet', permissionMode: 'plan', maxThinkingTokens: 16384, totalCostUsd: 0, progress: 12
  };
  missionData = { [planningMissionId]: mission };
  useMissions.setState({ missions: { ...missionData }, activeMissionId: planningMissionId, loaded: true });
  useSessions.setState({
    transcripts: { [planningSessionKey]: [
      { type: 'tool', id: 'planning-todos', toolUseId: 'planning-todos', name: 'TodoWrite', input: { todos: planningTasks }, result: 'Task list updated.', running: false },
      { type: 'user', id: 'planning-user', text: mission.prompt },
      { type: 'text', id: 'planning-intro', content: 'I’ve mapped a first direction. A few choices will help me tune the plan before building.', streaming: false }
    ] },
    statuses: { [planningSessionKey]: 'working' },
    hasTasks: { [planningSessionKey]: true },
    taskVersions: { [planningSessionKey]: 1 }
  });
  useUi.setState({
    activeProject: project,
    selectedProjects: [project],
    blankMode: false,
    route: { name: 'launchpad' },
    previewOpen: false,
    previewTab: 'preview',
    preview: planningPreview(),
    activePreviewFile: 'plan.html',
    canvasWidth: 720,
    canvasEngaged: false
  });
  previewOpenPending = true;
  previewOpenReady = false;
  if (previewOpenTimer !== null) window.clearTimeout(previewOpenTimer);
  previewOpenTimer = window.setTimeout(() => {
    previewOpenTimer = null;
    previewOpenReady = true;
    openPlanningPreview();
  }, 500);
  tickPlanningScene();
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector('[aria-label^="Question 1 of"]')?.scrollIntoView({ block: 'center' })));
}
function tickPlanningScene() {
  if (!launched) return;
  const mission = missionData[planningMissionId];
  if (!mission) return;
  if (!planningQuestionShown && elapsed >= 0) {
    planningQuestionShown = true;
    const request = {
      requestId: 'planning-question-set-' + planningQuestionGeneration,
      toolUseId: 'planning-question-set-' + planningQuestionGeneration,
      toolName: 'AskUserQuestion',
      input: { questions: [
        { question: 'What should guests notice first when they arrive on the site?', header: 'First impression', options: [
          { label: 'The stay itself', description: 'Lead with a beautiful interior and a clear introduction.' },
          { label: 'The Toronto setting', description: 'Introduce the city and the neighbourhood first.' },
          { label: 'Booking a stay', description: 'Put dates and availability front and centre.' }
        ] },
        { question: 'How should guests begin booking?', header: 'Booking flow', options: [
          { label: 'Quick availability', description: 'Show dates and guests on the homepage.' },
          { label: 'Explore first', description: 'Introduce the rooms before asking for dates.' }
        ] },
        { question: 'What mood should the site convey?', header: 'Visual direction', options: [
          { label: 'Calm and considered', description: 'Warm interiors, generous space, and quiet typography.' },
          { label: 'Lively and local', description: 'More colour and energy inspired by the city.' }
        ] }
      ] }
    };
    useSessions.setState(state => ({ transcripts: { ...state.transcripts, [planningSessionKey]: [ ...(state.transcripts[planningSessionKey] ?? []), { type: 'permission', id: 'planning-question-card-' + planningQuestionGeneration, request } ] }, statuses: { ...state.statuses, [planningSessionKey]: 'awaiting-approval' } }));
    missionData[planningMissionId] = { ...mission, progress: 38, agents: mission.agents.map((agent:any) => ({ ...agent, status: 'awaiting-approval', activity: 'Waiting for your direction', orbState: 'listening' })) };
    useMissions.setState({ missions: { ...missionData } });
  }
  if (!planningQuestionShown) {
    const orbState = elapsed < 3.2 ? 'searching' : 'weaving';
    const progress = elapsed < 3.2 ? 18 : 28;
    missionData[planningMissionId] = { ...missionData[planningMissionId], progress, agents: missionData[planningMissionId].agents.map((agent:any) => ({ ...agent, status: 'working', activity: elapsed < 3.2 ? 'Reviewing the stay brief' : 'Drafting the first layout', orbState })) };
    useMissions.setState({ missions: { ...missionData } });
  }
}
function reset(manual = false) {
  if (previewOpenTimer !== null) window.clearTimeout(previewOpenTimer);
  previewOpenTimer = null;
  previewOpenPending = false;
  previewOpenReady = false;
  elapsed = 0; started = false; launched = false; released = 0; lastStep = ''; stageData = []; changes = []; missionData = {};
  planningQuestionShown = false; planningQuestionAnswered = false; planningQuestionGeneration++;
  stoppedMissions = new Set();
  interacted = manual;
  useUi.getState().setBrowserAgentCommand(null);
  useUi.getState().setBrowserAgentActiveMissionId(null);
  if (browserDesignScene) {
    const scope = browserScopeKey(project, browserPreviewUrl);
    useComments.setState(state => {
      const comments = { ...state.comments };
      delete comments[scope];
      return { comments };
    });
  }
  for (const session of runSessions) if (session.alive) listeners.get('terminal:exit')?.forEach(fn=>fn({id:session.id}));
  runSessions = [];
  localStorage.setItem('mc:draft:new:' + project, '');
  useUi.getState().clearPreviewContext();
  useUi.setState({ browser: null, browserAgentCommand: null, browserAgentActiveMissionId: null });
  window.location.hash='';
  useUi.setState({route:{name:'launchpad'}});
  useMissions.setState({ missions: {}, activeMissionId: null, loaded: true });
  useSessions.setState({transcripts:{},statuses:{}});
  sync();
  startDemo();
}
const handlers: Record<string, Function> = {
  'app.home': () => '/projects',
  'auth.status': () => Object.fromEntries(['codex','claude'].map(provider => [provider, { provider, cliPath: '/usr/bin/' + provider, authenticated: true, version: '1.0' }])),
  'settings.get': () => settings,
  'settings.set': (patch: any) => (settings = {...settings,...patch}),
  'workspace.list': (_: string, dir: string) => listDir(dir),
  'workspace.readFile': (_: string, file: string) => ({content:sourceFor(file),tooLarge:false}),
  'workspace.search': (_: string, query: string) => paths.filter(p=>p.includes(query)).map(path=>({path,name:path.split('/').pop(),type:'file'})),
  'workspace.searchContent': () => [],
  'git.status': status,
  'git.snapshot': () => ({projectPath:project,status:status(),commits:[],refs:['main','feature/casa-toronto'].map(name=>({name:'refs/heads/'+name,shortName:name,hash:'demo-head',kind:'local',current:name===branch})),remotes:[],identity:{authorName:'',authorEmail:''},sync:{projectPath:project,intervalMs:0,running:false},hasMore:false}),
  'github.repositoryIdentity': () => ({accounts:[],confidence:'unknown',detail:''}),
  'git.compare': (_:string,left:string,right:string) => ({left,right,mergeBase:null,ahead:0,behind:0,conflicted:false,additions:0,deletions:0,files:[]}),
  'git.commitDetail': () => null,
  'git.merge': (_:string,request:any) => {branch=request.target;sync();return ok;},
  'git.push': () => ok,
  'git.pull': () => ok,
  'git.stageAssignFiles': (_:string,assignments:any[]) => {for(const a of assignments)handlers['git.stageAddFile'](_,a.stageId,a.path);return ok;},
  'git.stages': () => structuredClone(stageData),
  'git.branches': () => ({current:branch,branches:['main','feature/casa-toronto']}),
  'git.checkout': (_: string, name: string) => { branch=name;sync();return ok; },
  'git.createBranch': (_: string, name: string) => { branch=name;sync();return ok; },
  'git.stageRename': (_: string,id:string,name:string) => { const s=stageData.find(s=>s.id===id);if(s)s.name=name;sync();return ok; },
  'git.stageReorder': (_:string,ids:string[]) => {stageData=ids.map(id=>stageData.find(s=>s.id===id)).filter(Boolean);sync();return ok;},
  'git.stageDelete': (_:string,id:string) => {stageData=stageData.filter(s=>s.id!==id);sync();return ok;},
  'git.stageRemoveFile': (_:string,id:string,path:string) => {const s=stageData.find(s=>s.id===id);if(s)s.files=s.files.filter((f:any)=>f.path!==path);sync();return ok;},
  'git.stageAddFile': (_:string,id:string,path:string) => {stageData.forEach(s=>s.files=s.files.filter((f:any)=>f.path!==path));stageData.find(s=>s.id===id)?.files.push(changes.find(c=>c.path===path));sync();return ok;},
  'git.stageCreate': (_:string,selected:string[]=[]) => {stageData.push({id:'stage-'+Date.now(),name:'New stage',files:changes.filter(c=>selected.includes(c.path))});sync();return ok;},
  'git.stageMerge': (_:string,id:string,destination:string) => {const from=stageData.find(s=>s.id===id),to=stageData.find(s=>s.id===destination);if(from&&to)to.files.push(...from.files);stageData=stageData.filter(s=>s.id!==id);sync();return ok;},
  'git.generateCommitMessage': () => 'Build stay homepage and booking experience',
  'git.commitStageAndPush': (_:string,id:string) => {const s=stageData.find(s=>s.id===id);changes=changes.filter(c=>!s?.files.some((f:any)=>f.path===c.path));stageData=stageData.filter(s=>s.id!==id);sync();return ok;},
  'git.commitAndPush': () => {changes=[];stageData=[];sync();return ok;},
  'git.diff': ({filePath}:any) => 'diff --git a/'+filePath+' b/'+filePath+'\n--- a/'+filePath+'\n+++ b/'+filePath+'\n@@ -1,3 +1,3 @@\n .booking-form {\n-  gap: 12px;\n+  gap: var(--s-4);\n }\n',
  'git.discardChange': (_:string,path:string) => {changes=changes.filter(c=>c.path!==path);stageData.forEach(s=>s.files=s.files.filter((f:any)=>f.path!==path));sync();return ok;},
  'git.stageDiscardFile': (_:string,id:string,path:string) => handlers['git.discardChange'](_,path),
  'mission.list': () => Object.values(missionData),
  'mission.launch': launch,
  'mission.history': () => [],
  'mission.remove': (id:string) => {delete missionData[id];return ok;},
  'mission.markViewed': (id:string) => missionData[id],
  'mission.rename': (id:string,title:string) => (missionData[id]={...missionData[id],title}),
  'mission.updateSettings': (id:string,patch:any) => (missionData[id]={...missionData[id],...patch}),
  'mission.send': (id:string,text:string) => { useSessions.getState().addUserMessage(id,text);return ok; },
  'mission.stop': (id:string) => {
    stoppedMissions.add(id);
    if (missionData[id]) missionData[id] = {...missionData[id], status:'idle', agents:missionData[id].agents.map((agent:any) => ({...agent,status:'idle',activity:'Stopped'}))};
    useMissions.setState({missions:{...missionData}});
    useSessions.setState(state => ({statuses:{...state.statuses,[id]:'idle'}}));
    return ok;
  },
  'session.respondPermission': (sessionKey:string, requestId:string, behavior:string) => {
    if (planningScene && requestId === 'planning-question-set-' + planningQuestionGeneration && behavior === 'allow' && !planningQuestionAnswered) {
      planningQuestionAnswered = true;
      useSessions.setState(state => ({
        transcripts: { ...state.transcripts, [sessionKey]: [ ...(state.transcripts[sessionKey] ?? []), { type: 'text', id: 'planning-answer-followup', content: 'Thanks, that gives me a clear direction. I’ve reflected your choices in the clickable preview and grouped the remaining work into reviewable tasks.', streaming: false } ] },
        statuses: { ...state.statuses, [sessionKey]: 'working' }
      }));
      if (missionData[planningMissionId]) {
        missionData[planningMissionId] = { ...missionData[planningMissionId], progress: 76, agents: missionData[planningMissionId].agents.map((agent:any) => ({ ...agent, status: 'working', activity: 'Refining the plan from your answers', orbState: 'solving' })) };
        useMissions.setState({ missions: { ...missionData } });
      }
    }
    return ok;
  },
  'preview.state': () => planningScene ? planningPreview() : null,
  'preview.list': () => [],
  'preview.snipRegion': () => 'browser-preview-capture.svg',
  'preview.workspaceUrl': (_: string, relPath: string) => relPath === 'browser-preview-capture.svg' ? '/assets/ux_ui/content/portfolio/mission-control/browser-preview-capture.svg' : null,
  'browser.saveEdits': () => ({ css: '.design-note { /* review the visible changes in Design Mode */ }', notes: 'Browser edits are ready to review.', htmlCaptured: true }),
  'browser.agentResult': () => ok,
  'browser.sendInput': (_id: number, input: { type: string; x: number; y: number }) => {
    const guest = document.querySelector<HTMLIFrameElement>('iframe[aria-label="Live browser preview"]')?.contentDocument;
    if (!guest) return ok;
    const target = guest.elementFromPoint(input.x, input.y) as HTMLElement | null;
    if (input.type === 'mouseMove') {
      guest.querySelectorAll('.demo-agent-hover').forEach(element => element.classList.remove('demo-agent-hover'));
      target?.closest('a, button')?.classList.add('demo-agent-hover');
    }
    if (input.type === 'mouseDown') target?.closest('a, button')?.classList.add('demo-agent-pressed');
    if (input.type === 'mouseUp') {
      const pressed = guest.querySelectorAll('.demo-agent-pressed');
      target?.addEventListener('click', event => event.preventDefault(), { once: true });
      target?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: guest.defaultView }));
      setTimeout(() => pressed.forEach(element => element.classList.remove('demo-agent-pressed')), 180);
    }
    return ok;
  },
  'browser.captureGuest': () => ({ data: '', mimeType: 'image/png', attachmentPath: 'browser-preview-capture.svg', width: 1200, height: 720 }),
  'handoff.get': () => null,
  'brand.status': () => ({projectPath:project,phase:'idle'}),
  'brand.workspaceUrl': () => null,
  'run.targets': () => [...runTargets],
  'run.add': (_:string, input:any) => {
    const target = {id:'demo-run-'+(++nextRunId),label:input.label,command:input.command,kind:'dev',primary:runTargets.length===0,custom:true};
    runTargets.push(target);
    return target;
  },
  'run.remove': (_:string,id:string) => {runTargets=runTargets.filter(target=>target.id!==id);return ok;},
  'run.start': (_:string,id:string) => {
    const target=runTargets.find(item=>item.id===id);
    if(!target) throw new Error('Run command is no longer available.');
    const session={id:'demo-terminal-'+id,title:target.label,kind:'run',cwd:project,alive:true,runTargetId:project+':'+id,browserPreview:false};
    runSessions=runSessions.filter(item=>item.id!==session.id);runSessions.push(session);
    listeners.get('terminal:created')?.forEach(fn=>fn(session));
    listeners.get('terminal:data')?.forEach(fn=>fn({id:session.id,data:'$ '+target.command+'\r\nDemo run command started.\r\n'}));
    return session;
  },
  'run.stop': (id:string) => {
    runSessions=runSessions.map(session=>session.id===id?{...session,alive:false}:session);
    listeners.get('terminal:exit')?.forEach(fn=>fn({id}));
    return ok;
  },
  'terminal.list': () => [...runSessions],
  'terminal.create': (_:string) => {
    const session={id:'demo-terminal-shell-'+(++nextRunId),title:'Terminal',kind:'shell',cwd:project,alive:true};
    runSessions.push(session);
    listeners.get('terminal:created')?.forEach(fn=>fn(session));
    listeners.get('terminal:data')?.forEach(fn=>fn({id:session.id,data:'Demo terminal session.\r\n'}));
    return session;
  },
  'terminal.write': () => ok,
  'terminal.resize': () => ok,
  'terminal.backlog': (id:string) => runSessions.some(session=>session.id===id)?'$ demo\r\nDemo terminal session.\r\n':'',
  'terminal.kill': (id:string) => handlers['run.stop'](id),
  'skills.list': () => [],
  'ideas.load': () => structuredClone(ideaNotes),
  'ideas.save': (_:string, ideas:any[]) => {ideaNotes=structuredClone(ideas);return ok;},
  'templates.list': () => [],
  'session.commands': () => [],
  'git.log': () => [],
  'github.status': () => ({authenticated:false}),
};
(window as any).mc = new Proxy({
  on: (name:string,fn:Function) => { if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name)!.add(fn);return ()=>listeners.get(name)!.delete(fn); }
}, {get(target:any, namespace:string) {
  if(namespace==='on')return target.on;
  return new Proxy({}, {get(_,method:string) {return async (...args:any[]) => {
    const key=namespace+'.'+method;
    if(handlers[key])return handlers[key](...args);
    if(['list','load','commands','targets','history','repos'].includes(method))return [];
    return null;
  };}});
}});
export function initialize() {
  if (parent === window) { paused = false; visible = true; }
  localStorage.setItem('mc:draft:new:' + project,'');
  useUi.setState({activeProject:project,selectedProjects:[project],blankMode:false,route:{name:'launchpad'},previewOpen:false});
  useWorkspace.setState({changesOnly:true,expanded:{[workspaceKey(project,'')]:true}});
  useMissions.setState({loaded:true});
  sync();
  startDemo();
  const markInteracted = (event: Event) => {
    if (event.type === 'input' && typingTimer !== null) return;
    interacted = true;
  };
  for (const event of ['pointerdown','pointermove','keydown','wheel','touchstart','input','change']) {
    window.addEventListener(event, markInteracted, { capture: true, passive: true });
  }
  window.addEventListener('hashchange', () => {
    if (!window.location.hash || window.location.hash === '#/') return;
    window.location.hash = '';
    useUi.setState({route:{name:'launchpad'}});
  });
  window.addEventListener('message', event => {
    if(event.origin===location.origin && event.data?.type==='mc-demo-interaction') { interacted=true; return; }
    if(event.source!==parent || event.origin!==location.origin || event.data?.type!=='mc-demo')return;
    if(event.data.action==='interact')interacted=true;
    if(event.data.action==='replay')reset(true);
    if(typeof event.data.paused==='boolean')paused=event.data.paused;
    if(typeof event.data.visible==='boolean')visible=event.data.visible;
    if(browserDesignScene && Number.isFinite(event.data.frameWidth)) {
      browserDemoFrameWidth = Math.max(320, Number(event.data.frameWidth));
      useUi.setState({ canvasWidth: browserDemoCanvasWidth(browserDemoFrameWidth) });
    }
    startDemo();
    openPlanningPreview();
    updateMotion();
  });
  document.addEventListener('visibilitychange', updateMotion);
  updateMotion();
  setInterval(()=>{
    if(paused || !visible || document.hidden)return;
    elapsed+=.25;
    if(!interacted && (browserDesignScene ? browserAgentFinishedAt !== null && elapsed >= browserAgentFinishedAt + 1 : elapsed >= 37))reset();
    else if(planningScene) {
      if(elapsed>=2 && !launched)startPlanningScene();
      if(launched)tickPlanningScene();
    } else if(browserDesignScene) {
      if(!launched)startBrowserDesignScene();
      if(launched)tickBrowserDesignScene();
    } else if(elapsed>=2 && promptTyped && !launched)launch();
    else tickState();
  },250);
  parent.postMessage({type:'mc-demo-ready'},location.origin);
}
