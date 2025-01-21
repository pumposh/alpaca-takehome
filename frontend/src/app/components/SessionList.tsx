"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { openDatabase, getSessions } from "@/app/lib/db";

interface Session {
  id: string;
  date: string;
  patientName: string;
  title?: string;
  createdAt: number;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
}

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const db = await openDatabase();
        const sessionData = await getSessions(db);
        setSessions(sessionData.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">No sessions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={`/session/${session.id}`}
          className="block rounded-lg border border-gray-200 bg-white p-6 hover:border-[#0A958B]/20 hover:bg-[#0A958B]/5 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#0A958B]/40 dark:hover:bg-[#0A958B]/10"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {session.title || session.patientName}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(session.date)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
