import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button className={`shared-button shared-button-${variant} ${className}`.trim()} {...props} />
  );
}
