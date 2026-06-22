import { computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { themeState, syncPageChrome } from './theme'

function syncTabBarIndex(tabIndex) {
  if (tabIndex == null) return
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  if (page && typeof page.getTabBar === 'function') {
    const tabBar = page.getTabBar()
    if (tabBar) {
      if (typeof tabBar.setSelected === 'function') {
        tabBar.setSelected(tabIndex)
      }
      if (typeof tabBar.setTheme === 'function') {
        tabBar.setTheme(themeState.darkMode)
      }
    }
  }
}

/**
 * 页面级主题：响应式 isDark + onLoad/onShow 无动画同步当前页 chrome
 * @param {number|null} tabIndex Tab 页索引，非 Tab 页传 null
 */
export function usePageTheme(tabIndex = null) {
  const sync = () => {
    syncPageChrome(themeState.darkMode)
    syncTabBarIndex(tabIndex)
  }

  onLoad(sync)
  onShow(sync)

  return {
    isDark: computed(() => themeState.darkMode)
  }
}

/** @deprecated 请使用 usePageTheme */
export function useTabBar(index) {
  return usePageTheme(index)
}
