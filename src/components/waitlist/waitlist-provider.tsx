"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";

/**
 * The modal is the heaviest interactive piece on the page and is invisible
 * until someone asks for it, so it's split out of the initial bundle and
 * fetched on first open.
 */
const WaitlistModal = dynamic(
  () => import("./waitlist-modal").then((mod) => mod.WaitlistModal),
  { ssr: false },
);

interface WaitlistContextValue {
  open: boolean;
  /** `source` is recorded so we can see which CTA actually converts. */
  openWaitlist: (source?: string) => void;
  closeWaitlist: () => void;
  source: string | null;
}

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  // Keeps the modal chunk mounted after first use so reopening is instant.
  const [everOpened, setEverOpened] = useState(false);

  const openWaitlist = useCallback((nextSource?: string) => {
    setSource(nextSource ?? null);
    setEverOpened(true);
    setOpen(true);
  }, []);

  const closeWaitlist = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openWaitlist, closeWaitlist, source }),
    [open, openWaitlist, closeWaitlist, source],
  );

  return (
    <WaitlistContext.Provider value={value}>
      {children}
      {everOpened ? <WaitlistModal /> : null}
    </WaitlistContext.Provider>
  );
}

export function useWaitlist(): WaitlistContextValue {
  const context = useContext(WaitlistContext);
  if (!context) {
    throw new Error("useWaitlist must be used inside a WaitlistProvider.");
  }
  return context;
}
