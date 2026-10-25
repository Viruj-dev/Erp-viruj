import { QueryClient } from "@tanstack/react-query";

export function resourceKey(
  userId: string | undefined,
  orgId: string | undefined,
  resource: string,
  ...params: readonly unknown[]
) {
  return [userId ?? null, orgId ?? null, resource, ...params] as const;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ({ queryKey }) =>
          queryKey[2] === "departments" ||
          queryKey[2] === "directory-catalogues" ||
          queryKey[2] === "/directory/departments"
            ? 5 * 60_000
            : 60_000,
      },
    },
  });
}
