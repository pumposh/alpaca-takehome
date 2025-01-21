interface Session {
  id: string;
  date: string;
  patientName: string;
  title?: string;
  createdAt: number;
}

interface Note {
  id: string;
  sessionId: string;
  text: string;
  timestamp: number;
}

interface OptimizedNote {
  id: string;
  sessionId: string;
  content: string;
  timestamp: number;
}

interface Settings {
  id: string;
  openai_api_key?: string;
  updatedAt: number;
}

const DB_NAME = 'aba-sessions-db';
const STORES = {
  sessions: 'sessions',
  patients: 'patients',
  notes: 'notes',
  settings: 'settings',
  optimizedNotes: 'optimizedNotes'
} as const;
const DB_VERSION = 6;

export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORES.sessions)) {
        db.createObjectStore(STORES.sessions, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.patients)) {
        const patientStore = db.createObjectStore(STORES.patients, { keyPath: 'id' });
        patientStore.createIndex('name', 'name', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.notes)) {
        const notesStore = db.createObjectStore(STORES.notes, { keyPath: 'id' });
        notesStore.createIndex('sessionId', 'sessionId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.optimizedNotes)) {
        const optimizedNotesStore = db.createObjectStore(STORES.optimizedNotes, { keyPath: 'id' });
        optimizedNotesStore.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };
  });
}

export async function addSession(db: IDBDatabase, session: Session): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.sessions, 'readwrite');
    const store = transaction.objectStore(STORES.sessions);
    const request = store.add(session);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSessions(db: IDBDatabase): Promise<Session[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.sessions, 'readonly');
    const store = transaction.objectStore(STORES.sessions);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getSession(db: IDBDatabase, id: string): Promise<Session | null> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.sessions, 'readonly');
    const store = transaction.objectStore(STORES.sessions);
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function addNote(db: IDBDatabase, note: Note): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.notes, 'readwrite');
    const store = transaction.objectStore(STORES.notes);
    const request = store.add(note);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function updateNote(db: IDBDatabase, note: Note): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.notes, 'readwrite');
    const store = transaction.objectStore(STORES.notes);
    const request = store.put(note);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteNote(db: IDBDatabase, noteId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.notes, 'readwrite');
    const store = transaction.objectStore(STORES.notes);
    const request = store.delete(noteId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getNotes(db: IDBDatabase, sessionId: string): Promise<Note[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.notes, 'readonly');
    const store = transaction.objectStore(STORES.notes);
    const index = store.index('sessionId');
    const request = index.getAll(sessionId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveSettings(db: IDBDatabase, settings: Settings): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.settings, 'readwrite');
    const store = transaction.objectStore(STORES.settings);
    const request = store.put(settings);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSettings(db: IDBDatabase): Promise<Settings | null> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.settings, 'readonly');
    const store = transaction.objectStore(STORES.settings);
    const request = store.get('default');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function saveOptimizedNote(db: IDBDatabase, optimizedNote: OptimizedNote): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.optimizedNotes, 'readwrite');
    const store = transaction.objectStore(STORES.optimizedNotes);
    const index = store.index('sessionId');
    
    // First try to find an existing note for this session
    const request = index.get(optimizedNote.sessionId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const existingNote = request.result;
      if (existingNote) {
        // Update existing note with new content but keep same ID
        store.put({ ...optimizedNote, id: existingNote.id });
      } else {
        // Add new note
        store.add(optimizedNote);
      }
      resolve();
    };
  });
}

export async function getOptimizedNote(db: IDBDatabase, sessionId: string): Promise<OptimizedNote | null> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.optimizedNotes, 'readonly');
    const store = transaction.objectStore(STORES.optimizedNotes);
    const index = store.index('sessionId');
    const request = index.get(sessionId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
} 