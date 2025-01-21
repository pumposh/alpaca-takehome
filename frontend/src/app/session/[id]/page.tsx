"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, KeyboardEvent, useRef } from "react";
import {
  openDatabase,
  getSession,
  addNote,
  updateNote,
  deleteNote,
  getNotes,
} from "@/app/lib/db";
import OptimizedNotes from "@/app/components/OptimizedNotes";

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

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));
}

export default function SessionPage() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const db = await openDatabase();
        const sessionData = await getSession(db, id as string);
        setSession(sessionData);
        const sessionNotes = await getNotes(db, id as string);
        setNotes(sessionNotes.sort((a, b) => a.timestamp - b.timestamp));
      } catch (error) {
        console.error("Failed to load session:", error);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    }

    loadSession();
  }, [id]);

  useEffect(() => {
    if (editingNoteId) {
      editInputRef.current?.focus();
    }
  }, [editingNoteId]);

  // Update global keyboard handler to handle note deletion
  useEffect(() => {
    async function handleGlobalKeyDown(e: globalThis.KeyboardEvent) {
      if (document.activeElement?.tagName === "INPUT") return;

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        if (notes.length === 0) return;

        if (!selectedNoteId) {
          // Always select the most recent note first
          setSelectedNoteId(notes[notes.length - 1].id);
          return;
        }

        const currentIndex = notes.findIndex(
          (note) => note.id === selectedNoteId
        );
        if (currentIndex === -1) return;

        if (e.key === "ArrowUp" && currentIndex > 0) {
          setSelectedNoteId(notes[currentIndex - 1].id);
        } else if (e.key === "ArrowDown" && currentIndex < notes.length - 1) {
          setSelectedNoteId(notes[currentIndex + 1].id);
        }
      } else if (e.key === "e" && selectedNoteId && !editingNoteId) {
        e.preventDefault();
        setEditingNoteId(selectedNoteId);
      } else if (
        (e.key === "Backspace" || e.key === "Delete") &&
        selectedNoteId &&
        !editingNoteId
      ) {
        e.preventDefault();
        try {
          const db = await openDatabase();
          await deleteNote(db, selectedNoteId);
          setNotes((prev) => prev.filter((note) => note.id !== selectedNoteId));
          setSelectedNoteId(null);
          inputRef.current?.focus();
        } catch (error) {
          console.error("Failed to delete note:", error);
        }
      }
    }

    function handleKeyDown(e: globalThis.KeyboardEvent) {
      handleGlobalKeyDown(e).catch((error) => {
        console.error("Error in keyboard handler:", error);
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [notes, selectedNoteId, editingNoteId]);

  const scrollToBottom = () => {
    if (notesContainerRef.current) {
      const container = notesContainerRef.current;
      // Add a small delay to ensure the new note is rendered
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (currentNote.trim()) {
        try {
          const db = await openDatabase();
          const newNote: Note = {
            id: crypto.randomUUID(),
            sessionId: id as string,
            text: currentNote.trim(),
            timestamp: Date.now(),
          };
          await addNote(db, newNote);
          setNotes((prev) => [...prev, newNote]);
          setCurrentNote("");
          scrollToBottom();
        } catch (error) {
          console.error("Failed to add note:", error);
        }
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (notes.length === 0) return;

      // Blur the input when starting navigation
      inputRef.current?.blur();

      // Always select the most recent note first
      if (!selectedNoteId) {
        setSelectedNoteId(notes[notes.length - 1].id);
        return;
      }

      const currentIndex = notes.findIndex(
        (note) => note.id === selectedNoteId
      );
      if (currentIndex === -1) return;

      if (e.key === "ArrowUp" && currentIndex > 0) {
        setSelectedNoteId(notes[currentIndex - 1].id);
      } else if (e.key === "ArrowDown" && currentIndex < notes.length - 1) {
        setSelectedNoteId(notes[currentIndex + 1].id);
      }
    } else if (e.key === "e" && selectedNoteId && !editingNoteId) {
      e.preventDefault();
      setEditingNoteId(selectedNoteId);
    }
  };

  const handleEditKeyDown = async (
    e: KeyboardEvent<HTMLInputElement>,
    note: Note
  ) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const newText = (e.target as HTMLInputElement).value.trim();
      if (newText) {
        try {
          const db = await openDatabase();
          const updatedNote = { ...note, text: newText };
          await updateNote(db, updatedNote);
          setNotes((prev) =>
            prev.map((n) => (n.id === note.id ? updatedNote : n))
          );
        } catch (error) {
          console.error("Failed to update note:", error);
        }
      }
      setEditingNoteId(null);
      inputRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingNoteId(null);
      inputRef.current?.focus();
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 pt-24">
        <div className="text-gray-600">Loading session...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 pt-24">
        <div className="text-gray-600">Session not found</div>
      </main>
    );
  }

  return (
    <main className="h-screen pt-20">
      <div className="mx-auto h-full max-w-4xl p-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">
            {session.title || session.patientName}
          </h1>
          <p className="mt-2 text-gray-600">{formatDate(session.date)}</p>
        </div>

        {notes.length > 0 && (
          <OptimizedNotes notes={notes} sessionId={id as string} />
        )}

        <div className="mt-8 flex h-[calc(100vh-24rem)] flex-col rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div ref={notesContainerRef} className="flex-1 overflow-y-auto p-6">
            {notes.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mb-4 h-12 w-12 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
                  No notes yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start typing below and press Enter or Tab to add your first
                  note
                </p>
              </div>
            ) : (
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  Session Notes
                </h3>
                <ul className="space-y-2">
                  {notes.map((note) => (
                    <li
                      key={note.id}
                      className={`flex items-start rounded px-2 py-1 ${
                        selectedNoteId === note.id
                          ? "bg-[#0A958B]/10 dark:bg-[#0A958B]/20"
                          : ""
                      }`}
                    >
                      <div className="flex-1">
                        {editingNoteId === note.id ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            defaultValue={note.text}
                            onKeyDown={(e) => handleEditKeyDown(e, note)}
                            className="w-full rounded border-none bg-transparent p-0 focus:ring-0"
                          />
                        ) : (
                          <span className="text-gray-700 dark:text-gray-200">
                            {note.text}
                          </span>
                        )}
                        <span className="ml-2 text-xs text-gray-400">
                          {formatTime(note.timestamp)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-end gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  ↑
                </kbd>
                <span>/</span>
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  ↓
                </kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Delete
                </kbd>
                <span>to remove</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Enter
                </kbd>
                <span>or</span>
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Tab
                </kbd>
                <span>to add note</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  ⌘
                </kbd>
                <span>+</span>
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Enter
                </kbd>
                <span>to optimize</span>
              </span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setSelectedNoteId(null)}
              placeholder="Type a note and press Enter or Tab to commit"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:border-[#0A958B] focus:ring-1 focus:ring-[#0A958B] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-[#0A958B] dark:focus:ring-[#0A958B]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
