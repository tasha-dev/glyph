"use client";

import { ChildrenOnlyProps } from "@/type/component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function ReactQueryProvider({ children }: ChildrenOnlyProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
