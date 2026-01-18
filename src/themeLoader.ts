import themes from './themes.json';

export type ThemeKey = keyof typeof themes;

export function applyTheme(themeKey: string) {
  const theme = (themes as any)[themeKey] || themes.default;
  const root = document.documentElement;

  // Convert json keys to css Variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value as string);
  });

  // if (themeKey.includes('light')) {
  //   root.style.setProperty('--btn-text', theme.colors.bg);
  // } else {
  //   root.style.setProperty('--btn-text', '#0b0d12');
  // }
}

export function getAvailableThemes() {
  return Object.entries(themes).map(([id, data]) => ({
    id,
    name: data.name
  }));
}
