const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
function fixture(approved=true){
 const handlers={},messages=[],popup={postMessage:(v,origin)=>messages.push({v,origin})},status={},button={dataset:{addToCrm:'artist-1'},parentElement:{querySelector:()=>status}};
 const data={artists:[{id:'artist-1',name:'Test',approved}]};let saved=0;
 const context=vm.createContext({document:{addEventListener:(k,fn)=>handlers[k]=fn},window:{open:()=>popup,addEventListener:(k,fn)=>handlers[k]=fn},crypto:{randomUUID:()=> '12345678-1234-1234-1234-123456789012'},getPortalData:()=>data,overallApproval:a=>a.approved?'Approved':'Pending',savePortalData:()=>saved++,renderDiscovery:()=>{},setInterval:()=>1,setTimeout:()=>2,clearInterval(){},clearTimeout(){},Map,Number,String});
 const src=fs.readFileSync('script.js','utf8');vm.runInContext(src.slice(src.indexOf('const crmTransfers = new Map();')).split('// Shared storage is separate')[0],context);
 handlers.click({target:{closest:()=>button}});
 return {handlers,popup,messages,data,button,status,saved:()=>saved};
}
test('unapproved artists cannot transfer',()=>{const f=fixture(false);assert.equal(f.button.disabled,undefined)});
test('only bound CRM window and nonce can receive data or confirm a transfer',()=>{
 const f=fixture(),nonce='12345678-1234-1234-1234-123456789012';
 const ready={source:f.popup,origin:'https://avlen.io',data:{type:'cpa-crm-ready',nonce}};
 f.handlers.message({...ready,origin:'https://evil.invalid'});f.handlers.message({...ready,source:{}});assert.equal(f.messages.length,0);
 f.handlers.message(ready);assert.equal(f.messages.length,1);
 const result={source:f.popup,origin:'https://avlen.io',data:{nonce,type:'cpa-crm-result',artistId:'artist-1',record:{kind:'contacts',id:42},message:'Linked'}};
 f.handlers.message({...result,data:{...result.data,artistId:'other'}});assert.equal(f.saved(),0);
 f.handlers.message(result);assert.equal(f.saved(),1);assert.equal(f.data.artists[0].inCrm,'yes');assert.equal(f.data.artists[0].crmRecord.id,42);
});
