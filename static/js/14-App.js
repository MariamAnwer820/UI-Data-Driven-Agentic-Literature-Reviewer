function App(){
const[scr,setScr]=S('splash');const[v,setV]=S('home');const[ds,setDs]=S(null);const[pp,setPp]=S(null);const[from,setFrom]=S('research');
const[saved,setSaved]=S([]);const[lib,setLib]=S({});const[hist,setHist]=S([]);const[current,setCurrent]=S(null);const[accountToken,setAccountToken]=S(null),[accountEmail,setAccountEmail]=S(''),[historyError,setHistoryError]=S('');const runs=R({});
const[s,set]=S({model:'Gemini 2.5 Flash (free tier)',engine:'OpenAlex + Semantic Scholar',max:'10',selectedPapers:'5',provider:'Google Gemini',apiKeys:{},theme:'Light',font:'Medium',notify:true});
E(()=>{const r=document.documentElement;r.dataset.theme=s.theme==='System'?'':s.theme.toLowerCase();if(!s.theme||s.theme==='System')delete r.dataset.theme;r.style.setProperty('--fs',{Small:'14px',Medium:'15px',Large:'17px'}[s.font])},[s.theme,s.font]);
E(()=>{if(!accountToken)return;let live=true;ReviewAPI.history(accountToken).then(records=>{if(!live)return;
  const history=records.map(record=>{const req=record.request_data||{},id=record.review_id,q=req.question||'Saved review';
    runs.current[id]={id,q,cons:(req.constraints||[]).join('\n'),task:req.task,target:req.target_column,ds:null,settings:{...s,apiKeys:{...s.apiKeys}},events:[],lastId:0,status:record.status,reviewId:id,accountToken,isSaved:true};
    return {id,t:q.length>44?q.slice(0,44)+'…':q,q,d:'Saved review',n:null}});
  setHist(history.reverse());
}).catch(e=>{if(live)setHistoryError(e.message||'Could not load saved reviews.')});return()=>{live=false}},[accountToken]);
const start=(q,cons,task,target)=>{
  const selected=Number(s.selectedPapers),limit=Number(s.max);
  if(!Number.isInteger(selected)||selected<1||selected>1000||!Number.isInteger(limit)||limit<1||limit>1000){alert('Paper limits must be whole numbers from 1 to 1000.');return}
  const id=crypto.randomUUID();const run={id,q,cons,task,target,ds,settings:{...s,apiKeys:{...s.apiKeys}},events:[],lastId:0,status:'starting',accountToken};
  runs.current[id]=run;setHist(hh=>[{id,t:q.length>44?q.slice(0,44)+'…':q,q,d:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),n:null},...hh].slice(0,30));setCurrent(run);setV('research');
};
const startFrom=id=>{const run=runs.current[id];if(run){run.settings={...run.settings,apiKeys:{...s.apiKeys}};setCurrent(run);setV('research')}};
const onDone=(run,data)=>{setLib(l=>{const n={...l};data.papers.forEach(p=>{n[p.id]=p});return n});
  setHist(hh=>[{id:run.id,t:run.q.length>44?run.q.slice(0,44)+'…':run.q,q:run.q,d:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),n:data.papers.length},...hh.filter(e=>e.id!==run.id)].slice(0,30))};
const toggle=id=>setSaved(a=>a.includes(id)?a.filter(i=>i!==id):[...a,id]);
const open=p=>{setFrom(v==='saved'?'saved':'research');setPp(p);setV('paper')};
const back=()=>setV(from);const go=k=>setV(k);
const logout=async()=>{try{await ReviewAPI.logout(accountToken)}catch(e){setHistoryError('Could not sign out: '+e.message);return}runs.current={};setHist([]);setSaved([]);setLib({});setCurrent(null);setHistoryError('');set(s=>({...s,apiKeys:{}}));setAccountToken(null);setAccountEmail('');setScr('login');setV('home')};
if(scr==='splash')return h(Welcome2,{go:()=>setScr('login')});if(scr==='login')return h(Login,{ok:(token,email)=>{setAccountToken(token);setAccountEmail(email);setScr('app')}});
const nav=v==='paper'?(from==='saved'?'saved':'home'):v==='research'?'home':v;
return h('div',{className:'shell'},h(Sidebar,{v:nav,go,email:accountEmail,logout}),h('main',{key:v,className:'pg'},
historyError&&h('p',{className:'err',role:'alert'},historyError),
v==='home'&&h(Chat,{start,ds,setDs,s}),
v==='research'&&current&&h(Research,{key:current.id,run:current,openPaper:open,saved,toggle,onDone}),
v==='paper'&&pp&&h(Paper,{p:pp,back,saved,toggle}),
v==='sessions'&&h(Sessions,{go,start:startFrom,hist,runs:runs.current}),
v==='saved'&&h(Saved,{saved,lib,openPaper:open,toggle,go}),
v==='settings'&&h(Settings,{s,set})))
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
