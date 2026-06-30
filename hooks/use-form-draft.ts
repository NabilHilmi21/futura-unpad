"use client";

import { useEffect, useMemo, useRef } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type UseFormDraftOptions<TValues extends FieldValues> = {
  form: UseFormReturn<TValues>;
  storageKey: string;
  omitFields?: readonly FieldPath<TValues>[];
};

const EMPTY_OMITTED_FIELDS: readonly string[] = [];

function isBrowserFileValue(value: unknown) {
  return (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob) ||
    (typeof FileList !== "undefined" && value instanceof FileList)
  );
}

function sanitizeDraftValue(
  value: unknown,
  omittedFields: Set<string>,
  path = ""
): unknown {
  if (omittedFields.has(path) || isBrowserFileValue(value)) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) =>
      sanitizeDraftValue(
        item,
        omittedFields,
        path ? `${path}.${index}` : String(index)
      )
    );
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, nestedValue]) => {
          const nextPath = path ? `${path}.${key}` : key;

          return [
            key,
            sanitizeDraftValue(nestedValue, omittedFields, nextPath),
          ] as const;
        })
        .filter(([, nestedValue]) => nestedValue !== undefined)
    );
  }

  return value;
}

export function useFormDraft<TValues extends FieldValues>({
  form,
  storageKey,
  omitFields = EMPTY_OMITTED_FIELDS as readonly FieldPath<TValues>[],
}: UseFormDraftOptions<TValues>) {
  const hasLoadedDraft = useRef(false);
  const omittedFields = useMemo(() => new Set<string>(omitFields), [omitFields]);

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(storageKey);

      if (rawDraft) {
        const draft = JSON.parse(rawDraft) as Partial<TValues>;
        form.reset({ ...form.getValues(), ...draft } as TValues);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      hasLoadedDraft.current = true;
    }
  }, [form, storageKey]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!hasLoadedDraft.current) {
        return;
      }

      try {
        const draft = sanitizeDraftValue(values, omittedFields);
        window.localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        // Ignore storage quota or unavailable storage errors.
      }
    });

    return () => subscription.unsubscribe();
  }, [form, omittedFields, storageKey]);
}

export function clearFormDraft(storageKey: string) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore unavailable storage errors.
  }
}
