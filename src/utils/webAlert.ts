import { Alert, Platform } from "react-native";
import type { AlertButton } from "react-native";

// No navegador, o Alert.alert do React Native não faz nada. Aqui ele passa a
// usar as janelas nativas do navegador (confirm/alert). No celular, nada muda.
if (Platform.OS === "web") {
  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = [title, message].filter(Boolean).join("\n\n");
    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    const cancel = buttons.find((b) => b.style === "cancel");
    const confirm =
      buttons.find((b) => b.style !== "cancel") ?? buttons[buttons.length - 1];
    if (window.confirm(text)) confirm.onPress?.();
    else cancel?.onPress?.();
  };
}
