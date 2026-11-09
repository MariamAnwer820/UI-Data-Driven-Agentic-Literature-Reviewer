/* Loaded only into a temporary test page; talks to local_backend_fixture.py. */
function waitFor(fn) {return new Promise((resolve,reject)=>{let attempts=0; const timer=setInterval(()=>{
  const result=fn(); if(result){clearInterval(timer);resolve(result);}
  if(++attempts>200){clearInterval(timer);reject(new Error('Timed out waiting for UI'));}
},50);});}
function button(text) {return [...document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);}
function type(element,value) {const prototype=element.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype,'value').set.call(element,value);
  element.dispatchEvent(new Event('input',{bubbles:true}));}
window.addEventListener('load',async()=>{
  try {
    (await waitFor(()=>button('Settings'))).click();
    type(await waitFor(()=>document.querySelector('input[type=password]')),'synthetic-key');
    button('New review').click();
    type(await waitFor(()=>document.querySelector('textarea[aria-label="Research question"]')),'Synthetic research question');
    const fileInput=document.querySelector('input[type=file]'), transfer=new DataTransfer();
    transfer.items.add(new File(['feature,label\n1,yes\n2,no\n'],'synthetic.csv',{type:'text/csv'}));
    fileInput.files=transfer.files; fileInput.dispatchEvent(new Event('change',{bubbles:true}));
    type(await waitFor(()=>document.querySelector('input[placeholder="Exact column name"]')),'label');
    button('Start research').click();
    (await waitFor(()=>button('Approve and continue'))).click();
    await waitFor(()=>document.body.textContent.includes('Synthetic report'));
    if(!document.body.textContent.includes('Synthetic gap') || !document.body.textContent.includes('E001')) throw new Error('Missing report evidence');
    if(JSON.stringify(localStorage).includes('synthetic-key')) throw new Error('Credential stored');
    document.title='REAL HTTP FLOW PASS';
  } catch(error) {document.title='REAL HTTP FLOW FAIL: '+error.message;}
});
