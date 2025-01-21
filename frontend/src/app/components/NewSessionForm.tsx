"use client";
import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { openDatabase, addSession } from "../lib/db";

interface Session {
  id: string;
  date: string;
  patientName: string;
  title?: string;
  createdAt: number;
}

export interface NewSessionFormHandle {
  focusPatientName: () => void;
}

function getLocalISODate(date: Date = new Date()) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

const NewSessionForm = forwardRef<NewSessionFormHandle>((_, ref) => {
  const router = useRouter();
  const patientNameRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    date: getLocalISODate(),
    patientName: "",
    title: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useImperativeHandle(ref, () => ({
    focusPatientName: () => {
      patientNameRef.current?.focus();
    },
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const db = await openDatabase();

      // Create the session
      const sessionId = crypto.randomUUID();
      const session: Session = {
        id: sessionId,
        ...formData,
        createdAt: Date.now(),
      };

      await addSession(db, session);
      setFormData({ ...formData, patientName: "", title: "" });
      router.push(`/session/${sessionId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      // TODO: Add error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </div>

      <div>
        <label
          htmlFor="patientName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Patient Name
        </label>
        <input
          type="text"
          id="patientName"
          ref={patientNameRef}
          required
          value={formData.patientName}
          onChange={(e) =>
            setFormData({ ...formData, patientName: e.target.value })
          }
          placeholder="Enter patient name"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </div>

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Title (Optional)
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !formData.patientName}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        {isSubmitting ? "Creating session..." : "Create new session"}
      </button>
    </form>
  );
});

NewSessionForm.displayName = "NewSessionForm";

export default NewSessionForm;
