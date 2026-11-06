import { QueryClient } from "@tanstack/react-query";

// Um único QueryClient para o app inteiro. Fica num módulo próprio para que
// o AuthContext possa limpar o cache (queryClient.clear()) ao sair da conta,
// sem importar o layout raiz.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});
