function Sidebar({v,go}){const it=[['home','Chat','chat'],['sessions','History','clock'],['saved','Saved Papers','mark'],['settings','Settings','cog']];
return h('nav',{className:'side','aria-label':'Main'},h('div',{className:'logo'},h(Logo,{s:34}),h('div',{className:'serif',style:{fontSize:14,lineHeight:1.3,marginTop:6}},'Data-Driven Agentic Literature Reviewer')),
it.map(([k,l,i])=>h('button',{key:k,className:'nv'+(v===k?' on':''),onClick:()=>go(k),'aria-current':v===k?'page':undefined},I(i),l)),
h('div',{className:'me'},h('span',{className:'av'},'M'),h('div',null,h('div',{style:{color:'#fff',fontWeight:500}},'Mariam Anwer'),'mariam@example.com')))}
