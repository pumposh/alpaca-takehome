"use client";

import Navbar from "@/app/components/Navbar";
import ServerStatus from "@/app/components/ServerStatus";
import ApiKeyPrompt from "@/app/components/ApiKeyPrompt";
import { useOpenAIApiKey } from "@/app/hooks/useOpenAIApiKey";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { apiKey, loading } = useOpenAIApiKey();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!apiKey) {
    return <ApiKeyPrompt />;
  }

  return (
    <>
      <Navbar />
      <ServerStatus />
      {children}
    </>
  );
}
