function Sidebar({v,go,hasReview}) {
  const items=[['home','New review','chat'],['research','Current review','book'],['settings','Settings','cog']];
  return h('nav',{className:'side','aria-label':'Main'},
    h('div',{className:'logo'},h(Logo,{s:34}),h('div',{className:'serif',style:{fontSize:14}},'Data-Driven Agentic Literature Reviewer')),
    items.map(([key,label,icon])=>h('button',{key,className:'nv'+(v===key?' on':''),
      disabled:key==='research'&&!hasReview,onClick:()=>go(key),'aria-current':v===key?'page':undefined},I(icon),label)),
    h('div',{className:'me'},'Local session'));
}
