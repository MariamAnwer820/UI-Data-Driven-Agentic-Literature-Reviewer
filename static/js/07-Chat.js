function Chat({start,ds,setDs,s,go}) {
  const [question,setQuestion]=S(''), [constraints,setConstraints]=S('');
  const [task,setTask]=S('classification'), [target,setTarget]=S(''), [error,setError]=S('');
  function run() {
    if (!question.trim()) return setError('Enter a research question.');
    if (!s.geminiKey.trim()) return setError('Add your Gemini API key in Settings first.');
    if (ds && !target.trim()) return setError('Enter the target column name for your CSV.');
    setError(''); start(question.trim(), constraints.trim(), task, target.trim());
  }
  return h('div',{style:{maxWidth:900}},h('h1',null,'Start a research review'),
    h('p',{className:'mu'},'Ask a question and optionally add a CSV dataset.'),
    h('div',{className:'card form',style:{marginTop:16}},
      h('label',null,h('b',null,'Research question'),h('textarea',{className:'ta',value:question,
        onChange:e=>setQuestion(e.target.value),'aria-label':'Research question'})),
      h('label',null,h('b',null,'Constraints (optional)'),h('textarea',{className:'ta',value:constraints,
        onChange:e=>setConstraints(e.target.value),'aria-label':'Constraints'})),
      h('label',null,h('b',null,'Task'),h('select',{className:'in',value:task,onChange:e=>setTask(e.target.value)},
        h('option',{value:'classification'},'Classification'),h('option',{value:'regression'},'Regression'))),
      h('label',null,h('b',null,'Dataset (optional CSV)'),h('input',{className:'in',type:'file',accept:'.csv,text/csv',
        onChange:e=>setDs(e.target.files[0]||null)})),
      ds&&h('div',null,h('p',{className:'mu'},'Selected: '+ds.name),
        h('label',null,h('b',null,'Target column'),h('input',{className:'in',value:target,
          onChange:e=>setTarget(e.target.value),placeholder:'Exact column name'})),
        h('button',{className:'btn o',type:'button',onClick:()=>setDs(null)},'Remove dataset')),
      error&&h('p',{className:'err',role:'alert'},error),
      h('div',{className:'row'},h('button',{className:'btn',onClick:run},'Start research'),
        h('button',{className:'btn o',onClick:()=>go('settings')},'Settings'))));
}
