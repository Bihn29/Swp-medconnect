import React from "react";

export const Button = ({
  className = "",
  variant = "default",
  size = "default",
  children,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.default;

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        borderRadius: "0.375rem",
        fontSize: "0.875rem",
        fontWeight: "500",
        transition: "colors 150ms",
        cursor: "pointer",
        border: "none",
        ...(variant === "outline" && {
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          color: "#2d3748",
        }),
        ...(variant === "default" && {
          backgroundColor: "#2b6cb0",
          color: "#ffffff",
        }),
        ...(variant === "ghost" && {
          backgroundColor: "transparent",
          color: "#2d3748",
        }),
        ...(size === "sm" && {
          height: "2.25rem",
          padding: "0 0.75rem",
        }),
        ...(size === "default" && {
          height: "2.5rem",
          padding: "0 1rem",
        }),
        ...(size === "icon" && {
          height: "2.5rem",
          width: "2.5rem",
          padding: "0",
        }),
      }}
      {...props}
    >
      {children}
    </button>
  );
};
