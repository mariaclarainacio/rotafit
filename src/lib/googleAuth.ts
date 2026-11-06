import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

// Lê os parâmetros do link de volta: os tokens chegam no fragmento ("#...") e os
// erros na query ("?..."). Feito à mão porque o expo-auth-session mais novo não
// expõe mais o módulo "build/QueryParams".
function getUrlParams(url: string): {
  params: Record<string, string>;
  errorCode: string | null;
} {
  const params: Record<string, string> = {};
  const [beforeHash, hash = ""] = url.split("#");
  const query = beforeHash.split("?")[1] ?? "";
  [query, hash].forEach((part) => {
    new URLSearchParams(part).forEach((value, key) => {
      params[key] = value;
    });
  });
  return { params, errorCode: params.error_code ?? params.error ?? null };
}

// Link de volta para o app depois do login. Usamos o expo-linking (e não o
// expo-auth-session) para o app abrir mesmo se o módulo nativo ExpoCrypto faltar.
export const authRedirectUri = Linking.createURL("");

// Login com Google, delegado ao próprio Supabase: o app nunca vê um client
// secret do Google. O Supabase (configurado em Authentication → Providers →
// Google, com as chaves do Google Cloud) devolve uma URL de login; abrimos
// essa URL numa aba controlada (WebBrowser) e, ao voltar para o app pelo
// esquema "rotafit://", extraímos os tokens da própria URL de retorno.
export async function signInWithGoogle(): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: authRedirectUri, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url)
    throw new Error("Não foi possível iniciar o login com o Google.");

  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    authRedirectUri,
  );
  if (result.type !== "success" || !result.url) {
    if (result.type === "cancel" || result.type === "dismiss") return; // usuário cancelou
    throw new Error("O login com o Google não foi concluído.");
  }

  const { params, errorCode } = getUrlParams(result.url);
  if (errorCode) throw new Error(params.error_description ?? errorCode);

  const { access_token: accessToken, refresh_token: refreshToken } = params;
  if (!accessToken || !refreshToken)
    throw new Error("O Google não devolveu uma sessão válida.");

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) throw sessionError;
}
