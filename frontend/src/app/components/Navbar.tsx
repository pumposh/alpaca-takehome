"use client";
import { useRef, useState } from "react";
import Popover from "@/app/components/Popover";
import NewSessionForm, { NewSessionFormHandle } from "./NewSessionForm";
import SettingsPopover from "./SettingsPopover";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const formRef = useRef<NewSessionFormHandle>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="ABA Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-semibold">ABA Session Notes</span>
        </Link>

        <div className="flex items-center gap-2">
          <Popover
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={
              <button className="flex items-center gap-2 rounded-md bg-[#0A958B] px-4 py-2 text-white hover:bg-[#0A958B]/90 focus:outline-none focus:ring-2 focus:ring-[#0A958B] focus:ring-offset-2 disabled:opacity-50 dark:hover:bg-[#0A958B]/80 dark:focus:ring-offset-gray-900">
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
                New session
              </button>
            }
            className="w-[400px]"
          >
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Create new session
              </h2>
              <NewSessionForm ref={formRef} />
            </div>
          </Popover>
          <SettingsPopover />
        </div>
      </div>
    </nav>
  );
}
