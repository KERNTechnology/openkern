import type { ThemeName, ThemeComponents } from './types'
import { components as minimal } from './minimal'
import { components as bold } from './bold'
import { components as corporate } from './corporate'

const themes: Record<ThemeName, ThemeComponents> = {
  minimal,
  bold,
  corporate,
}

export function getThemeComponents(name: ThemeName): ThemeComponents {
  return themes[name] ?? themes.minimal
}

export function isValidTheme(name: string | undefined | null): name is ThemeName {
  return name === 'minimal' || name === 'bold' || name === 'corporate'
}

export type { ThemeName, ThemeComponents }
