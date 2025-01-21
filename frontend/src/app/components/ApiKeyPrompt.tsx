"use client";

import { useState } from "react";
import { openDatabase, saveSettings } from "@/app/lib/db";

export default function ApiKeyPrompt() {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!apiKey.trim().startsWith("sk-")) {
      setError("Invalid API key format. It should start with 'sk-'");
      return;
    }

    setIsSaving(true);
    try {
      const db = await openDatabase();
      await saveSettings(db, {
        id: "default",
        openai_api_key: apiKey.trim(),
        updatedAt: Date.now(),
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to save API key:", error);
      setError("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to ABA Session Notes
          </h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            To get started, please enter your OpenAI API key. This is required
            for AI-powered features.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              OpenAI API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 shadow-sm focus:border-[#0A958B] focus:ring-1 focus:ring-[#0A958B] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your API key will be stored locally and never sent to our servers
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="w-full rounded-md bg-[#0A958B] px-4 py-2 text-white hover:bg-[#0A958B]/90 focus:outline-none focus:ring-2 focus:ring-[#0A958B] focus:ring-offset-2 disabled:opacity-50 dark:hover:bg-[#0A958B]/80 dark:focus:ring-offset-gray-900"
          >
            {isSaving ? "Saving..." : "Save and Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
