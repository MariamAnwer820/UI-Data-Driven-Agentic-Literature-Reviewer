function Research({run}) {
  const [version,refresh]=S(0), [error,setError]=S(''), [busy,setBusy]=S(false);
  const [connection,setConnection]=S(0);
  const update=()=>refresh(n=>n+1);
  E(()=>{
    const controller=new AbortController(), signal=controller.signal;
    async function connect() {
      try {
        setError('');
        if(!run.token) {
          const credentials={gemini_api_key:run.settings.geminiKey.trim()};
          if(run.settings.openalexKey.trim()) credentials.openalex_api_key=run.settings.openalexKey.trim();
          if(run.settings.semanticKey.trim()) credentials.semantic_scholar_api_key=run.settings.semanticKey.trim();
          const session=await ReviewAPI.session(credentials,signal); run.token=session.token;
        }
        if(run.file && !run.datasetId) {
          run.status='uploading'; update();
          run.datasetId=(await ReviewAPI.upload(run.file,run.token,signal)).dataset_id;
        }
        if(!run.id) {
          const body={question:run.question,constraints:run.constraints?[run.constraints]:[],task:run.task,
            provider:run.settings.provider,model:run.settings.model};
          if(run.datasetId) { body.dataset_id=run.datasetId; body.target_column=run.target; }
          const job=await ReviewAPI.start(body,run.token,signal); run.id=job.review_id; run.status=job.status;
        }
        if(run.status==='completed' && !run.report) run.report=await ReviewAPI.report(run.id,run.token,signal);
        if(!['awaiting_review','paused','failed','cancelled','completed'].includes(run.status)) {
          await ReviewAPI.events(run.id,run.token,run.lastId,event=>{
            run.lastId=event.id; run.events.push(event);
            if(event.status && event.type!=='progress') run.status=event.status;
            if(event.type==='review_required') run.reviewDetails=event.details;
            if(event.type==='paused') run.pauseDetails=event;
            if(event.type==='error') run.failure=event.message;
            update();
          },signal);
          const state=await ReviewAPI.status(run.id,run.token,signal); run.status=state.status;
          if(run.status==='completed') run.report=await ReviewAPI.report(run.id,run.token,signal);
        }
        update();
      } catch(e) { if(e.name!=='AbortError') setError(e.message||'Connection failed.'); }
    }
    connect(); return ()=>controller.abort();
  },[connection]);
  async function action(name) {
    setBusy(true); setError('');
    try { await ReviewAPI.action(run.id,name,run.token); run.status=name==='cancel'?'cancelling':'running';
      update(); setConnection(n=>n+1);
    } catch(e) {setError(e.message);} finally {setBusy(false);}
  }
  async function download() {
    try {const text=await ReviewAPI.markdown(run.id,run.token); const url=URL.createObjectURL(new Blob([text],{type:'text/markdown'}));
      const link=document.createElement('a'); link.href=url; link.download='coverage-aware-report.md'; link.click(); URL.revokeObjectURL(url);
    } catch(e) {setError(e.message);}
  }
  const report=run.report&&run.report.validated_report;
  const list=(items)=>h('ul',null,(items||[]).map((item,i)=>h('li',{key:i},String(item))));
  const section=(title,body)=>h('section',{className:'card',style:{marginTop:14}},h('h2',null,title),body);
  const json=(value)=>h('pre',{style:{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:12}},JSON.stringify(value,null,2));
  const link=(value)=>{try {const parsed=new URL(value); return ['http:','https:'].includes(parsed.protocol)?parsed.href:null;}catch(_){return null;}};
  return h('div',{style:{maxWidth:980}},h('h1',null,'Coverage-aware review'),h('div',{className:'bubble'},run.question),
    section('Status: '+run.status,h('div',null,
      h('p',{className:'mu'},'Progress comes from the backend. A review can pause when evidence requires inspection.'),
      error&&h('p',{className:'err',role:'alert'},error),
      run.failure&&h('p',{className:'err',role:'alert'},run.failure),
      error&&h('button',{className:'btn o',onClick:()=>setConnection(n=>n+1)},'Reconnect'),
      run.id&&!['cancelled','completed','failed'].includes(run.status)&&h('button',{className:'btn o',disabled:busy,onClick:()=>action('cancel')},'Cancel review'))),
    run.status==='awaiting_review'&&section('Review evidence before continuing',h('div',null,
      h('p',null,'Inspect the preparation details and unresolved papers before approving family consolidation.'),
      json(run.reviewDetails),h('button',{className:'btn',disabled:busy,onClick:()=>action('approve')},'Approve and continue'))),
    run.status==='paused'&&section('Review paused',h('div',null,h('p',null,run.pauseDetails&&run.pauseDetails.message),
      json(run.pauseDetails&&run.pauseDetails.details),h('p',{className:'mu'},'Retry is appropriate only after correcting a recoverable issue. Some coverage issues require manual inspection.'),
      h('button',{className:'btn o',disabled:busy,onClick:()=>action('resume')},'Resume'))),
    section('Progress events',run.events.length?h('ol',null,run.events.map((event,i)=>h('li',{key:event.id||i},
      h('span',null,[event.stage,event.status,event.message].filter(Boolean).join(' — ')||event.type),
      event.stage==='provider_retry'&&h('span',null,' (attempt '+event.attempt+' of '+event.max_attempts+')')))):h('p',{className:'mu'},'Waiting for progress.')),
    report&&h('div',null,
      section(report.report_title||'Report',h('div',null,h('p',null,report.executive_summary),h('button',{className:'btn o',onClick:download},'Download Markdown'),
        h('p',{className:'mu'},'Structural validation does not establish scientific correctness. Review source material before citing.'))),
      section('Coverage and limitations',h('div',null,h('p',null,'Papers received: '+report.evidence_scope.papers_received),
        h('p',null,'Review level: '+report.evidence_scope.review_level),list(report.evidence_scope.limitations))),
      section('Method families',h('div',null,(report.method_families||[]).map((family,i)=>h('div',{key:i,style:{marginBottom:16}},
        h('h3',null,family.name),h('p',null,family.description),h('p',null,family.evidence),
        h('p',{className:'mu'},'Supporting papers: '+(family.supporting_papers||[]).join(', ')))),h('p',null,report.family_comparison))),
      section('Research gaps',list(report.important_gaps)),
      section('Recommendation and experiment plan',json(report.recommendation)),
      section('Source references',h('ul',null,(report.references||[]).map(ref=>h('li',{key:ref.paper_id},
        ref.paper_id+' — '+ref.title+' ('+ref.year+') ',link(ref.url_or_doi)&&h('a',{href:link(ref.url_or_doi),target:'_blank',rel:'noopener noreferrer'},'Source'))))),
      section('Claim-level evidence links',json(report.claim_lineage))));
}
