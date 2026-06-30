import { type ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "./cn";

export interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

/** Surface card with the signature 2px border + 4px bottom border. */
export function Card({ children, className, style, ...rest }: CardProps) {
  return (
    <View
      className={cn("rounded-card border-2 border-border bg-surface2", className)}
      style={[{ borderBottomWidth: 4 }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
