
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

  const u = (k,v) => set(prev=>({
    ...prev,
    [k]:v
  }));

  const updateApiKey = (provider,value) => {
    set(prev=>({
      ...prev,
      apiKeys:{
        ...(prev.apiKeys || {}),
        [provider]:value
      },
      keySaved:false
    }));
  };

  const toggleApiVisibility = (provider) => {
    set(prev=>({
      ...prev,
      visibleApiKeys:{
        ...(prev.visibleApiKeys || {}),
        [provider]:!(prev.visibleApiKeys || {})[provider]
      }
    }));
  };

  const Sel = (l,k,o) =>
    h('label',{
      style:{
        display:'block',
        marginBottom:14
      }
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

  // API Key Input with Show / Hide
  const ApiInput = (label,provider,placeholder) => {

    const isVisible =
      !!(s.visibleApiKeys || {})[provider];

    return h('label',{
      style:{
        display:'block',
        marginBottom:16
      }
    },

      h('span',{
        className:'mu'
      },label),

      h('div',{
        style:{
          position:'relative',
          marginTop:5
        }
      },

        h('input',{
          className:'in',
          type:isVisible?'text':'password',
          style:{
            paddingRight:75,
            width:'100%',
            boxSizing:'border-box'
          },
          placeholder,
          autoComplete:'new-password',
          spellCheck:false,
          value:(s.apiKeys || {})[provider] || '',
          onChange:e=>updateApiKey(
            provider,
            e.target.value
          )
        }),

        h('button',{
          type:'button',
          onClick:()=>toggleApiVisibility(provider),
          style:{
            position:'absolute',
            right:10,
            top:'50%',
            transform:'translateY(-50%)',
            background:'transparent',
            border:'none',
            color:'var(--mu)',
            cursor:'pointer',
            fontSize:12,
            fontWeight:600,
            padding:'5px'
          }
        },
          isVisible?'Hide':'Show'
        )
      )
    );
  };

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

  // Search engine conditions
  const searchEngine =
    s.engine || 'OpenAlex + Semantic Scholar';

  const showOpenAlex =
    searchEngine.includes('OpenAlex');

  const showSemanticScholar =
    searchEngine.includes('Semantic Scholar');

  const showArxiv =
    searchEngine.includes('arXiv');

  // Language model options
  const models = [
    'Gemini 2.5 Flash',
    'Gemini 2.5 Pro',
    'OpenAI GPT-4.1 mini',
    'OpenAI GPT-4.1',
    'Anthropic Claude Sonnet',
    'Anthropic Claude Haiku'
  ];

  // Selected model provider
  const selectedModel = s.model || models[0];

  const selectedProvider =
    selectedModel.startsWith('Gemini')
      ? 'Google Gemini'
      : selectedModel.startsWith('OpenAI')
        ? 'OpenAI'
        : 'Anthropic';

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

    h('div',{
      style:{height:14}
    }),

    // Research Settings
    h('div',{
      className:'card',
      style:{marginBottom:14}
    },

      h('h2',null,'Research'),

      Sel(
        'Language model',
        'model',
        models
      ),

      Sel(
        'Search engine',
        'engine',
        [
          'OpenAlex',
          'Semantic Scholar',
          'arXiv',
          'OpenAlex + Semantic Scholar',
          'OpenAlex + arXiv',
          'Semantic Scholar + arXiv',
          'OpenAlex + Semantic Scholar + arXiv'
        ]
      ),

      Sel(
        'Maximum papers per search',
        'max',
        ['5','10','20','30','50','80','100']
      ),

      h('label',{
        style:{
          display:'block',
          marginBottom:14
        }
      },

        h('span',{
          className:'mu'
        },'Papers selected for detailed analysis'),

        h('input',{
          className:'in',
          type:'number',
          min:1,
          max:1000,
          value:s.selectedPapers || 10,
          onChange:e=>u(
            'selectedPapers',
            e.target.value
          )
        })
      ),

      h('p',{
        className:'mu'
      },
        'The search limit applies to each query and caps new papers per search round.'
      )
    ),

    // API Configuration
    h('div',{
      className:'card',
      style:{marginBottom:14}
    },

      h('h2',null,'API Configuration'),

      h('p',{
        className:'mu',
        style:{marginBottom:18}
      },
        'Configure your language model and academic search API keys.'
      ),

      // Language Model API
      h('h3',null,'Language Model API'),

      h('p',{
        className:'mu',
        style:{marginBottom:14}
      },
        'Selected provider: ',
        selectedProvider
      ),

      selectedProvider === 'Google Gemini' &&
        ApiInput(
          'Google Gemini API Key',
          'Google Gemini',
          'Enter your Gemini API key'
        ),

      selectedProvider === 'OpenAI' &&
        ApiInput(
          'OpenAI API Key',
          'OpenAI',
          'Enter your OpenAI API key'
        ),

      selectedProvider === 'Anthropic' &&
        ApiInput(
          'Anthropic API Key',
          'Anthropic',
          'Enter your Anthropic API key'
        ),

      h('div',{
        style:{
          height:1,
          background:'var(--bd)',
          margin:'20px 0'
        }
      }),

      // Research Search API
      h('h3',null,'Research Search API'),

      showOpenAlex &&
        ApiInput(
          'OpenAlex API Key',
          'OpenAlex',
          'Enter your OpenAlex API key'
        ),

      showSemanticScholar &&
        ApiInput(
          'Semantic Scholar API Key',
          'Semantic Scholar',
          'Enter your Semantic Scholar API key'
        ),

      showArxiv &&
        h('p',{
          className:'mu',
          style:{marginBottom:14}
        },
          'arXiv uses a public API and does not require an API key.'
        ),

      // Save API Configuration
      h('button',{
        className:'btn',
        type:'button',
        onClick:()=>{
          u('keySaved',true);
        }
      },'Save API Configuration'),

      s.keySaved &&
        h('p',{
          className:'mu',
          role:'status',
          style:{marginTop:10}
        },
          'API configuration is ready for this session.'
        ),

      h('p',{
        className:'mu',
        style:{
          fontSize:12,
          marginTop:12
        }
      },
        'Keys remain in memory for this browser session and are cleared on refresh.'
      )
    ),

    // Appearance Settings
    h('div',{
      className:'card'
    },

      h('h2',null,'Appearance'),

      Sel(
        'Theme',
        'theme',
        ['System','Light','Dark']
      ),

      Sel(
        'Font size',
        'font',
        ['Small','Medium','Large']
      ),

      h(Tg,{
        l:'Notify me when a review finishes',
        on:!!s.notify,
        set:v=>u('notify',v)
      })
    )
  );
}
