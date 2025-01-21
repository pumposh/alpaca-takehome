"use client";
import Navbar from "./components/Navbar";
import SessionList from "./components/SessionList";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-8 pt-24 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl space-y-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Recent Sessions
          </h2>
          <SessionList />
        </div>
      </main>
    </>
  );
}
