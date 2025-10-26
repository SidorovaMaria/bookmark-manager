/**
 * Debounces a value and returns the debounced result.
 *
 * This React hook returns a version of `value` that only updates after it has
 * remained unchanged for the specified `delay` (in milliseconds). Useful for
 * reducing the frequency of expensive operations (e.g., API calls, heavy
 * computations) in response to rapidly changing values such as user input.
 *
 * The hook sets a timeout whenever `value` or `delay` changes and clears the
 * timeout if either changes again before the timeout completes. The timeout is
 * also cleared when the component using the hook unmounts.
 *
 * @template T - The type of the value being debounced.
 * @param value - The input value to debounce.
 * @param delay - Delay in milliseconds to wait after the last change before updating the debounced value.
 * @returns The debounced value which reflects `value` only after it has remained stable for `delay` milliseconds.
 *
 * @remarks
 * - If `delay` is 0, the debounced value updates immediately.
 * - If `delay` changes while a timeout is pending, the previous timeout is cleared and a new one is scheduled using the new delay.
 *
 * @example
 * const searchTerm = useDebounce(inputValue, 300);
 * useEffect(() => {
 *   // Trigger search only when searchTerm updates (i.e., 300ms after the user stops typing)
 *   fetchResults(searchTerm);
 * }, [searchTerm]);
 */
import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};
