import { reactive } from 'vue'
import { getStorage, setStorage, STORAGE_KEYS } from './storage'

const THEME_KEY = 'dark_mode'

/** 全局唯一主题状态 */
const themeState = reactive({
  darkMode: false
})

/** 已应用到全局 chrome 的模式，避免重复 API 调用 */
let appliedChromeMode = null

const LIGHT = {
  bg: '#D5E0C1',
  card: '#FFFFFF',
  text: '#5A5A48',
  textSecondary: '#8A8A78',
  textMuted: '#A8A896',
  accent: '#E58B88',
  accentSoft: '#F5D9B9',
  inputBg: '#F1F5E9',
  border: '#E8E8DC',
  shadow: '0 4rpx 24rpx rgba(90, 90, 72, 0.08)',
  navBg: '#D5E0C1',
  navFront: '#5A5A48',
  tabBg: '#FFFFFF',
  tabColor: '#A8A896',
  tabSelected: '#E58B88'
}

const DARK = {
  bg: '#2A2E24',
  card: '#363B30',
  text: '#E8E6DC',
  textSecondary: '#A8A896',
  textMuted: '#7A7A6A',
  accent: '#E58B88',
  accentSoft: '#8A7358',
  inputBg: '#3A4034',
  border: '#4A5044',
  shadow: '0 4rpx 24rpx rgba(0, 0, 0, 0.35)',
  navBg: '#2A2E24',
  navFront: '#E8E6DC',
  tabBg: '#363B30',
  tabColor: '#7A7A6A',
  tabSelected: '#E58B88'
}

function getPalette(enabled) {
  return enabled ? DARK : LIGHT
}

function getModeKey(enabled) {
  return enabled ? 'dark' : 'light'
}

function loadDarkMode() {
  const fromLegacy = getStorage(THEME_KEY, null)
  if (fromLegacy !== null && fromLegacy !== '') {
    return !!fromLegacy
  }
  const settings = getStorage(STORAGE_KEYS.SETTINGS, {})
  return !!settings.darkMode
}

function saveDarkMode(enabled) {
  setStorage(THEME_KEY, enabled)
}

function applyThemeVars(palette, enabled) {
  const vars = {
    '--theme-bg': palette.bg,
    '--theme-card': palette.card,
    '--theme-text': palette.text,
    '--theme-text-secondary': palette.textSecondary,
    '--theme-text-muted': palette.textMuted,
    '--theme-accent': palette.accent,
    '--theme-accent-soft': palette.accentSoft,
    '--theme-input-bg': palette.inputBg,
    '--theme-border': palette.border,
    '--theme-shadow': palette.shadow
  }

  // #ifdef H5
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    root.classList.toggle('theme-dark', enabled)
    root.style.colorScheme = enabled ? 'dark' : 'light'
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
    root.style.backgroundColor = palette.bg
    document.body.style.backgroundColor = palette.bg
    const pageBody = document.querySelector('uni-page-body')
    if (pageBody) pageBody.style.backgroundColor = palette.bg
  }
  // #endif

  return vars
}

function setNavigationBar(palette, animate) {
  try {
    uni.setNavigationBarColor({
      frontColor: palette.navFront === '#E8E6DC' ? '#ffffff' : '#000000',
      backgroundColor: palette.navBg,
      animation: animate
        ? { duration: 200, timingFunc: 'easeIn' }
        : { duration: 0, timingFunc: 'linear' }
    })
  } catch (e) {
    /* ignore */
  }
}

function setPageBackground(palette) {
  // #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY || H5
  try {
    if (typeof uni.setBackgroundColor === 'function') {
      uni.setBackgroundColor({
        backgroundColor: palette.bg,
        backgroundColorTop: palette.bg,
        backgroundColorBottom: palette.bg
      })
    }
  } catch (e) {
    /* ignore */
  }
  // #endif
}

function setTabBarPalette(palette, enabled) {
  try {
    uni.setTabBarStyle({
      color: palette.tabColor,
      selectedColor: palette.tabSelected,
      backgroundColor: palette.tabBg,
      borderStyle: enabled ? 'black' : 'white'
    })
  } catch (e) {
    /* ignore */
  }
}

function syncTabBarTheme(enabled) {
  try {
    const pages = getCurrentPages()
    pages.forEach((page) => {
      if (typeof page.getTabBar !== 'function') return
      const tabBar = page.getTabBar()
      if (!tabBar) return
      if (typeof tabBar.setTheme === 'function') {
        tabBar.setTheme(enabled)
      } else if (typeof tabBar.setData === 'function') {
        tabBar.setData({ isDark: enabled })
      }
    })
  } catch (e) {
    /* ignore */
  }
}

function syncPageChrome(enabled) {
  themeState.darkMode = !!enabled
  const palette = getPalette(enabled)
  applyThemeVars(palette, enabled)
  setNavigationBar(palette, false)
  setPageBackground(palette)
}

function applyTheme(enabled, options = {}) {
  const { silent = false, animate = !silent } = options
  const mode = getModeKey(enabled)
  const palette = getPalette(enabled)

  themeState.darkMode = !!enabled
  applyThemeVars(palette, enabled)

  const chromeChanged = appliedChromeMode !== mode
  setNavigationBar(palette, animate && chromeChanged)
  setPageBackground(palette)

  if (chromeChanged) {
    setTabBarPalette(palette, enabled)
    appliedChromeMode = mode
  }

  syncTabBarTheme(enabled)

  if (!silent) {
    uni.$emit('theme-change', enabled)
  }

  return palette
}

function bootstrapTheme() {
  const enabled = loadDarkMode()
  themeState.darkMode = enabled
  appliedChromeMode = getModeKey(enabled)
  const palette = getPalette(enabled)
  applyThemeVars(palette, enabled)
  return enabled
}

export {
  themeState,
  loadDarkMode,
  saveDarkMode,
  applyTheme,
  syncPageChrome,
  syncTabBarTheme,
  bootstrapTheme,
  LIGHT,
  DARK,
  THEME_KEY
}
