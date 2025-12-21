'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  expiryHours?: number;
}

interface StoredValue<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    expiryHours,
  } = options;

  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }

      const parsed: StoredValue<T> = deserializer(item);

      // Check if expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          const storageValue: StoredValue<T> = {
            value: valueToStore,
            timestamp: Date.now(),
            expiresAt: expiryHours ? Date.now() + expiryHours * 60 * 60 * 1000 : undefined,
          };
          window.localStorage.setItem(key, serializer(storageValue));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue, expiryHours]
  );

  // Clear value from localStorage
  const clearValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error clearing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
}

// Hook to check if there's saved data in localStorage
export function useHasSavedData(key: string): boolean {
  const [hasSavedData, setHasSavedData] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        setHasSavedData(false);
        return;
      }

      const parsed = JSON.parse(item);

      // Check if expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(key);
        setHasSavedData(false);
        return;
      }

      setHasSavedData(true);
    } catch {
      setHasSavedData(false);
    }
  }, [key]);

  return hasSavedData;
}
