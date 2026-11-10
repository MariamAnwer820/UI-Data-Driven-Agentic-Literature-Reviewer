function App(){
const[scr,setScr]=S('splash');const[v,setV]=S('home');const[ds,setDs]=S(null);const[pp,setPp]=S(null);const[from,setFrom]=S('research');
const[saved,setSaved]=S([]);const[lib,setLib]=S({});const[hist,setHist]=S([]);const[current,setCurrent]=S(null);const runs=R({});
const[s,set]=S({model:'Gemini 2.5 Flash (free tier)',engine:'OpenAlex + Semantic Scholar',max:'10',selectedPapers:'5',provider:'Google Gemini',apiKeys:{},theme:'Light',font:'Medium',notify:true});
E(()=>{const r=document.documentElement;r.dataset.theme=s.theme==='System'?'':s.theme.toLowerCase();if(!s.theme||s.theme==='System')delete r.dataset.theme;r.style.setProperty('--fs',{Small:'14px',Medium:'15px',Large:'17px'}[s.font])},[s.theme,s.font]);
const start=(q,cons,task,target)=>{
  const selected=Number(s.selectedPapers),limit=Number(s.max);
  if(!Number.isInteger(selected)||selected<1||selected>1000||!Number.isInteger(limit)||limit<1||limit>1000){alert('Paper limits must be whole numbers from 1 to 1000.');return}
  const id=crypto.randomUUID();const run={id,q,cons,task,target,ds,settings:{...s,apiKeys:{...s.apiKeys}},events:[],lastId:0,status:'starting'};
  runs.current[id]=run;setHist(hh=>[{id,t:q.length>44?q.slice(0,44)+'…':q,q,d:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),n:null},...hh].slice(0,30));setCurrent(run);setV('research');
};
const startFrom=id=>{const run=runs.current[id];if(run){setCurrent(run);setV('research')}};
const onDone=(run,data)=>{setLib(l=>{const n={...l};data.papers.forEach(p=>{n[p.id]=p});return n});
  setHist(hh=>[{id:run.id,t:run.q.length>44?run.q.slice(0,44)+'…':run.q,q:run.q,d:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),n:data.papers.length},...hh.filter(e=>e.id!==run.id)].slice(0,30))};
const toggle=id=>setSaved(a=>a.includes(id)?a.filter(i=>i!==id):[...a,id]);
const open=p=>{setFrom(v==='saved'?'saved':'research');setPp(p);setV('paper')};
const back=()=>setV(from);const go=k=>setV(k);
if(scr==='splash')return h(Welcome2,{go:()=>setScr('login')});if(scr==='login')return h(Login,{ok:()=>setScr('app')});
const nav=v==='paper'?(from==='saved'?'saved':'home'):v==='research'?'home':v;
return h('div',{className:'shell'},h(Sidebar,{v:nav,go}),h('main',{key:v,className:'pg'},
v==='home'&&h(Chat,{start,ds,setDs,s}),
v==='research'&&current&&h(Research,{key:current.id,run:current,openPaper:open,saved,toggle,onDone}),
v==='paper'&&pp&&h(Paper,{p:pp,back,saved,toggle}),
v==='sessions'&&h(Sessions,{go,start:startFrom,hist,runs:runs.current}),
v==='saved'&&h(Saved,{saved,lib,openPaper:open,toggle,go}),
v==='settings'&&h(Settings,{s,set})))
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
