// Joins class names, skipping falsy values: cn(styles.row, active && styles.active, className).
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
