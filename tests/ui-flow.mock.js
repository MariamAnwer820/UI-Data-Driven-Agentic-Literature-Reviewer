/* Loaded only by the local browser test; no provider or network calls are made. */
let approved=false;
const calls=[];
window.fetch=async(url,options={})=>{
  calls.push({url,options});
  if(url.endsWith('/api/sessions')) return Response.json({token:'synthetic-token'});
  if(url.endsWith('/api/datasets')) return Response.json({dataset_id:'synthetic-dataset'});
  if(url.endsWith('/api/reviews')) return Response.json({review_id:'synthetic-review',status:'running'});
  if(url.includes('/events?')) {
    const events=approved
      ? [{id:3,type:'status',status:'completed'}]
      : [{id:1,type:'progress',stage:'search',status:'started'},
         {id:2,type:'review_required',status:'awaiting_review',details:{notice:'Inspect synthetic evidence'}}];
    return new Response(events.map(x=>JSON.stringify(x)).join('\n')+'\n');
  }
  if(url.endsWith('/approve')) {approved=true;return Response.json({status:'running'});}
  if(url.endsWith('/report')) return Response.json({validated_report:{report_title:'Synthetic report',
    executive_summary:'Synthetic summary',evidence_scope:{papers_received:1,review_level:'abstract',limitations:['Synthetic only']},
    method_families:[{name:'Synthetic family',description:'Description',evidence:'Evidence',supporting_papers:['P001']}],
    family_comparison:'Comparison',important_gaps:['Synthetic gap'],recommendation:{status:'insufficient_evidence'},
    references:[{paper_id:'P001',title:'Synthetic source',year:2024,url_or_doi:'https://example.org'}],
    claim_lineage:{claims:[{evidence_ids:['E001']}]}}});
  if(url.endsWith('/synthetic-review')) return Response.json({status:approved?'completed':'awaiting_review'});
  return Response.json({detail:'Unexpected test request'},{status:500});
};
function waitFor(fn) {return new Promise((resolve,reject)=>{let attempts=0; const timer=setInterval(()=>{
  try {const result=fn(); if(result){clearInterval(timer);resolve(result);}}
  catch(error){clearInterval(timer);reject(error);}
  if(++attempts>100){clearInterval(timer);reject(new Error('Timed out waiting for UI'));}
},50);});}
function button(text) {return [...document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);}
function type(element,value) {const prototype=element.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype,'value').set.call(element,value);
  element.dispatchEvent(new Event('input',{bubbles:true}));}
window.addEventListener('load',async()=>{
  try {
    (await waitFor(()=>button('Settings'))).click();
    const key=await waitFor(()=>document.querySelector('input[type=password]')); type(key,'synthetic-key');
    button('New review').click();
    const question=await waitFor(()=>document.querySelector('textarea[aria-label="Research question"]'));
    type(question,'Synthetic research question');
    button('Start research').click();
    (await waitFor(()=>button('Approve and continue'))).click();
    await waitFor(()=>document.body.textContent.includes('Synthetic report'));
    if(!document.body.textContent.includes('Synthetic gap') || !document.body.textContent.includes('E001')) throw new Error('Missing report evidence');
    if(!calls.some(c=>c.url.includes('/approve'))) throw new Error('Approval not sent');
    if(JSON.stringify(localStorage).includes('synthetic-key')) throw new Error('Credential stored');
    document.title='UI FLOW PASS';
  } catch(error) {document.title='UI FLOW FAIL: '+error.message;}
});
