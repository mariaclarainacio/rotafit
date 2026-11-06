# RotaFit

App de corrida com GPS: registra a rota, a distância, o tempo e o ritmo de cada
corrida, com tema claro e escuro e um player do Spotify para tocar música
durante o treino.

## Funcionalidades

- Login com **Google** (Supabase Auth, sem senha própria)
- Corrida com GPS: distância, tempo, ritmo e traçado da rota em tempo real
- Pausar, retomar, finalizar e descartar uma corrida
- Histórico de corridas e resumo de cada uma (com o traçado)
- Estatísticas da semana (distância, tempo, número de corridas)
- **Spotify**: login OAuth (PKCE), tocando agora, tocar/pausar, próxima/anterior
- **Tema claro e escuro**, com persistência: claro em Milano Red + Lemon
  Chiffon, escuro inspirado no Flamengo
- Interface em **Liquid Glass**: superfícies translúcidas com blur, brilho e
  borda, no app inteiro
## Tecnologias

React Native · Expo · Expo Router · TypeScript · Supabase (Auth com Google,
Postgres, RLS) · TanStack Query · expo-location · expo-auth-session (Spotify) ·
expo-blur / expo-linear-gradient (Liquid Glass) · react-native-svg (traçado da
rota) · Jest · PGlite (testes do banco)

## Como executar

1. Instale as dependências: `npm install`
2. Crie um projeto no [Supabase](https://supabase.com) e execute
   `supabase/schema.sql` no SQL Editor.
3. Em **Authentication → Providers → Google**, ative o provedor Google (veja o
   guia para o passo a passo, gratuito, no Google Cloud Console).
4. Crie um app em [developer.spotify.com](https://developer.spotify.com) para
   obter o Client ID (gratuito).
5. Copie `.env.example` para `.env` e preencha os três valores.
6. Inicie o app: `npx expo start` e abra no Expo Go (iOS ou Android — este
   projeto não roda no navegador, por causa do GPS).

## Sem custo, de ponta a ponta

Nenhuma etapa deste projeto exige cartão de crédito: login pelo Google, banco
Supabase, Spotify e o traçado da rota (desenhado à mão em SVG, sem mapa pago)
usam apenas os planos gratuitos de cada serviço.

## Testes

| Comando            | O que testa                                              |
| ------------------ | -------------------------------------------------------- |
| `npm test`         | Tudo: app (Jest) e banco (PGlite)                        |
| `npm run test:app` | Cálculos de rota/ritmo e a máquina de estados da corrida |
| `npm run test:db`  | RLS, permissões e a função `weekly_stats`                |

O teste do banco usa o PGlite (Postgres real dentro do Node), com o mesmo
`schema.sql` do Supabase, sem Docker.

## Arquitetura

```
app/         rotas (Expo Router)
src/
  components/  interface, incluindo os componentes "glass/" (Liquid Glass)
  context/     sessão (Google), tema e Spotify
  hooks/       corridas, player do Spotify e o rastreador de GPS
  lib/         Supabase, login Google e Spotify
  services/    acesso ao Supabase
  theme/       tokens de cor (claro/escuro) e o ThemeProvider
  utils/       geolocalização, máquina de estados da corrida — cobertos por testes
supabase/
  schema.sql   banco, RLS e a função weekly_stats
  tests/       testes do banco
```

## Autores

- GitHub: https://github.com/mariaclarainacio/rotafit.git
- GitHub: https://github.com/TheuznX
