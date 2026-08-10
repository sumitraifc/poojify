import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Global Button — change styles once in index.css (.btn / .btn-primary ...)
 * and every button across the app updates.
 *
 * variant: "primary" | "outline" | "ghost" | "danger"
 * size: "sm" | "md" | "lg"
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  className = "",
  ...props
}) {
  const variantClass = {
    primary: "btn-primary",
    outline: "btn-outline",
    ghost: "btn-ghost",
    danger: "btn-danger",
  }[variant];

  const sizeClass = { sm: "btn-sm", md: "", lg: "btn-lg" }[size];

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(variantClass, sizeClass, fullWidth && "w-full", className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="h-4 w-4" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="h-4 w-4" />}
        </>
      )}
    </motion.button>
  );
}
