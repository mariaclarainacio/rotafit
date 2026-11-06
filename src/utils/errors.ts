// Transforma qualquer erro (Error, erro do Supabase, rede) numa mensagem em português
// que dá para mostrar na tela.
export function friendlyError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : "";

  if (!message) return "Algo deu errado. Tente novamente.";
  if (/network request failed|failed to fetch/i.test(message)) {
    return "Sem conexão. Verifique sua internet e tente de novo.";
  }
  return message;
}
