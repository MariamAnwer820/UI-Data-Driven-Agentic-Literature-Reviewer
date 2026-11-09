function Settings({s,set}) {
  const update = (key, value) => set(previous => ({...previous, [key]: value}));
  const select = (label, key, options) => h('label',{style:{display:'block',marginBottom:14}},
    h('span',{className:'mu'},label),
    h('select',{className:'in',value:s[key],onChange:e=>update(key,e.target.value)},
      options.map(([value,text])=>h('option',{key:value,value},text))));
  const keyField = (label, key, optional) => h('label',{style:{display:'block',marginBottom:14}},
    h('span',{className:'mu'},label+(optional?' (optional)':'')),
    h('input',{className:'in',type:'password',autoComplete:'off',value:s[key],
      onChange:e=>update(key,e.target.value)}));
  return h('div',{style:{maxWidth:900}},h('h1',null,'Settings'),
    h('div',{className:'card',style:{marginTop:16}},h('h2',null,'Research'),
      select('Gemini model','model', [['gemini-2.5-flash','Gemini 2.5 Flash'],['gemini-2.5-pro','Gemini 2.5 Pro']]),
      select('Literature sources','provider', [['openalex','OpenAlex'],['semantic_scholar','Semantic Scholar'],['both','OpenAlex + Semantic Scholar'],['arxiv','arXiv']]),
      h('p',{className:'mu'},'Paper limits and screening rules use the backend configuration.')),
    h('div',{className:'card',style:{marginTop:16}},h('h2',null,'Your provider credentials'),
      h('p',{className:'mu'},'Credentials stay in memory for this browser session and are sent to your local backend when you start a review. Refreshing the page clears them.'),
      keyField('Gemini API key','geminiKey',false),keyField('OpenAlex API key','openalexKey',true),
      keyField('Semantic Scholar API key','semanticKey',true)),
    h('div',{className:'card',style:{marginTop:16}},h('h2',null,'Appearance'),
      select('Theme','theme',[['Light','Light'],['Dark','Dark'],['System','System']]),
      select('Font size','font',[['Small','Small'],['Medium','Medium'],['Large','Large']])));
}
