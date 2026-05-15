"use client";

import { useMe } from "@/queries/use-auth";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const meQuery = useMe();

  if (!meQuery.isLoading && !meQuery.data) {
    return null;
  }

  return <>{children}</>;
}
