function Home({go,start,ds,setDs}){const[q,setQ]=S('');const ref=R();
const up=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{setDs({...parseCSV(String(r.result),f.name),file:f})}catch(x){}};r.readAsText(f.slice(0,2e6))};
return h('div',{style:{maxWidth:900}},h('h1',null,'Hello, Mariam 👋'),h('p',{className:'mu',style:{fontSize:16,marginBottom:18}},'What research problem are you investigating today?'),
h('textarea',{className:'ta',value:q,onChange:e=>setQ(e.target.value),placeholder:'e.g. I want to find the best machine learning models for churn prediction in imbalanced datasets…','aria-label':'Research problem'}),
h('div',{className:'row sp',style:{marginTop:12}},h('div',{className:'row'},h('label',{className:'drop'},I('clip',15),' ',ds?ds.name:'Attach a CSV dataset',h('input',{type:'file',accept:'.csv',hidden:true,onChange:up})),!ds&&h('button',{className:'mu',onClick:()=>setDs(SAMPLE)},'Use sample data'),ds&&h('button',{className:'mu',onClick:()=>setDs(null)},'Remove')),
h('button',{className:'btn',onClick:()=>start(q||EXS[1])},'Start Literature Review',I('send',16))),
ds&&h('div',{style:{marginTop:18}},h(Profile,{d:ds})),
h('h2',{style:{marginTop:34}},'Quick Examples'),h('div',{className:'grid3'},EXS.map(x=>h('button',{key:x,className:'ex',onClick:()=>setQ(x)},x))))}
