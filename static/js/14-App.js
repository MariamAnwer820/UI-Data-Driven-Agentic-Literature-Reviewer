function App() {
  const [view,setView]=S('home'), [file,setFile]=S(null), [runNumber,setRunNumber]=S(0);
  const run=R(null);
  const [settings,setSettings]=S({model:'gemini-2.5-flash',provider:'openalex',
    geminiKey:'',openalexKey:'',semanticKey:'',theme:'Light',font:'Medium'});
  E(()=>{const root=document.documentElement;
    if(settings.theme==='System') delete root.dataset.theme; else root.dataset.theme=settings.theme.toLowerCase();
    root.style.setProperty('--fs',{Small:'14px',Medium:'15px',Large:'17px'}[settings.font]);
  },[settings.theme,settings.font]);
  function start(question,constraints,task,target) {
    if(run.current && run.current.token) ReviewAPI.close(run.current.token).catch(()=>{});
    run.current={question,constraints,task,target,file,settings:{...settings},events:[],lastId:0,
      requestId:crypto.randomUUID(),status:'starting'};
    setRunNumber(n=>n+1); setView('research');
  }
  return h('div',{className:'shell'},h(Sidebar,{v:view,go:setView,hasReview:!!run.current}),
    h('main',{className:'pg'},
      view==='home'&&h(Chat,{start,ds:file,setDs:setFile,s:settings,go:setView}),
      view==='settings'&&h(Settings,{s:settings,set:setSettings}),
      view==='research'&&run.current&&h(Research,{key:runNumber,run:run.current})));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
