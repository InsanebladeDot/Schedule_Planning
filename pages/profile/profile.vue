<template>
  <view class="page page-root" :class="{ 'theme-dark': isDark }">
    <view class="profile-header card fade-in">
      <view class="avatar-wrap">
        <AppIcon name="user" color="#8E8E93" :size="72" />
      </view>
      <text class="nickname">{{ nickname }}</text>
      <text class="greeting">{{ greeting }}</text>
    </view>

    <view class="stats-row fade-in">
      <view class="stat-card card" @tap="goAllTasks">
        <AppIcon name="list" color="#8E8E93" :size="36" />
        <text class="stat-num">{{ totalCount }}</text>
        <text class="stat-label">任务总数</text>
        <AppIcon name="chevronRight" color="#C7C7CC" :size="24" class="stat-arrow" />
      </view>
      <view class="stat-card card" @tap="goDoneTasks">
        <AppIcon name="check" color="#8E8E93" :size="36" />
        <text class="stat-num">{{ doneCount }}</text>
        <text class="stat-label">已完成</text>
        <AppIcon name="chevronRight" color="#C7C7CC" :size="24" class="stat-arrow" />
      </view>
    </view>

    <view class="menu card fade-in">
      <view class="menu-item" @tap="goSettings">
        <view class="menu-left">
          <AppIcon name="settings" color="#8E8E93" :size="36" />
          <text class="menu-name">设置</text>
        </view>
        <AppIcon name="chevronRight" color="#C7C7CC" :size="28" />
      </view>

      <view class="menu-item">
        <view class="menu-left">
          <AppIcon name="moon" color="#8E8E93" :size="36" />
          <text class="menu-name">黑夜模式</text>
        </view>
        <switch :checked="isDark" color="#E58B88" @change="onDarkSwitch" />
      </view>

      <view class="menu-item" @tap="showAbout">
        <view class="menu-left">
          <AppIcon name="info" color="#8E8E93" :size="36" />
          <text class="menu-name">关于</text>
        </view>
        <AppIcon name="chevronRight" color="#C7C7CC" :size="28" />
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">PinkTask v1.0.0</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { useTaskStore } from '@/utils/taskStore'
import { usePageTheme } from '@/utils/tabBar'
import { getGreeting } from '@/utils/date'

const store = useTaskStore()
const { isDark } = usePageTheme(2)
const nickname = computed(() => store.settings.value.nickname || '日程达人')
const greeting = computed(() => getGreeting())
const totalCount = computed(() => store.getTotalTaskCount())
const doneCount = computed(() => store.getDoneCount())

function goAllTasks() {
  uni.navigateTo({ url: '/pages/tasks/all' })
}

function goDoneTasks() {
  uni.navigateTo({ url: '/pages/tasks/done' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/settings/settings' })
}

function onDarkSwitch(e) {
  store.setDarkMode(e.detail.value)
}

function showAbout() {
  uni.showModal({
    title: '关于 PinkTask',
    content: '鼠尾草绿 × 珊瑚粉\n记录每一天的小目标。',
    showCancel: false,
    confirmColor: '#E58B88'
  })
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  margin-bottom: 24rpx;
}

.avatar-wrap {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: var(--theme-bg);
  border: 1rpx solid var(--theme-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.nickname {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--theme-text);
  margin-bottom: 8rpx;
}

.greeting {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.stats-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  flex: 1;
  padding: 28rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  position: relative;

  &:active {
    opacity: 0.85;
  }
}

.stat-arrow {
  position: absolute;
  right: 16rpx;
  top: 50%;
  transform: translateY(-50%);
}

.stat-num {
  font-size: 40rpx;
  font-weight: 600;
  color: var(--theme-text);
}

.stat-label {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.menu {
  padding: 4rpx 0;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;

  &:active {
    background: rgba(0, 0, 0, 0.03);
  }
}

.theme-dark .menu-item:active {
  background: rgba(255, 255, 255, 0.04);
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-name {
  font-size: 28rpx;
  color: var(--theme-text);
}

.footer {
  text-align: center;
  padding: 48rpx 0 24rpx;
}

.footer-text {
  font-size: 22rpx;
  color: var(--theme-text-muted);
}
</style>
