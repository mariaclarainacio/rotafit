// Paletas do RotaFit. "light" usa Milano Red + Lemon Chiffon; "dark" é inspirado
// no Flamengo (rubro-negro). Os dois alimentam o estilo Liquid Glass: cada
// superfície de vidro é a cor "glass" com transparência, mais um brilho no topo.
export interface ThemeTokens {
  mode: "light" | "dark";
  background: string;
  backgroundAlt: string;
  surface: string;
  glass: string; // cor de base do vidro (recebe opacidade no componente)
  glassBorder: string;
  glassHighlight: string; // brilho no topo do vidro
  text: string;
  muted: string;
  primary: string; // Milano Red nos dois temas
  primarySoft: string;
  secondary: string; // Lemon Chiffon (claro) / vermelho vivo (escuro)
  onPrimary: string;
  border: string;
  success: string;
  danger: string;
  statusBar: "dark" | "light";
}

export const lightTheme: ThemeTokens = {
  mode: "light",
  background: "#FFFACD", // Lemon Chiffon
  backgroundAlt: "#FFF6B8",
  surface: "#FFFDF2",
  glass: "#FFFFFF",
  glassBorder: "rgba(184, 17, 4, 0.22)",
  glassHighlight: "rgba(255, 255, 255, 0.75)",
  text: "#3A0A03",
  muted: "#8A5A3B",
  primary: "#B81104", // Milano Red
  primarySoft: "#F6D9CF",
  secondary: "#FFFACD",
  onPrimary: "#FFFDF2",
  border: "rgba(184, 17, 4, 0.16)",
  success: "#1E7D32",
  danger: "#B81104",
  statusBar: "dark",
};

export const darkTheme: ThemeTokens = {
  mode: "dark",
  background: "#0B0B0D", // preto Flamengo
  backgroundAlt: "#151013",
  surface: "#1A1114",
  glass: "#1E1418",
  glassBorder: "rgba(230, 20, 30, 0.35)",
  glassHighlight: "rgba(255, 255, 255, 0.10)",
  text: "#F5EDEE",
  muted: "#B08C90",
  primary: "#E6141E", // vermelho Flamengo
  primarySoft: "rgba(230, 20, 30, 0.18)",
  secondary: "#111111",
  onPrimary: "#FFFFFF",
  border: "rgba(255, 255, 255, 0.10)",
  success: "#34D399",
  danger: "#FF4D5E",
  statusBar: "light",
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };
