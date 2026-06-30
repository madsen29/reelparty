"use client";

import type { ReactNode } from "react";
import { AppProvider } from "@reelparty/app";
import { webStore } from "../lib/store";
import { webBridge } from "../lib/bridge";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider apiUrl={apiUrl} store={webStore} bridge={webBridge}>
      {children}
    </AppProvider>
  );
}
