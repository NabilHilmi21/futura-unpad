"use client";

import { useQuery } from "@tanstack/react-query";

import {
  authSessionSchema,
  type AuthSession,
} from "@/lib/api/auth-session";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";

type UseAuthSessionQueryOptions = {
  initialData?: AuthSession;
};

export function useAuthSessionQuery({
  initialData,
}: UseAuthSessionQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => fetchJson("/api/auth/session", authSessionSchema),
    initialData,
    staleTime: 30_000,
  });
}
