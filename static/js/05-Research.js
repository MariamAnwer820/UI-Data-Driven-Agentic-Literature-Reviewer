function Research({run,openPaper,saved,toggle,onDone}){
const[version,refresh]=S(0),[err,setErr]=S(''),[tab,setTab]=S('land'),[connection,setConnection]=S(0),[busy,setBusy]=S(false);
const update=()=>refresh(n=>n+1);
const stages={dataset_profiling:1,search:2,paper_analysis:4,abstract_analysis:4,coverage_preparation:4,family_consolidation:5,final_synthesis:5};
function saveReport(payload){
  const report=payload.validated_report;if(!report)throw new Error('The backend did not return a validated report.');
  const jobs=Object.fromEntries((payload.in_depth_papers||[]).map(job=>[job.paper_id,job]));
  const papers=(report.references||[]).map(ref=>{const job=jobs[ref.paper_id],p=job&&job.paper||{};return {
    id:run.id+':'+ref.paper_id,paperId:ref.paper_id,t:ref.title,a:'Authors not supplied',y:ref.year||'Year unavailable',v:p.venue||'Venue unavailable',tag:job?job.status:'Referenced',
    doi:p.doi||'Not supplied',c:p.cited_by_count??null,url:p.url||ref.url_or_doi||'',abs:p.abstract||'Abstract not supplied',
    kf:job?(job.claims||[]).map(c=>c.claim):[],m:job?(job.claims||[]).filter(c=>c.kind==='method').map(c=>c.claim).join(' ')||'No method claim supplied.':'Not supplied',
    r:job?(job.claims||[]).filter(c=>c.kind==='result').map(c=>c.claim).join(' ')||'No result claim supplied.':'Not supplied',cit:[]}});
  const profile=run.ds?{...run.ds,target:run.target,cls:run.task==='classification'&&run.ds.target===run.target?run.ds.cls:[]}:null;
  run.data={report,papers,profile};onDone(run,run.data);
}
E(()=>{const ctrl=new AbortController(),signal=ctrl.signal;
(async()=>{try{setErr('');
if(!run.token){const keys=run.settings.apiKeys||{},credentials={gemini_api_key:(keys['Google Gemini']||'').trim()};
if((keys.OpenAlex||'').trim())credentials.openalex_api_key=keys.OpenAlex.trim();if((keys['Semantic Scholar']||'').trim())credentials.semantic_scholar_api_key=keys['Semantic Scholar'].trim();
run.token=(await ReviewAPI.session(credentials,signal)).token}
if(run.ds&&run.ds.file&&!run.datasetId){run.status='uploading';update();run.datasetId=(await ReviewAPI.upload(run.ds.file,run.token,signal)).dataset_id}
if(!run.reviewId){const providers={'OpenAlex':'openalex','Semantic Scholar':'semantic_scholar','OpenAlex + Semantic Scholar':'both'},models={'Gemini 2.5 Flash (free tier)':'gemini-2.5-flash','Gemini 2.5 Pro':'gemini-2.5-pro'};
const body={question:run.q,constraints:run.cons?[run.cons]:[],task:run.task||'classification',provider:providers[run.settings.engine],model:models[run.settings.model],papers_per_search:Number(run.settings.max),selected_papers:Number(run.settings.selectedPapers),client_request_id:run.id};
if(run.datasetId){body.dataset_id=run.datasetId;body.target_column=run.target}
const job=await ReviewAPI.start(body,run.token,signal);run.reviewId=job.review_id;run.status=job.status}
if(run.status==='completed'&&!run.data)saveReport(await ReviewAPI.report(run.reviewId,run.token,signal));
if(!run.events.length||!['awaiting_review','paused','failed','cancelled','completed'].includes(run.status)){
await ReviewAPI.events(run.reviewId,run.token,run.lastId,event=>{run.lastId=event.id;run.events.push(event);if(event.status&&event.type!=='progress')run.status=event.status;if(event.type==='review_required')run.reviewDetails=event.details;if(event.type==='paused')run.pauseDetails=event;if(event.type==='error')run.failure=event.message;update()},signal);
run.status=(await ReviewAPI.status(run.reviewId,run.token,signal)).status;if(run.status==='completed'&&!run.data)saveReport(await ReviewAPI.report(run.reviewId,run.token,signal))}
update();
}catch(e){if(e.name!=='AbortError')setErr(e.message||'Connection failed.')}})();return()=>ctrl.abort()},[connection]);
async function action(name){setBusy(true);setErr('');try{await ReviewAPI.action(run.reviewId,name,run.token);run.status=name==='cancel'?'cancelling':'running';update();setConnection(n=>n+1)}catch(e){setErr(e.message)}finally{setBusy(false)}}
async function download(){try{const content=await ReviewAPI.markdown(run.reviewId,run.token),url=URL.createObjectURL(new Blob([content],{type:'text/markdown'})),a=document.createElement('a');a.href=url;a.download='coverage-aware-report.md';a.click();URL.revokeObjectURL(url)}catch(e){setErr(e.message)}}
const data=run.data,report=data&&data.report;
const list=items=>h('ul',{style:{paddingLeft:18}},(items||[]).map((item,i)=>h('li',{key:i},item)));
const json=value=>h('pre',{style:{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:12}},JSON.stringify(value,null,2));
const fieldLabels={status:'Status',what_to_do:'Recommendation',supporting_papers:'Supporting papers',reason:'Reason',confidence:'Confidence',confidence_reason:'Confidence rationale',limitations:'Limitations',first_experiment:'First experiment',baseline:'Baseline',comparison:'Comparison',metrics:'Metrics',validation_controls:'Validation controls',decision_rule:'Decision rule',next_step_if_it_fails:'Next step if it fails'};
return h('div',{style:{maxWidth:980}},h('div',{className:'bubble'},run.q),
!data&&h('div',{className:'card',style:{margin:'18px 0'}},h('div',{className:'row',style:{marginBottom:8}},h('span',{className:'av'},I('book',16)),h('span',null,'Review status: '+run.status)),
STEPS.map(([a,b],i)=>{const event=[...run.events].reverse().find(e=>stages[e.stage]===i),done=event&&['done','reused'].includes(event.status),active=event&&['started','updated'].includes(event.status);return h('div',{className:'step',key:a},h('span',{className:'dot '+(done?'d':active?'a':'')},done&&I('check',12)),h('div',{style:{opacity:event?1:.55}},h('div',null,(i+1)+'. '+a),h('div',{className:'mu',style:{fontSize:12}},event?event.stage+' — '+event.status:i===1&&!run.ds?'No dataset attached':b)))}),
h('details',{open:true},h('summary',null,'Progress events'),h('ol',null,run.events.map(e=>h('li',{key:e.id},[e.stage||e.type,e.status,e.message,e.stage==='provider_retry'?'attempt '+e.attempt+' of '+e.max_attempts:null].filter(Boolean).join(' — '))))),
run.reviewId&&!['completed','cancelled','failed'].includes(run.status)&&h('button',{className:'btn o',disabled:busy,onClick:()=>action('cancel')},'Cancel review')),
err&&h('div',{className:'card'},h('p',{className:'err',role:'alert'},err),h('button',{className:'btn o',onClick:()=>setConnection(n=>n+1)},'Reconnect')),
run.failure&&h('div',{className:'card'},h('p',{className:'err',role:'alert'},run.failure)),
run.status==='awaiting_review'&&h('div',{className:'card'},h('h2',null,'Review family preparation'),h('p',null,'Inspect the preparation and unresolved papers before continuing.'),json(run.reviewDetails),h('button',{className:'btn',disabled:busy,onClick:()=>action('approve')},'Approve and continue')),
run.status==='paused'&&h('div',{className:'card'},h('h2',null,'Review paused'),h('p',null,run.pauseDetails&&run.pauseDetails.message),json(run.pauseDetails&&run.pauseDetails.details),h('p',{className:'mu'},'Some coverage issues need manual investigation before retrying.'),h('button',{className:'btn o',disabled:busy,onClick:()=>action('resume')},'Resume')),
data&&h('div',{style:{marginTop:18}},h('div',{className:'tabs',role:'tablist'},[['land','Research landscape'],['plan','Experiment plan'],['pap','Papers ('+data.papers.length+')'],['data','Dataset profile']].map(([k,l])=>h('button',{key:k,role:'tab',className:tab===k?'on':'',onClick:()=>setTab(k)},l))),
tab==='land'&&h('div',null,h('div',{className:'card'},h('h2',null,report.report_title),h('p',null,report.executive_summary),h('h3',null,'Coverage and limitations'),h('p',null,'Papers received: '+report.evidence_scope.papers_received+'; review level: '+report.evidence_scope.review_level),list(report.evidence_scope.limitations)),
h('div',{className:'grid3',style:{gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}},h('div',{className:'card'},h('h2',null,'Method families'),(report.method_families||[]).map((f,i)=>h('div',{key:i},h('h3',null,f.name),h('p',null,f.description),f.problem_addressed&&h('p',null,f.problem_addressed),h('p',null,f.evidence),h('p',{className:'mu'},'Papers: '+(f.supporting_papers||[]).join(', ')))),h('p',null,report.family_comparison)),h('div',{className:'card'},h('h2',null,'Research gaps'),list(report.important_gaps)),h('div',{className:'card'},h('h2',null,'Claim-level evidence'),(report.claim_lineage&&report.claim_lineage.claims||[]).map((c,i)=>h('div',{key:i},h('p',null,c.claim_text),h('p',{className:'mu'},c.claim_path+' — '+(c.evidence_ids||[]).join(', '))))))),
tab==='plan'&&h('div',{className:'card'},h('h2',null,'Recommendation and experiment plan'),Object.entries(report.recommendation||{}).map(([key,value])=>h('div',{key,style:{marginBottom:12}},h('b',null,fieldLabels[key]||key),Array.isArray(value)?list(value):h('p',null,String(value??''))))),
tab==='pap'&&data.papers.map(p=>h('div',{className:'li',key:p.id},h('div',null,h('div',{className:'t serif'},p.t),h('div',{className:'mu'},p.paperId+' · '+p.y+' · '+p.v),h('span',{className:'chip'},p.tag)),h('button',{className:'btn o',onClick:()=>toggle(p.id),'aria-pressed':saved.includes(p.id)},saved.includes(p.id)?'Saved':'Save'),h('button',{className:'btn',onClick:()=>openPaper(p)},'View'))),
tab==='data'&&(data.profile?h('div',null,h('p',{className:'mu'},'Local CSV preview; backend profiling was '+(report.dataset_profile_used?'used':'not used')+'.'),h(Profile,{d:data.profile,task:run.task})):h('div',{className:'card'},'No dataset was attached to this review.')),
h('button',{className:'btn o',onClick:download,style:{marginTop:14}},'Download Markdown'),h('p',{className:'mu',style:{marginTop:16}},'Structural checks do not establish scientific correctness. Verify findings against their sources.')))
}
