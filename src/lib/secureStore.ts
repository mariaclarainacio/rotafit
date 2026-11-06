import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// O SecureStore usa o Keychain (iOS) e o Keystore (Android) — não existem no
// navegador. Na web (só usada aqui para testes e prévia), caímos para o
// localStorage, que não tem o mesmo nível de segurança. Em iOS e Android, o
// caminho normal do SecureStore é usado sem alteração.
const isWeb = Platform.OS === "web";

export async function getSecureItem(key: string): Promise<string | null> {
  if (isWeb)
    return typeof localStorage === "undefined"
      ? null
      : localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
