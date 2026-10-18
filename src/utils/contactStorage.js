import { initialContacts } from '../data/initialContacts';

const WORKSPACE_KEY = 'peopleatlas.workspace.v1';
const CONTACTS_KEYS = {
  personal: 'peopleatlas.contacts.v1.personal',
  demo: 'peopleatlas.contacts.v1.demo'
};
const ACTIVITY_KEYS = {
  personal: 'peopleatlas.activity.v1.personal',
  demo: 'peopleatlas.activity.v1.demo'
};
const ONBOARDED_KEYS = {
  personal: 'peopleatlas.onboarded.v1.personal',
  demo: 'peopleatlas.onboarded.v1.demo'
};

const LEGACY_KEYS = {
  contacts: 'contactdesk_contacts',
  activity: 'contactdesk_activity_logs',
  onboarded: 'contactdesk_onboarded'
};

let migrationRan = false;

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function toValidISO(value, fallback = null) {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
}

/**
 * Normalizes a contact object to ensure all required fields exist safely.
 * Invalid timestamps (e.g. "2026-008-08") are coerced to a safe value.
 */
export function normalizeContact(contact) {
  if (!contact || typeof contact !== 'object') return null;
  const now = new Date().toISOString();

  let links = [];
  if (Array.isArray(contact.professionalLinks)) {
    links = contact.professionalLinks
      .filter((l) => l && typeof l === 'object')
      .map((l) => ({
        type: l.type || 'Other',
        label: l.label || l.type || 'Link',
        url: l.url || ''
      }))
      .filter((l) => l.url);
  } else {
    if (contact.linkedin) links.push({ type: 'LinkedIn', label: 'LinkedIn', url: contact.linkedin });
    if (contact.instagram) links.push({ type: 'Instagram', label: 'Instagram', url: contact.instagram });
    if (contact.github) links.push({ type: 'GitHub', label: 'GitHub', url: contact.github });
    if (contact.portfolio) links.push({ type: 'Portfolio', label: 'Portfolio', url: contact.portfolio });
  }

  let interactions = Array.isArray(contact.interactions)
    ? contact.interactions
        .filter((i) => i && typeof i === 'object')
        .map((i) => ({
          id: i.id || genId(),
          type: i.type || 'Phone Call',
          date: toValidISO(i.date, now),
          note: i.note || ''
        }))
    : [];

  interactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  const isClose = Boolean(contact.close ?? contact.favorite);
  const cityVal = contact.city || contact.location || '';
  const notesVal = contact.notes || contact.context || '';

  return {
    id: contact.id || genId(),
    name: contact.name ? String(contact.name).trim() : 'Unnamed Person',
    phone: contact.phone ? String(contact.phone).trim() : '',
    email: contact.email ? String(contact.email).trim() : '',
    category: contact.category || 'Other',
    relationship: contact.relationship || contact.category || 'Other',
    organization: contact.organization || '',
    city: cityVal,
    location: cityVal,
    professionalTitle: contact.professionalTitle || contact.role || '',
    professionalLinks: links,
    close: isClose,
    favorite: isClose,
    context: notesVal,
    notes: notesVal,
    interactions: interactions,
    createdAt: toValidISO(contact.createdAt, now),
    updatedAt: toValidISO(contact.updatedAt, now),
    lastContactedAt: toValidISO(contact.lastContactedAt, interactions.length > 0 ? interactions[0].date : null)
  };
}

/**
 * One-time migration of legacy contactdesk_* keys into the personal workspace.
 */
function migrateLegacyData() {
  if (migrationRan) return;
  migrationRan = true;
  try {
    if (localStorage.getItem(CONTACTS_KEYS.personal) !== null) return;
    const legacy = localStorage.getItem(LEGACY_KEYS.contacts);
    if (legacy === null) return;

    const parsed = JSON.parse(legacy);
    const normalized = Array.isArray(parsed) ? parsed.map(normalizeContact).filter(Boolean) : [];
    localStorage.setItem(CONTACTS_KEYS.personal, JSON.stringify(normalized));

    const legacyActivity = localStorage.getItem(LEGACY_KEYS.activity);
    if (legacyActivity) {
      localStorage.setItem(ACTIVITY_KEYS.personal, legacyActivity);
    }
    const legacyOnboarded = localStorage.getItem(LEGACY_KEYS.onboarded);
    if (legacyOnboarded === 'true') {
      localStorage.setItem(ONBOARDED_KEYS.personal, 'true');
    }

    localStorage.removeItem(LEGACY_KEYS.contacts);
    localStorage.removeItem(LEGACY_KEYS.activity);
    localStorage.removeItem(LEGACY_KEYS.onboarded);
  } catch (error) {
    console.error('Legacy data migration failed:', error);
  }
}

/* ---------------- Workspace Mode ---------------- */

export function getWorkspaceMode() {
  try {
    return localStorage.getItem(WORKSPACE_KEY) === 'demo' ? 'demo' : 'personal';
  } catch {
    return 'personal';
  }
}

export function setWorkspaceMode(mode) {
  try {
    localStorage.setItem(WORKSPACE_KEY, mode === 'demo' ? 'demo' : 'personal');
  } catch (error) {
    console.error('Failed to set workspace mode:', error);
  }
}

/* ---------------- Internal key-based IO ---------------- */

function readContactsRaw(mode) {
  try {
    const data = localStorage.getItem(CONTACTS_KEYS[mode]);
    return data === null ? null : JSON.parse(data);
  } catch {
    return null;
  }
}

function writeContactsRaw(mode, contacts) {
  try {
    localStorage.setItem(CONTACTS_KEYS[mode], JSON.stringify(contacts));
    return true;
  } catch (error) {
    console.error('Failed to save contacts to localStorage:', error);
    return false;
  }
}

function readLogsRaw(mode) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEYS[mode]);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLogsRaw(mode, logs) {
  try {
    localStorage.setItem(ACTIVITY_KEYS[mode], JSON.stringify(logs));
    return true;
  } catch (error) {
    console.error('Failed to save activity logs:', error);
    return false;
  }
}

function buildSampleLogs(contacts) {
  const sampleLogs = [];
  contacts.slice(0, 15).forEach((c) => {
    if (c.interactions && c.interactions.length > 0) {
      c.interactions.forEach((intr) => {
        sampleLogs.push({
          id: 'act_' + intr.id,
          type: 'INTERACTION',
          interactionType: intr.type,
          contactId: c.id,
          contactName: c.name,
          relationship: c.relationship,
          description: `${intr.type} with ${c.name}${intr.note ? ` - "${intr.note}"` : ''}`,
          timestamp: intr.date
        });
      });
    }
    if (c.lastContactedAt && c.interactions.length === 0) {
      sampleLogs.push({
        id: 'act_cnt_' + c.id,
        type: 'INTERACTION',
        interactionType: 'Phone Call',
        contactId: c.id,
        contactName: c.name,
        relationship: c.relationship,
        description: `Contacted ${c.name}`,
        timestamp: c.lastContactedAt
      });
    }
    sampleLogs.push({
      id: 'act_add_' + c.id,
      type: 'ADDED',
      contactId: c.id,
      contactName: c.name,
      relationship: c.relationship,
      description: `Added ${c.name} to People Atlas`,
      timestamp: c.createdAt
    });
  });
  return sampleLogs;
}

function seedDemoStore() {
  const normalized = initialContacts.map(normalizeContact).filter(Boolean);
  writeContactsRaw('demo', normalized);
  writeLogsRaw('demo', buildSampleLogs(normalized));
  try {
    localStorage.setItem(ONBOARDED_KEYS.demo, 'true');
  } catch {
    /* ignore */
  }
  return normalized;
}

/* ---------------- Sample / empty workspace ---------------- */

/**
 * Loads the original sample dataset into the DEMO workspace only.
 * Never touches personal data.
 */
export function loadSampleContacts() {
  return seedDemoStore();
}

/**
 * Re-seeds the demo workspace with the original sample dataset + activity logs.
 */
export function resetDemoData() {
  return seedDemoStore();
}

/**
 * Switches into demo mode, seeding the demo store if empty.
 */
export function switchToDemo() {
  migrateLegacyData();
  setWorkspaceMode('demo');
  const existing = readContactsRaw('demo');
  if (!Array.isArray(existing) || existing.length === 0) {
    return seedDemoStore();
  }
  return existing.map(normalizeContact).filter(Boolean);
}

/**
 * Switches back to the personal workspace.
 */
export function switchToPersonal() {
  migrateLegacyData();
  setWorkspaceMode('personal');
  return getContacts();
}

/**
 * Empties the currently active workspace.
 */
export function startEmptyContacts() {
  const mode = getWorkspaceMode();
  writeContactsRaw(mode, []);
  writeLogsRaw(mode, []);
  try {
    localStorage.setItem(ONBOARDED_KEYS[mode], 'true');
  } catch {
    /* ignore */
  }
  return [];
}

/* ---------------- Onboarding state (per workspace) ---------------- */

export function isOnboarded() {
  try {
    const mode = getWorkspaceMode();
    return localStorage.getItem(ONBOARDED_KEYS[mode]) === 'true';
  } catch {
    return false;
  }
}

export function setOnboarded(status = true) {
  try {
    const mode = getWorkspaceMode();
    if (status) {
      localStorage.setItem(ONBOARDED_KEYS[mode], 'true');
    } else {
      localStorage.removeItem(ONBOARDED_KEYS[mode]);
    }
  } catch (error) {
    console.error('Failed to set onboarding state:', error);
  }
}

/* ---------------- Contacts API (dispatches to active workspace) ---------------- */

/**
 * Gets contacts for the active workspace. Personal starts empty —
 * demo mode auto-seeds the sample dataset when the demo store is blank.
 */
export function getContacts() {
  migrateLegacyData();
  const mode = getWorkspaceMode();
  const parsed = readContactsRaw(mode);
  if (parsed === null) {
    return mode === 'demo' ? seedDemoStore() : [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeContact).filter(Boolean);
}

export function saveContacts(contacts) {
  return writeContactsRaw(getWorkspaceMode(), contacts);
}

export function getActivityLogs() {
  migrateLegacyData();
  return readLogsRaw(getWorkspaceMode());
}

export function saveActivityLogs(logs) {
  return writeLogsRaw(getWorkspaceMode(), logs);
}

export function recordActivity({ type, interactionType, contactId, contactName, relationship, description, timestamp }) {
  const currentLogs = getActivityLogs();
  const newEntry = {
    id: 'act_' + genId(),
    type: type || 'INTERACTION',
    interactionType: interactionType || 'Phone Call',
    contactId,
    contactName,
    relationship: relationship || '',
    description,
    timestamp: timestamp || new Date().toISOString()
  };
  saveActivityLogs([newEntry, ...currentLogs]);
  return newEntry;
}

export function addContact(contactData) {
  const contacts = getContacts();
  const now = new Date().toISOString();

  const newContact = normalizeContact({
    ...contactData,
    createdAt: now,
    updatedAt: now
  });

  saveContacts([newContact, ...contacts]);
  setOnboarded(true);

  recordActivity({
    type: 'ADDED',
    contactId: newContact.id,
    contactName: newContact.name,
    relationship: newContact.relationship,
    description: `Added ${newContact.name} to People Atlas`,
    timestamp: now
  });

  return newContact;
}

export function updateContact(id, updatedFields) {
  const contacts = getContacts();
  let updatedContact = null;
  const now = new Date().toISOString();

  const updatedList = contacts.map((contact) => {
    if (contact.id === id) {
      updatedContact = normalizeContact({
        ...contact,
        ...updatedFields,
        updatedAt: now
      });
      return updatedContact;
    }
    return contact;
  });

  saveContacts(updatedList);

  if (updatedContact) {
    recordActivity({
      type: 'UPDATED',
      contactId: updatedContact.id,
      contactName: updatedContact.name,
      relationship: updatedContact.relationship,
      description: `Updated ${updatedContact.name}'s profile`,
      timestamp: now
    });
  }

  return updatedContact;
}

export function logInteraction(contactId, { type = 'Phone Call', date = new Date().toISOString(), note = '' }) {
  const contacts = getContacts();
  let updatedContact = null;

  const safeDate = toValidISO(date, new Date().toISOString());

  const interactionObj = {
    id: genId(),
    type: type,
    date: safeDate,
    note: note
  };

  const updatedList = contacts.map((contact) => {
    if (contact.id === contactId) {
      const existingInteractions = Array.isArray(contact.interactions) ? contact.interactions : [];
      updatedContact = normalizeContact({
        ...contact,
        lastContactedAt: safeDate,
        updatedAt: new Date().toISOString(),
        interactions: [interactionObj, ...existingInteractions]
      });
      return updatedContact;
    }
    return contact;
  });

  saveContacts(updatedList);

  if (updatedContact) {
    const actionDesc = type === 'Phone Call' ? `Called ${updatedContact.name}` : type === 'Email' ? `Emailed ${updatedContact.name}` : `${type} with ${updatedContact.name}`;
    recordActivity({
      type: 'INTERACTION',
      interactionType: type,
      contactId: updatedContact.id,
      contactName: updatedContact.name,
      relationship: updatedContact.relationship,
      description: note ? `${actionDesc} - "${note}"` : actionDesc,
      timestamp: safeDate
    });
  }

  return updatedContact;
}

export function markAsContacted(id, note = '') {
  return logInteraction(id, { type: 'Phone Call', date: new Date().toISOString(), note: note || 'Quick follow-up' });
}

export function deleteContact(id) {
  const contacts = getContacts();
  const target = contacts.find((c) => c.id === id);
  const filtered = contacts.filter((c) => c.id !== id);
  saveContacts(filtered);
  if (target) {
    recordActivity({
      type: 'DELETED',
      contactId: target.id,
      contactName: target.name,
      relationship: target.relationship,
      description: `Removed ${target.name} from your atlas`,
      timestamp: new Date().toISOString()
    });
  }
  return filtered;
}

export function toggleFavorite(id) {
  const contacts = getContacts();
  let toggledState = false;
  let targetContact = null;
  const now = new Date().toISOString();

  const updatedList = contacts.map((c) => {
    if (c.id === id) {
      toggledState = !c.close;
      targetContact = {
        ...c,
        close: toggledState,
        favorite: toggledState,
        updatedAt: now
      };
      return targetContact;
    }
    return c;
  });

  saveContacts(updatedList);

  if (targetContact) {
    recordActivity({
      type: 'TOGGLE_CLOSE',
      contactId: targetContact.id,
      contactName: targetContact.name,
      relationship: targetContact.relationship,
      description: toggledState ? `Added ${targetContact.name} to Close` : `Removed ${targetContact.name} from Close`,
      timestamp: now
    });
  }

  return toggledState;
}

export function toggleCloseContact(id) {
  return toggleFavorite(id);
}

export function getContactById(id) {
  const contact = getContacts().find((c) => c.id === id);
  return contact ? normalizeContact(contact) : null;
}

/* ---------------- Export / Import ---------------- */

export function exportContactsJSON() {
  const contacts = getContacts();
  const activityLogs = getActivityLogs();
  return JSON.stringify(
    {
      app: 'people-atlas',
      version: 1,
      workspace: getWorkspaceMode(),
      exportedAt: new Date().toISOString(),
      contacts,
      activityLogs
    },
    null,
    2
  );
}

/**
 * Imports contacts from a JSON backup.
 * mode: 'merge' keeps existing contacts and appends new ones;
 * mode: 'replace' clears the active workspace first.
 * Duplicate IDs are regenerated so no record is silently dropped.
 */
export function importContactsJSON(jsonString, mode = 'merge') {
  try {
    const parsed = JSON.parse(jsonString);
    const contactsArray = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.contacts)
        ? parsed.contacts
        : null;

    if (!contactsArray) {
      throw new Error('Invalid file format. Backup must contain a list of contacts.');
    }

    const existingContacts = mode === 'replace' ? [] : getContacts();
    const existingIds = new Set(existingContacts.map((c) => c.id));

    let importedCount = 0;
    const mergedList = [...existingContacts];

    contactsArray.forEach((item) => {
      if (item && typeof item === 'object' && item.name) {
        let uniqueId = item.id;
        if (!uniqueId || existingIds.has(uniqueId)) {
          uniqueId = genId();
        }
        mergedList.push(normalizeContact({ ...item, id: uniqueId }));
        existingIds.add(uniqueId);
        importedCount++;
      }
    });

    const saved = saveContacts(mergedList);
    if (!saved) {
      return { success: false, error: 'Could not save imported data. Browser storage may be full.' };
    }

    if (Array.isArray(parsed?.activityLogs)) {
      const existingLogs = mode === 'replace' ? [] : getActivityLogs();
      saveActivityLogs([...parsed.activityLogs, ...existingLogs]);
    }

    setOnboarded(true);
    return { success: true, count: importedCount, mode };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to parse backup JSON file.' };
  }
}

/* ---------------- Clear workspace ---------------- */

/**
 * Clears contacts + activity for the ACTIVE workspace only.
 * Personal and demo stores stay isolated from each other.
 */
export function clearAllContacts() {
  const mode = getWorkspaceMode();
  try {
    localStorage.removeItem(CONTACTS_KEYS[mode]);
    localStorage.removeItem(ONBOARDED_KEYS[mode]);
    localStorage.removeItem(ACTIVITY_KEYS[mode]);
    return true;
  } catch (error) {
    console.error('Failed to clear contacts:', error);
    return false;
  }
}
