"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Text, View } from "react-native";

const ToastCtx = createContext<(msg: string) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 2200);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg ? (
        <View
          pointerEvents="none"
          className="absolute bottom-6 left-0 right-0 z-50 items-center px-6"
        >
          <View className="max-w-[90%] rounded-2xl border border-border bg-surface2 px-[18px] py-[11px]">
            <Text className="font-body text-sm font-bold text-text">{msg}</Text>
          </View>
        </View>
      ) : null}
    </ToastCtx.Provider>
  );
}
