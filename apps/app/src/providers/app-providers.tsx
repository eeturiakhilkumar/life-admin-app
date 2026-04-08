import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./auth-provider";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: PropsWithChildren) => (
  <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  </SafeAreaProvider>
);
