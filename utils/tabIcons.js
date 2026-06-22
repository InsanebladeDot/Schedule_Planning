import { getIconDataUri } from './icons'

const TAB_ICON_MAP = {
  calendar: 'calendar',
  clock: 'clock',
  user: 'user'
}

function getTabIconColor(active, isDark) {
  if (active) return isDark ? '#E58B88' : '#E58B88'
  return isDark ? '#7A7A6A' : '#A8A896'
}

function getTabIconSrc(name, active, isDark) {
  const iconName = TAB_ICON_MAP[name] || name
  return getIconDataUri(iconName, getTabIconColor(active, isDark), 48)
}

export { getTabIconSrc, getTabIconColor, TAB_ICON_MAP }
