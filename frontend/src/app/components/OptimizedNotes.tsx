"use client";

import { useState, useEffect } from "react";
import {
  openDatabase,
  getSettings,
  saveOptimizedNote,
  getOptimizedNote,
} from "@/app/lib/db";

interface OptimizedNotesProps {
  notes: Array<{ text: string; timestamp: number }>;
  sessionId: string;
}

export default function OptimizedNotes({
  notes,
  sessionId,
}: OptimizedNotesProps) {
  const [optimizedText, setOptimizedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function optimizeNotes() {
    try {
      setLoading(true);
      setError(null);

      const db = await openDatabase();
      const settings = await getSettings(db);
      const apiKey = settings?.openai_api_key;

      if (!apiKey) {
        setError("OpenAI API key not found");
        return;
      }

      const notesText = notes.map((note) => note.text).join("\n");

      const response = await fetch("http://localhost:8000/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ notes: notesText }),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize notes");
      }

      const data = await response.json();
      setOptimizedText(data.optimized);

      // Save to IndexedDB
      await saveOptimizedNote(db, {
        id: crypto.randomUUID(),
        sessionId,
        content: data.optimized,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("Failed to optimize notes:", err);
      setError("Failed to optimize notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadOptimizedNote() {
      try {
        const db = await openDatabase();
        const optimizedNote = await getOptimizedNote(db, sessionId);
        if (optimizedNote) {
          setOptimizedText(optimizedNote.content);
          return;
        }
      } catch (err) {
        console.error("Failed to load optimized note:", err);
      }
    }

    if (notes.length > 0) {
      loadOptimizedNote().then(() => {
        if (!optimizedText) {
          optimizeNotes();
        }
      });
    }
  }, [notes, sessionId]);

  // Add keyboard shortcut handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Check for Cmd/Ctrl + Enter
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!loading && notes.length > 0) {
          optimizeNotes();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [notes, loading]);

  if (loading) {
    return (
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <svg
            className="h-5 w-5 animate-spin text-[#0A958B]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Optimizing notes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!optimizedText) {
    return null;
  }

  // Parse the sections from the optimized text
  /**
   * example responses:
   * "Session Summary:\n\n- Client displayed signs of emotional distress during the session.\n\nKey Observations and Interventions:\n\n- John presented with a low mood and appeared upset.\n- No intervention was applied during this session due to lack of detailed information.\n\nProgress Made:\n\n- Progress cannot be accurately evaluated from this session due to insufficient information.\n\nChallenges Encountered:\n\n- The primary challenge encountered was John's displayed emotional distress.\n\nRecommendations:\n\n- It's recommended to implement strategies to help John express his feelings effectively in future sessions.\n- More detailed notes are needed to provide an accurate evaluation and to effectively strategize for future sessions."
   * "- Behaviors Observed:\n  - Displayed signs of sadness\n\n- Interventions Used:\n  - None indicated in the session notes\n\n- Progress Made:\n  - Not applicable due to insufficient data\n\n- Challenges Encountered:\n  - Client's emotional state of sadness\n\n- Recommendations:\n  - More detailed notes needed for future sessions to identify specific behaviors, interventions used, and progress made. \n  - Implement supportive and comforting strategies to help client manage his emotions\n  - Consider exploring potential triggers of sadness for John in future sessions to better understand and address his emotional state."
   * "- Behaviors observed:\n  - John displayed a low mood during the session.\n\n- Interventions used:\n  - No specific intervention was employed due to the lack of detailed information.\n\n- Progress made:\n  - Unable to evaluate progress due to insufficient information.\n\n- Challenges encountered:\n  - John's sadness made it difficult to engage him in the session.\n\n- Recommendations:\n  - Explore possible triggers to John's sadness.\n  - Implement mood-boosting activities in future sessions.\n  - Further evaluation may be necessary to understand the underlying cause of John's sadness."
   *
   */
  const sections = optimizedText.split("\n\n").reduce((acc, section) => {
    const [title, ...items] = section.split("\n");
    const cleanTitle = title?.replace(":", "").trim();
    if (cleanTitle && !cleanTitle.startsWith("Important")) {
      acc[cleanTitle] = items
        .filter((item) => item.trim().startsWith("-"))
        .map((item) => item.trim().substring(1).trim());
    }
    return acc;
  }, {} as Record<string, string[]>);
  console.log(sections);

  return (
    <div className="mt-8 space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="relative mb-2">
        <div className="absolute -right-1 -top-1 flex items-center gap-1">
          <span className="text-xs text-gray-500">⌘⏎</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-[#0A958B]"
          >
            <path
              fillRule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div className="space-y-6">
        {Object.keys(sections).map((sectionTitle) => {
          const items = sections[sectionTitle] || ["None noted"];
          return (
            <div key={sectionTitle} className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {sectionTitle.replaceAll("-", "")}
              </h3>
              <ul className="list-inside space-y-1.5">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0A958B]" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
