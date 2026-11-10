function Research({q,cons,ds,s,run,init,openPaper,saved,toggle,onDone}){const[st,setSt]=S(init?STEPS.length:0);const[notes,setNotes]=S({});const[data,setData]=S(init);const[err,setErr]=S('');const[tab,setTab]=S('land');const[n,setN]=S(0);
E(()=>{if(init&&n===0)return;const ctrl=new AbortController();setSt(0);setNotes({});setData(null);setErr('');
const fd=new FormData();fd.append('question',q);fd.append('constraints',cons||'');fd.append('model',s.model);fd.append('engine',s.engine);fd.append('max_papers',s.max);if(ds&&ds.file)fd.append('file',ds.file);
(async()=>{try{const res=await fetch('/api/research',{method:'POST',body:fd,signal:ctrl.signal});if(!res.ok||!res.body)throw new Error('Server error '+res.status);
const rd=res.body.getReader(),dec=new TextDecoder();let buf='';
const on=ev=>{if(ev.type==='step'){setSt(ev.status==='done'?ev.i+1:ev.i);if(ev.note)setNotes(o=>({...o,[ev.i]:ev.note}))}else if(ev.type==='result'){setData(ev.data);setSt(STEPS.length);onDone(ev.data)}else if(ev.type==='error')setErr(ev.message)};
for(;;){const{value,done}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});const L=buf.split('\n');buf=L.pop();L.forEach(l=>{if(l.trim())on(JSON.parse(l))})}
}catch(e){if(e.name!=='AbortError')setErr(e.message||'Request failed')}})();
return()=>ctrl.abort()},[n]);
const Ls=data?data.landscape:{};
return h('div',{style:{maxWidth:980}},h('div',{className:'bubble'},q),
!data&&h('div',{className:'card',style:{margin:'18px 0'}},h('div',{className:'row',style:{marginBottom:8}},h('span',{className:'av'},I('book',16)),h('span',null,'The agent is working on your question. Sources: '+s.engine+'.')),
STEPS.map(([a,b],i)=>h('div',{className:'step',key:a},h('span',{className:'dot '+(i<st?'d':i===st&&!err?'a':'')},i<st&&I('check',12)),h('div',{style:{opacity:i>st?.45:1}},h('div',null,(i+1)+'. '+a),h('div',{className:'mu',style:{fontSize:12}},notes[i]||(i<st?'Completed':i===st?'In progress…':b)))))),
err&&h('div',{className:'card'},h('p',{className:'err',role:'alert'},err),h('button',{className:'btn o',style:{marginTop:10},onClick:()=>setN(n+1)},'Retry')),
data&&h('div',{style:{marginTop:18}},h('div',{className:'tabs',role:'tablist'},[['land','Research landscape'],['plan','Experiment plan'],['pap','Papers ('+data.papers.length+')'],['data','Dataset profile']].map(([k,l])=>h('button',{key:k,role:'tab',className:tab===k?'on':'',onClick:()=>setTab(k)},l))),
tab==='land'&&h('div',{className:'grid3',style:{gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}},
[['Methods',Ls.methods],['Datasets',Ls.datasets],['Metrics',Ls.metrics],['Research gap',Ls.gaps]].map(([t,l])=>h('div',{className:'card',key:t},h('h2',null,t),h('ul',{style:{paddingLeft:18,fontSize:14,display:'grid',gap:6}},(l||[]).map(x=>h('li',{key:x},x)))))),
tab==='plan'&&h('div',{className:'card'},h('table',null,h('thead',null,h('tr',null,['Stage','What to run','Measure'].map(x=>h('th',{key:x},x)))),h('tbody',null,data.experiment_plan.map((r,k)=>h('tr',{key:k},h('td',{style:{fontWeight:600}},r.stage),h('td',null,r.run),h('td',null,r.measure)))))),
tab==='pap'&&data.papers.map(p=>h('div',{className:'li',key:p.id},h('div',null,h('div',{className:'t serif'},p.t),h('div',{className:'mu'},p.a+' · '+p.y+' · '+p.v),h('div',{className:'row',style:{marginTop:8}},h('span',{className:'chip'},p.tag),h('span',{className:'mu'},'Relevance '+p.rel+'%'))),h('button',{className:'btn o',onClick:()=>toggle(p.id),'aria-pressed':saved.includes(p.id)},saved.includes(p.id)?'Saved':'Save'),h('button',{className:'btn',onClick:()=>openPaper(p)},'View'))),
tab==='data'&&(data.profile?h(Profile,{d:data.profile}):h('div',{className:'card'},'No dataset was attached to this review.')),
h('p',{className:'mu',style:{marginTop:16}},'Paper details come from OpenAlex / Semantic Scholar. Findings are summarized from abstracts only; verify against the full text before citing.')))}