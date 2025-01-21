"use client";
import { useEffect, useRef } from "react";

interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export default function Popover({
  trigger,
  children,
  open,
  onOpenChange,
  className = "",
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onOpenChange]);

  const triggerWithClick = {
    ...trigger,
    props: {
      ...trigger.props,
      onClick: (e: React.MouseEvent) => {
        trigger.props.onClick?.(e);
        onOpenChange(!open);
      },
    },
  };

  return (
    <div className="relative">
      {triggerWithClick}
      {open && (
        <div
          ref={popoverRef}
          className={`absolute right-0 top-full z-50 mt-2 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
