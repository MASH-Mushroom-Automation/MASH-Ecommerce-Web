"use client";

import { Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";
import { useEffect, useState } from "react";

interface SearchTriggerProps {
  className?: string;
  placeholder?: string;
}

export function SearchTrigger({ 
  className, 
  placeholder = "Search products..." 
}: SearchTriggerProps) {
  const { openSearch } = useSearchShortcut();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // Detect if user is on Mac
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <button
      onClick={openSearch}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg bg-background text-muted-foreground hover:bg-muted/50 transition-colors text-left group",
        className
      )}
    >
      <Search className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 text-sm">{placeholder}</span>
      <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono text-muted-foreground group-hover:bg-background">
        {isMac ? (
          <>
            <Command className="h-3 w-3" />
            <span>K</span>
          </>
        ) : (
          <span>Ctrl K</span>
        )}
      </kbd>
    </button>
  );
}

export default SearchTrigger;
