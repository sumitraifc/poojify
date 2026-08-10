// Tiny classnames combiner — avoids pulling in a dependency for this
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
