<template>
  <view class="tab-bar" :class="{ 'tab-bar-dark': isDark }">
    <view
      v-for="(item, index) in tabs"
      :key="item.pagePath"
      class="tab-item"
      :class="{ active: selected === index }"
      @tap="switchTab(index, item.pagePath)"
    >
      <view class="tab-inner" :class="{ bounce: selected === index }">
        <image
          class="tab-icon"
          :src="getIconSrc(item.icon, index)"
          :key="`${item.icon}-${selected}-${isDark}`"
          mode="aspectFit"
        />
        <text class="tab-text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getTabIconSrc } from '../utils/tabIcons.js'
import { themeState } from '../utils/theme.js'

export default {
  data() {
    return {
      selected: 0,
      isDark: themeState.darkMode,
      tabs: [
        { pagePath: '/pages/weekly/weekly', text: '周期表', icon: 'calendar' },
        { pagePath: '/pages/timeline/timeline', text: '时间轴', icon: 'clock' },
        { pagePath: '/pages/profile/profile', text: '我的', icon: 'user' }
      ]
    }
  },
  mounted() {
    this.isDark = themeState.darkMode
    uni.$on('theme-change', this.onThemeChange)
  },
  beforeUnmount() {
    uni.$off('theme-change', this.onThemeChange)
  },
  methods: {
    getIconSrc(iconName, index) {
      return getTabIconSrc(iconName, this.selected === index, this.isDark)
    },
    setTheme(enabled) {
      const value = !!enabled
      if (this.isDark === value) return
      this.isDark = value
    },
    onThemeChange(enabled) {
      this.isDark = !!enabled
    },
    setSelected(index) {
      this.selected = index
    },
    switchTab(index, path) {
      this.selected = index
      uni.switchTab({ url: path })
    }
  }
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 50px;
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1px solid #e5e5ea;
  display: flex;
  z-index: 9999;
}

.tab-bar-dark {
  background: #1c1c1e;
  border-top-color: #38383a;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 8px;
}

.tab-inner.bounce {
  animation: tabBounce 0.35s ease;
}

.tab-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.tab-text {
  font-size: 11px;
  color: #b0b0b0;
  line-height: 1.2;
  white-space: nowrap;
}

.tab-item.active .tab-text {
  color: #e58b88;
  font-weight: 500;
}

.tab-bar-dark .tab-item.active .tab-text {
  color: #e58b88;
}

.tab-bar-dark .tab-text {
  color: #636366;
}

@keyframes tabBounce {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}
</style>
