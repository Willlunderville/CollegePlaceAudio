/* Shared CPA portal: no polling, credentials in memory, durable local pending edits. */
(function (root) {
  const collections = ['artists', 'notes', 'docs', 'links', 'sources'];
  const copy = value => JSON.parse(JSON.stringify(value));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const fields = item => Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'id'));
  function changes(before, after) {
    const operations = [];
    for (const collection of collections) {
      const previous = new Map((before[collection] || []).map(item => [item.id, item]));
      for (const item of after[collection] || []) {
        const old = previous.get(item.id);
        previous.delete(item.id);
        const values = Object.fromEntries(Object.entries(fields(item)).filter(([field, value]) => !old || !same(old[field], value)));
        if (Object.keys(values).length) operations.push({collection, id: item.id, create: !old, base: old ? Object.fromEntries(Object.keys(values).map(field => [field, old[field]])) : {}, values});
      }
      for (const item of previous.values()) operations.push({collection, id: item.id, base: fields(item), values: {}, delete: true});
    }
    return operations;
  }
  const fromServer = data => Object.fromEntries(collections.map(c => [c, Object.values(data[c] || {})]));
  function replay(data, operations) {
    for (const op of operations) {
      const list = data[op.collection] ||= [];
      const index = list.findIndex(item => item.id === op.id);
      if (op.delete) { if (index >= 0) list.splice(index, 1); }
      else if (index >= 0) Object.assign(list[index], op.values);
      else list.unshift({id: op.id, ...op.values});
    }
    return data;
  }
  class PortalSync {
    constructor({storage, legacyKey, seed, render, status}) {
      Object.assign(this, {storage, legacyKey, seed, render, status});
      this.cacheKey = legacyKey + '-shared-v1';
      this.state = JSON.parse(storage.getItem(this.cacheKey) || 'null');
      this.token = ''; this.busy = false; this.timer = null;
    }
    persist(next) {
      // A quota failure must not discard the last durable pending-edit queue.
      this.storage.setItem(this.cacheKey, JSON.stringify(next)); this.state = next;
    }
    data() { return this.state ? copy(this.state.data) : null; }
    async request(body) {
      if (!this.token) throw new Error('Sign in with Avlen to save shared changes.');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch('https://avlen.io/api/cpa-portal/sync', {
          method: 'POST', credentials: 'omit', headers: {'Content-Type': 'text/plain;charset=UTF-8'},
          body: JSON.stringify({...body, token: this.token}), signal: controller.signal
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Shared saving is unavailable.');
        return result;
      } finally { clearTimeout(timer); }
    }
    async initialize(token) {
      if (typeof window !== 'undefined' && !this.releaseLock) {
        if (!navigator.locks) throw new Error('Please use a current browser for safe shared saving.');
        await new Promise((resolve, reject) => {
          navigator.locks.request('cpa-shared-portal', {ifAvailable: true}, lock => {
            if (!lock) { reject(new Error('The portal is already open in another tab. Close that tab before connecting here.')); return; }
            return new Promise(release => { this.releaseLock = release; resolve(); });
          }).catch(reject);
        });
      }
      // Refresh the cache after acquiring the single-tab lock.
      this.state = JSON.parse(this.storage.getItem(this.cacheKey) || 'null');
      this.token = token;
      // An older tab may still save legacy data after its first migration.
      const snapshot = JSON.parse(this.storage.getItem(this.legacyKey) || 'null') || copy(this.seed);
      const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(snapshot))))].map(byte=>byte.toString(16).padStart(2,'0')).join('');
      if (!this.state?.migrated || this.state.legacyDigest !== digest) {
        if(this.state?.migrated && !await this.flush()) throw new Error('Pending changes are still saving. Please reconnect shortly.');
        const requestId = this.state?.migrationDigest === digest ? this.state.migrationId : crypto.randomUUID();
        this.persist({...this.state, data: this.state?.data || snapshot, outbox: this.state?.outbox || [], conflicts: this.state?.conflicts || [], migrated: false, migrationId: requestId, migrationDigest: digest});
        this.status('Backing up this browser and merging its saved changes…');
        const result = await this.request({action: 'migrate', requestId, snapshot});
        this.persist({data: fromServer(result.data), outbox: [], conflicts: [...(this.state.conflicts || []), ...(result.conflicts || [])], migrated: true, legacyDigest: digest});
      }
      await this.refresh();
    }
    save(data) {
      if (!this.state?.migrated) throw new Error('Connect to shared storage before editing. Your original data is retained.');
      const operations = changes(this.state.data, data);
      if (!operations.length) return;
      this.persist({...this.state, data: copy(data), outbox: [...this.state.outbox, {requestId: crypto.randomUUID(), operations}]});
      this.status('Saving changes…');
      clearTimeout(this.timer); this.timer = setTimeout(() => this.flush().catch(error => this.status(error.message + ' Changes remain saved on this device.')), 300);
    }
    async flush() {
      if (this.busy) return false;
      this.busy = true;
      try {
        while (this.state.outbox.length) {
          const first = this.state.outbox[0];
          const result = await this.request({action: 'save', ...first});
          const remaining = this.state.outbox.slice(1);
          this.persist({...this.state, data: this.state.data,
            outbox: remaining, conflicts: [...this.state.conflicts, ...(result.conflicts || [])]});
        }
        this.status(this.state.conflicts.length ? 'Some edits need review. Both versions have been preserved.' : 'All changes saved.');
        return true;
      } finally { this.busy = false; }
    }
    async refresh() {
      if (!await this.flush()) { this.status('Saving is in progress. Refresh again when it finishes.'); return; }
      const result = await this.request({action: 'load'});
      // Do not overwrite changes typed while the refresh was in flight.
      this.persist({...this.state, data: replay(fromServer(result.data), this.state.outbox.flatMap(item => item.operations))});
      this.render();
      this.status(this.state.outbox.length ? 'Saving changes…' : this.state.conflicts.length ? 'Some edits need review. Both versions have been preserved.' : 'Latest shared information loaded.');
    }
  }
  root.CpaPortalSync = {PortalSync, changes, replay, fromServer};
  if (typeof module !== 'undefined') module.exports = root.CpaPortalSync;
})(typeof window === 'undefined' ? globalThis : window);
