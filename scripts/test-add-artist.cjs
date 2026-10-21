const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('script.js','utf8');
const add=source.slice(source.indexOf('function addArtist()'),source.indexOf('function addDiscoverySource()'));
for(const filter of ['approved','rejected','discuss','all','needs-approval']) {
 test(`Add artist leaves ${filter} and targets only the new entry`,()=>{
  const original={id:'existing',name:'Existing artist',willNotes:'Keep this'};
  const data={artists:[original]};let focused=false,selected=false,scrolled=false;
  const input={focus:()=>focused=true,select:()=>selected=true};
  const ctx={crypto:{randomUUID:()=> 'new-artist'},Date,activeDiscoveryFilter:filter,portalSearchInput:{value:'Existing'},expandedArtistIds:new Set(),getPortalData:()=>data,savePortalData:()=>{},renderDiscovery:()=>{
   assert.equal(ctx.activeDiscoveryFilter,'needs-approval');assert.equal(ctx.portalSearchInput.value,'');
  },document:{querySelector:selector=>{
   assert.equal(selector,'[data-artist-card][data-id="new-artist"]');
   return {scrollIntoView:()=>scrolled=true,querySelector:()=>input};
  }}};
  vm.runInNewContext(add+';addArtist();',ctx);
  assert.equal(data.artists[0].id,'new-artist');assert.deepEqual(data.artists[1],original);
  assert.equal(ctx.expandedArtistIds.has('new-artist'),true);assert.ok(focused&&selected&&scrolled);
 });
}
