"use client";

import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@reelparty/ui";

export function Input({ className, ...rest }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      placeholderTextColor="#6b6b7b"
      className={cn(
        "w-full rounded-btn border-[3px] border-border bg-surface px-4 py-3.5 font-body text-lg font-bold text-text",
        className,
      )}
      {...rest}
    />
  );
}

/** Big centered 5-digit code input. */
export function CodeInput({ className, ...rest }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      placeholderTextColor="#6b6b7b"
      keyboardType="number-pad"
      maxLength={5}
      className={cn(
        "w-full rounded-btn border-[3px] border-blue bg-surface px-4 py-3.5 text-center font-head text-3xl font-bold tracking-[12px] text-blueDk",
        className,
      )}
      {...rest}
    />
  );
}
