"use client";

import { useEffect, useState } from "react";
import { useApp } from "../provider";

/** Stable per-device user id (resolved async; null until ready). */
export function useUserId(): string | null {
  const { session } = useApp();
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    session.getUserId().then((v) => active && setId(v));
    return () => {
      active = false;
    };
  }, [session]);
  return id;
}
