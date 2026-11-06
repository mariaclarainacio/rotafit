import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Appearance } from "react-native";
import { darkTheme, lightTheme } from "./tokens";
import type { ThemeTokens } from "./tokens";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "rotafit.theme-preference";

interface ThemeContextValue {
  theme: ThemeTokens;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Tema salvo no aparelho. Padrão "system": segue o tema do celular até o
// usuário escolher um no Perfil.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system")
          setPreferenceState(saved);
      })
      .catch(() => undefined);
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setSystemScheme(colorScheme),
    );
    return () => sub.remove();
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => undefined);
  };
  const mode =
    preference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : preference;
  const theme = mode === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, preference, setPreference }),
    [theme, preference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return context;
}
