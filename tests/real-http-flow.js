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
    (await waitFor(()=>document.querySelector('[role="button"]'))).click();
    (await waitFor(()=>button('Sign In'))).click();
    (await waitFor(()=>button('Settings'))).click();
    type(await waitFor(()=>document.querySelector('input[type=password]')),'synthetic-key');
    const provider=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.value==='Google Gemini'));
    provider.value='OpenAlex';provider.dispatchEvent(new Event('change',{bubbles:true}));
    await waitFor(()=>document.querySelector('input[type=password]').value==='');
    type(document.querySelector('input[type=password]'),'synthetic-openalex');
    provider.value='Semantic Scholar';provider.dispatchEvent(new Event('change',{bubbles:true}));
    await waitFor(()=>document.querySelector('input[type=password]').value==='');
    type(document.querySelector('input[type=password]'),'synthetic-semantic');
    provider.value='Google Gemini';provider.dispatchEvent(new Event('change',{bubbles:true}));
    await waitFor(()=>document.querySelector('input[type=password]').value==='synthetic-key');
    const selects=[...document.querySelectorAll('select')];
    const limit=selects.find(s=>[...s.options].some(o=>o.text==='80'));limit.value='20';limit.dispatchEvent(new Event('change',{bubbles:true}));
    type(document.querySelector('input[type=number]'),'3');
    button('Chat').click();
    type(await waitFor(()=>document.querySelector('textarea[aria-label="Research problem"]')),'Synthetic research question');
    button('+ Add data').click();
    const fileInput=await waitFor(()=>document.querySelector('input[type=file]')), transfer=new DataTransfer();
    transfer.items.add(new File(['feature,label\n1,yes\n2,no\n'],'synthetic.csv',{type:'text/csv'}));
    fileInput.files=transfer.files; fileInput.dispatchEvent(new Event('change',{bubbles:true}));
    type(await waitFor(()=>document.querySelector('input[aria-label="Target column"]')),'label');
    button('Start Research').click();
    (await waitFor(()=>button('Resume'))).click();
    if(!document.body.textContent.includes('attempt 3 of 50')) throw new Error('Missing retry progress');
    (await waitFor(()=>button('Approve and continue'))).click();
    await waitFor(()=>document.body.textContent.includes('Synthetic report'));
    if(!document.body.textContent.includes('Synthetic gap') || !document.body.textContent.includes('E001')) throw new Error('Missing report evidence');
    button('History').click();
    (await waitFor(()=>button('View'))).click();
    await waitFor(()=>document.body.textContent.includes('Synthetic report'));
    if(JSON.stringify(localStorage).includes('synthetic-key')) throw new Error('Credential stored');
    document.title='REAL HTTP FLOW PASS';
  } catch(error) {document.title='REAL HTTP FLOW FAIL: '+error.message;}
});
