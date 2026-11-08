export const config = {
  appName: 'KumpelApp',
  appDescription: 'Die ultimative Fan-App für den FC Erzgebirge Aue',
  theme: {
    primary: '#5C2D91',
    primaryDark: '#3E1F66',
    primaryLight: '#7C3FBF',
    background: '#0F0A14',
    surface: '#1A1325',
    border: '#2D1F45',
    foreground: '#F5F3FF',
    win: '#2E7D5B',
    draw: '#9C8A33',
    loss: '#A33A48',
  },
} as const

export type Theme = typeof config.theme