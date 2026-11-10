function App(){const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const[scr,setScr]=S('splash');const[v,setV]=S('home');const[q,setQ]=S('');const[cons,setCons]=S('');const[ds,setDs]=S(null);const[pp,setPp]=S(null);const[from,setFrom]=S('research');
const[saved,setSaved]=S(()=>LS('lr_saved',[]));const[lib,setLib]=S(()=>LS('lr_lib',{}));const[hist,setHist]=S(()=>LS('lr_hist',SESS));
const[init,setInit]=S(null);const[cur,setCur]=S(null);const[run,setRun]=S(0);
const[s,set]=S({model:'Gemini 2.5 Flash (free tier)',engine:'OpenAlex + Semantic Scholar',max:'10',theme:'Light',font:'Medium',notify:true});
E(()=>{const r=document.documentElement;r.dataset.theme=s.theme==='System'?'':s.theme.toLowerCase();if(!s.theme||s.theme==='System')delete r.dataset.theme;r.style.setProperty('--fs',{Small:'14px',Medium:'15px',Large:'17px'}[s.font])},[s.theme,s.font]);
E(()=>{try{localStorage.setItem('lr_saved',JSON.stringify(saved));localStorage.setItem('lr_lib',JSON.stringify(lib));localStorage.setItem('lr_hist',JSON.stringify(hist))}catch(e){}},[saved,lib,hist]);
const start=(x,c)=>{setQ(x);setCons(c||'');setInit(null);setCur(null);setRun(r=>r+1);setV('research')};
const startFrom=x=>{const e=hist.find(e=>e.data&&e.q.replace('…','')===x);if(e){setQ(e.q);setCons('');setInit(e.data);setCur(e.data);setRun(r=>r+1);setV('research')}else start(x)};
const onDone=data=>{setCur(data);setLib(l=>{const n={...l};data.papers.forEach(p=>{n[p.id]=p});return n});
setHist(hh=>[{t:q.length>44?q.slice(0,44)+'…':q,q,d:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),n:data.papers.length,data},...hh.filter(e=>!(e.data&&e.q===q))].slice(0,30))};
const toggle=id=>setSaved(a=>a.includes(id)?a.filter(i=>i!==id):[...a,id]);
const open=p=>{setFrom(v==='saved'?'saved':'research');setPp(p);setV('paper')};
const back=()=>{if(from==='research')setInit(cur);setV(from)};
const go=k=>setV(k);
if(scr==='splash')return h(Welcome2,{go:()=>setScr('login')});if(scr==='login')return h(Login,{ok:()=>setScr('app')});
const nav=v==='paper'?(from==='saved'?'saved':'home'):v==='research'?'home':v;
return h('div',{className:'shell'},h(Sidebar,{v:nav,go}),h('main',{key:v,className:'pg'},
v==='home'&&h(Chat,{start,ds,setDs}),
v==='research'&&h(Research,{key:run,q,cons,ds,s,run,init,openPaper:open,saved,toggle,onDone}),
v==='paper'&&pp&&h(Paper,{p:pp,back,saved,toggle}),
v==='sessions'&&h(Sessions,{go,start:startFrom,hist}),
v==='saved'&&h(Saved,{saved,lib,openPaper:open,toggle,go}),
v==='settings'&&h(Settings,{s,set})))}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
 