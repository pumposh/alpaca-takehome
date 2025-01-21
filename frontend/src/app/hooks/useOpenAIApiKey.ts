"use client";

import { useEffect, useState } from "react";
import { openDatabase, getSettings } from "@/app/lib/db";

export function useOpenAIApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadApiKey() {
      try {
        const db = await openDatabase();
        const settings = await getSettings(db);
        setApiKey(settings?.openai_api_key || null);
      } catch (error) {
        console.error("Failed to load API key:", error);
        setError("Failed to load API key");
      } finally {
        setLoading(false);
      }
    }
    loadApiKey();
  }, []);

  return { apiKey, loading, error };
} 