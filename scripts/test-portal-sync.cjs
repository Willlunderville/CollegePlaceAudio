const {test}=require('node:test');const assert=require('node:assert/strict');
const {PortalSync,changes,replay}=require('../portal-sync.js');
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
test('only changed fields are sent, including intentional empty values',()=>{
 const before={artists:[{id:'a',name:'A',willNotes:'old',brettVote:'Pending'}]};
 const after={artists:[{id:'a',name:'A',willNotes:'',brettVote:'Pending'}]};
 assert.deepEqual(changes(before,after)[0].values,{willNotes:''});
});
test('migration preserves original browser storage and failures do not mark it migrated',async()=>{
 const storage=memory();const original=JSON.stringify({artists:[{id:'a',name:'Mine'}]});storage.setItem('old',original);
 const sync=new PortalSync({storage,legacyKey:'old',seed:{},render(){},status(){}});
 sync.request=async()=>{throw new Error('offline')};
 await assert.rejects(()=>sync.initialize('token'),/offline/);
 assert.equal(storage.getItem('old'),original);assert.equal(sync.state.migrated,false);
});
test('unsent changes survive reopening and refresh does not erase edits made in flight',async()=>{
 const storage=memory();const sync=new PortalSync({storage,legacyKey:'old',seed:{},render(){},status(){}});
 sync.persist({migrated:true,data:{artists:[{id:'a',name:'A'}]},outbox:[],conflicts:[]});
 sync.save({artists:[{id:'a',name:'B'}]});clearTimeout(sync.timer);
 const reopened=new PortalSync({storage,legacyKey:'old',seed:{},render(){},status(){}});
 assert.equal(reopened.state.outbox.length,1);
 reopened.request=async body=>({data:{artists:{a:{id:'a',name:'B'}}},conflicts:[]});
 await reopened.flush();assert.equal(reopened.state.outbox.length,0);
 let release;reopened.request=()=>new Promise(resolve=>release=resolve);
 const refresh=reopened.refresh();await Promise.resolve();
 reopened.save({artists:[{id:'a',name:'C'}]});clearTimeout(reopened.timer);
 release({data:{artists:{a:{id:'a',name:'B'}}}});await refresh;
 assert.equal(reopened.data().artists[0].name,'C');assert.equal(reopened.state.outbox.length,1);
});
test('local storage quota failure does not remove pending work',()=>{
 const storage=memory();const sync=new PortalSync({storage,legacyKey:'old',seed:{},render(){},status(){}});
 sync.persist({migrated:true,data:{artists:[{id:'a',name:'A'}]},outbox:[],conflicts:[]});
 storage.setItem=()=>{throw new Error('quota')};
 assert.throws(()=>sync.save({artists:[{id:'a',name:'B'}]}),/quota/);
 assert.equal(sync.state.data.artists[0].name,'A');
});
