function Login({ok}) {
  const [email,setEmail]=S(''),[password,setPassword]=S(''),[creating,setCreating]=S(false);
  const [error,setError]=S(''),[busy,setBusy]=S(false),[notice,setNotice]=S('');
  async function submit(event) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      const credentials={email:email.trim(),password};
      if (creating) await ReviewAPI.register(credentials);
      const session=await ReviewAPI.login(credentials);
      setPassword(''); ok(session.token,credentials.email);
    } catch (e) { setError(e.message || 'Unable to sign in.'); }
    finally { setBusy(false); }
  }
  return h('div',{className:'login'},
    h('div',{className:'lbrand'},h(Logo,{s:56}),h('h1',{style:{fontSize:34}},'AI Literature Reviewer'),
      h('p',null,'Smarter research. Better decisions.'),
      h('ul',null,['Find relevant research papers','Analyze methodologies & results','Compare approaches','Get data-driven recommendations']
        .map(x=>h('li',{key:x},h('span',{style:{color:'#d4506f'}},I('check',16)),x)))),
    h('div',{className:'lform'},h('form',{onSubmit:submit},
      h('h2',{style:{textAlign:'center',fontSize:24}},creating?'Create account':'Welcome Back'),
      h('p',{className:'mu',style:{textAlign:'center'}},'Sign in to access your saved research.'),
      h('input',{className:'in',type:'email',required:true,placeholder:'Email address','aria-label':'Email address',value:email,onChange:e=>setEmail(e.target.value)}),
      h('input',{className:'in',type:'password',required:true,minLength:12,maxLength:1024,placeholder:'Password (at least 12 characters)','aria-label':'Password',value:password,onChange:e=>setPassword(e.target.value)}),
      error&&h('p',{className:'err',role:'alert'},error),notice&&h('p',{role:'status'},notice),
      h('button',{className:'btn',type:'submit',disabled:busy,style:{width:'100%',marginTop:16}},busy?'Please wait':creating?'Create account':'Sign In'),
      h('button',{className:'btn g',type:'button',style:{width:'100%',marginTop:12},onClick:()=>{setCreating(!creating);setError('');setNotice('')}},creating?'Already have an account? Sign in':'Create an account'))));
}
