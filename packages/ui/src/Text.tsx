import { Text as RNText, type TextProps } from "react-native";
import { cn } from "./cn";

export interface UITextProps extends TextProps {
  className?: string;
}

/** Body copy (Nunito). */
export function Text({ className, ...rest }: UITextProps) {
  return <RNText className={cn("font-body text-text", className)} {...rest} />;
}

/** Display / heading copy (Fredoka). */
export function Heading({ className, ...rest }: UITextProps) {
  return (
    <RNText
      className={cn("font-head text-text font-bold", className)}
      {...rest}
    />
  );
}

export function Muted({ className, ...rest }: UITextProps) {
  return (
    <RNText
      className={cn("font-body text-text2 font-bold", className)}
      {...rest}
    />
  );
}

export function Subtle({ className, ...rest }: UITextProps) {
  return (
    <RNText
      className={cn("font-body text-text3 font-bold", className)}
      {...rest}
    />
  );
}
