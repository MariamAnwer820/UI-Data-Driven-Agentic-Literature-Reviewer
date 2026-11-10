
const Tg = ({on,set,l}) =>
  h('div',{
    className:'row sp',
    style:{
      padding:'12px 0',
      borderBottom:'1px solid var(--bd)'
    }
  },
    h('span',null,l),
    h('button',{
      className:'sw'+(on?' on':''),
      role:'switch',
      'aria-checked':on,
      'aria-label':l,
      onClick:()=>set(!on)
    },h('i'))
  );

function Settings({s,set}) {

  const u = (k,v) => set({...s,[k]:v});

  const Sel = (l,k,o) =>
    h('label',{
      style:{display:'block',marginBottom:14}
    },
      h('span',{className:'mu'},l),
      h('select',{
        className:'in',
        style:{marginTop:4},
        value:s[k] || o[0],
        onChange:e=>u(k,e.target.value)
      },
        o.map(x=>h('option',{
          key:x,
          value:x
        },x))
      )
    );

  // Apply selected theme
  React.useEffect(()=>{
    const root = document.documentElement;

    if(s.theme === 'Dark') {
      root.setAttribute('data-theme','dark');
    }
    else if(s.theme === 'Light') {
      root.setAttribute('data-theme','light');
    }
    else {
      root.removeAttribute('data-theme');
    }
  },[s.theme]);

  return h('div',{
    style:{
      width:'100%',
      maxWidth:900,
      margin:'0 auto'
    }
  },

    // Page Title
    h('h1',{
      style:{textAlign:'center'}
    },'Settings'),

    h('div',{style:{height:14}}),

    // Research Settings
    h('div',{
      className:'card',
      style:{marginBottom:14}
    },

      h('h2',null,'Research'),

      Sel('Language model','model',[
        'Gemini 2.5 Flash (free tier)',
        'Gemini 2.5 Pro'
      ]),

      Sel('Search engine','engine',[
        'OpenAlex',
        'OpenAlex + Semantic Scholar',
        'Semantic Scholar'
      ]),

      Sel('Maximum papers per search','max',[
        '5','10','20','30','50','80','100'
      ]),
      h('label',{style:{display:'block',marginBottom:14}},h('span',{className:'mu'},'Papers selected for detailed analysis'),
        h('input',{className:'in',type:'number',min:1,max:1000,value:s.selectedPapers,
          onChange:e=>u('selectedPapers',e.target.value)})),
      h('p',{className:'mu'},'The search limit applies to each query and caps new papers per search round.')
    ),

    // API Configuration
    h('div',{
      className:'card',
      style:{marginBottom:14}
    },

      h('h2',null,'API Configuration'),

      h('p',{
        className:'mu',
        style:{marginBottom:14}
      },'Configure your AI provider and API key.'),

      // AI Provider
      h('label',{
        style:{display:'block',marginBottom:14}
      },

        h('span',{className:'mu'},'AI Provider'),

        h('select',{
          className:'in',
          style:{marginTop:4},
          value:s.provider || 'Google Gemini',
          onChange:e=>u('provider',e.target.value)
        },

          h('option',{
            value:'Google Gemini'
          },'Google Gemini'),h('option',{value:'OpenAlex'},'OpenAlex'),
          h('option',{value:'Semantic Scholar'},'Semantic Scholar')
        )
      ),

      // API Key - No Switch Button
      h('label',{
        style:{display:'block',marginBottom:14}
      },

        h('span',{className:'mu'},'API Key'),

        h('input',{
          className:'in',
          type:'password',
          placeholder:'Enter your API key',
          autoComplete:'off',
          value:(s.apiKeys || {})[s.provider || 'Google Gemini'] || '',
          onChange:e=>u('apiKeys',{...(s.apiKeys || {}),[s.provider || 'Google Gemini']:e.target.value})
        })
      ),

      h('p',{
        className:'mu',
        style:{fontSize:12,marginBottom:14}
      },
        'Keys remain in memory for this browser session and are cleared on refresh.'
      ),

      // Save API Configuration
      h('button',{
        className:'btn',
        onClick:()=>{
          u('keySaved',true)
        }
      },'Save API Configuration'),
      s.keySaved&&h('p',{className:'mu',role:'status'},'Keys are ready for this session.')
    ),

    // Appearance Settings
    h('div',{className:'card'},

      h('h2',null,'Appearance'),

      Sel('Theme','theme',[
        'System','Light','Dark'
      ]),

      Sel('Font size','font',[
        'Small','Medium','Large'
      ]),

      h(Tg,{
        l:'Notify me when a review finishes',
        on:!!s.notify,
        set:v=>u('notify',v)
      })
    )
  );
}
