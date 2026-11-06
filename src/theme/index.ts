// Compatibilidade: componentes antigos importavam cores fixas daqui. Agora as
// cores vêm do tema ativo via useTheme(); isto fica só para espaçamento e raio.
export { spacing, radius } from "./tokens";
export type { ThemeTokens } from "./tokens";
export { useTheme, ThemeProvider } from "./ThemeContext";
export type { ThemePreference } from "./ThemeContext";
