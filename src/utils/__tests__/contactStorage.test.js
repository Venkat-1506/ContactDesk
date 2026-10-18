import { describe, it, expect, beforeEach, vi } from 'vitest';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(String(k), String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    get length() {
      return map.size;
    },
    key: (i) => Array.from(map.keys())[i] ?? null,
    _map: map
  };
}

async function loadStorage() {
  vi.resetModules();
  return import('../contactStorage');
}

beforeEach(() => {
  globalThis.localStorage = createMemoryStorage();
});

describe('workspace isolation', () => {
  it('personal workspace starts empty (no auto-seeded samples)', async () => {
    const store = await loadStorage();
    expect(store.getWorkspaceMode()).toBe('personal');
    expect(store.getContacts()).toEqual([]);
  });

  it('demo workspace seeds the sample dataset on first access', async () => {
    const store = await loadStorage();
    store.setWorkspaceMode('demo');
    const demoContacts = store.getContacts();
    expect(demoContacts.length).toBeGreaterThan(50);
    expect(store.getActivityLogs().length).toBeGreaterThan(0);
  });

  it('personal and demo stores never overwrite each other', async () => {
    const store = await loadStorage();

    store.setWorkspaceMode('personal');
    store.addContact({ name: 'Personal Pat', category: 'Work' });
    expect(store.getContacts().length).toBe(1);

    store.setWorkspaceMode('demo');
    const demoCount = store.getContacts().length;
    expect(demoCount).toBeGreaterThan(50);

    store.setWorkspaceMode('personal');
    const personal = store.getContacts();
    expect(personal.length).toBe(1);
    expect(personal[0].name).toBe('Personal Pat');
  });

  it('clearAllContacts only clears the active workspace', async () => {
    const store = await loadStorage();

    store.setWorkspaceMode('personal');
    store.addContact({ name: 'Only Mine', category: 'Family' });

    store.setWorkspaceMode('demo');
    const demoCount = store.getContacts().length;

    store.setWorkspaceMode('personal');
    store.clearAllContacts();
    expect(store.getContacts()).toEqual([]);

    store.setWorkspaceMode('demo');
    expect(store.getContacts().length).toBe(demoCount);
  });

  it('resetDemoData restores the demo dataset without touching personal', async () => {
    const store = await loadStorage();

    store.setWorkspaceMode('personal');
    store.addContact({ name: 'Keeper', category: 'Work' });

    store.setWorkspaceMode('demo');
    const original = store.getContacts().length;
    store.deleteContact(store.getContacts()[0].id);
    expect(store.getContacts().length).toBe(original - 1);

    store.resetDemoData();
    expect(store.getContacts().length).toBe(original);

    store.setWorkspaceMode('personal');
    expect(store.getContacts().length).toBe(1);
    expect(store.getContacts()[0].name).toBe('Keeper');
  });
});

describe('legacy migration', () => {
  it('migrates legacy contactdesk_contacts into the personal workspace', async () => {
    localStorage.setItem(
      'contactdesk_contacts',
      JSON.stringify([{ id: 'legacy1', name: 'Legacy Lin', category: 'College' }])
    );
    localStorage.setItem('contactdesk_activity_logs', JSON.stringify([{ id: 'l1', type: 'ADDED' }]));
    localStorage.setItem('contactdesk_onboarded', 'true');

    const store = await loadStorage();
    const contacts = store.getContacts();

    expect(contacts.length).toBe(1);
    expect(contacts[0].name).toBe('Legacy Lin');
    expect(store.getActivityLogs().length).toBe(1);
    expect(localStorage.getItem('contactdesk_contacts')).toBeNull();
  });
});

describe('CRUD + normalization', () => {
  it('normalizes invalid timestamps to a valid ISO string', async () => {
    const store = await loadStorage();
    const contact = store.normalizeContact({
      name: 'Bad Dates',
      createdAt: '2026-008-08T10:00:00.000Z',
      updatedAt: 'not-a-date',
      lastContactedAt: '2026-001-09T10:00:00.000Z'
    });
    expect(Number.isNaN(new Date(contact.createdAt).getTime())).toBe(false);
    expect(Number.isNaN(new Date(contact.updatedAt).getTime())).toBe(false);
    expect(contact.lastContactedAt).toBeNull();
  });

  it('add, update, delete round-trip', async () => {
    const store = await loadStorage();
    const added = store.addContact({ name: 'Round Trip', category: 'Work', phone: '123' });
    expect(store.getContactById(added.id).name).toBe('Round Trip');

    store.updateContact(added.id, { name: 'Updated Name' });
    expect(store.getContactById(added.id).name).toBe('Updated Name');
    expect(store.getActivityLogs().some((l) => l.type === 'UPDATED')).toBe(true);

    store.deleteContact(added.id);
    expect(store.getContactById(added.id)).toBeNull();
  });

  it('toggleFavorite flips close/favorite in sync', async () => {
    const store = await loadStorage();
    const added = store.addContact({ name: 'Toggle Me', category: 'Personal' });
    expect(store.toggleFavorite(added.id)).toBe(true);
    let loaded = store.getContactById(added.id);
    expect(loaded.close).toBe(true);
    expect(loaded.favorite).toBe(true);

    expect(store.toggleFavorite(added.id)).toBe(false);
    loaded = store.getContactById(added.id);
    expect(loaded.close).toBe(false);
  });

  it('logInteraction updates lastContactedAt and writes an activity entry', async () => {
    const store = await loadStorage();
    const added = store.addContact({ name: 'Caller', category: 'Work' });
    store.logInteraction(added.id, { type: 'Email', note: 'Intro call' });

    const loaded = store.getContactById(added.id);
    expect(loaded.interactions.length).toBe(1);
    expect(loaded.interactions[0].type).toBe('Email');
    expect(loaded.lastContactedAt).toBeTruthy();
    expect(store.getActivityLogs().some((l) => l.description.includes('Emailed'))).toBe(true);
  });
});

describe('import / export', () => {
  it('merge mode keeps existing contacts and regenerates duplicate IDs', async () => {
    const store = await loadStorage();
    const a = store.addContact({ name: 'Existing', category: 'Work' });

    const backup = JSON.stringify([{ id: a.id, name: 'Incoming Duplicate' }]);
    const result = store.importContactsJSON(backup, 'merge');

    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    const contacts = store.getContacts();
    expect(contacts.length).toBe(2);
    const names = contacts.map((c) => c.name);
    expect(names).toContain('Existing');
    expect(names).toContain('Incoming Duplicate');
  });

  it('replace mode clears the workspace first', async () => {
    const store = await loadStorage();
    store.addContact({ name: 'Old Timer', category: 'Work' });

    const result = store.importContactsJSON(JSON.stringify([{ name: 'Fresh Start' }]), 'replace');
    expect(result.success).toBe(true);
    const contacts = store.getContacts();
    expect(contacts.length).toBe(1);
    expect(contacts[0].name).toBe('Fresh Start');
  });

  it('rejects invalid payloads', async () => {
    const store = await loadStorage();
    expect(store.importContactsJSON('not json', 'merge').success).toBe(false);
    expect(store.importContactsJSON('{"foo":1}', 'merge').success).toBe(false);
  });

  it('export produces a re-importable payload', async () => {
    const store = await loadStorage();
    store.addContact({ name: 'Exported', category: 'Family' });
    const json = store.exportContactsJSON();
    const parsed = JSON.parse(json);
    expect(parsed.app).toBe('people-atlas');
    expect(parsed.contacts.length).toBe(1);

    store.clearAllContacts();
    const result = store.importContactsJSON(json, 'replace');
    expect(result.success).toBe(true);
    expect(store.getContacts()[0].name).toBe('Exported');
  });
});
