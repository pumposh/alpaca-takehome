"use client";

import { useState, useEffect } from "react";
import { openDatabase, getSettings } from "@/app/lib/db";

interface OptimizedNotesProps {
  notes: Array<{ text: string; timestamp: number }>;
}

export default function OptimizedNotes({ notes }: OptimizedNotesProps) {
  const [optimizedText, setOptimizedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function optimizeNotes() {
      try {
        setLoading(true);
        setError(null);

        // Get OpenAI API key
        const db = await openDatabase();
        const settings = await getSettings(db);
        const apiKey = settings?.openai_api_key;

        if (!apiKey) {
          setError("OpenAI API key not found");
          return;
        }

        // Prepare notes for optimization
        const notesText = notes.map((note) => note.text).join("\n");

        // Call optimization endpoint
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
      } catch (err) {
        console.error("Failed to optimize notes:", err);
        setError("Failed to optimize notes");
      } finally {
        setLoading(false);
      }
    }

    if (notes.length > 0) {
      optimizeNotes();
    }
  }, [notes]);

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

  return (
    <div className="mt-8 space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        Optimized Summary
      </h2>
      <div className="prose prose-gray max-w-none dark:prose-invert">
        {optimizedText}
      </div>
    </div>
  );
}
