<template>
  <view class="page page-root" :class="{ 'theme-dark': isDark }">
    <view class="section card fade-in">
      <text class="section-title">数据管理</text>

      <view class="setting-item" @tap="onBackup">
        <text class="setting-name">本地备份</text>
        <AppIcon name="chevronRight" color="#BBBBBB" :size="32" />
      </view>

      <view class="setting-item" @tap="onRestore">
        <text class="setting-name">恢复备份</text>
        <AppIcon name="chevronRight" color="#BBBBBB" :size="32" />
      </view>

      <view class="setting-item danger" @tap="onClearData">
        <text class="setting-name">清除数据</text>
        <AppIcon name="chevronRight" color="#BBBBBB" :size="32" />
      </view>
    </view>

    <view class="section card fade-in">
      <text class="section-title">个性化</text>
      <view class="setting-item">
        <text class="setting-name">昵称</text>
        <input
          class="nickname-input"
          :value="nickname"
          placeholder="输入昵称"
          @blur="onNicknameBlur"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { useTaskStore } from '@/utils/taskStore'
import { usePageTheme } from '@/utils/tabBar'
import { backupData, restoreBackup } from '@/utils/storage'

const store = useTaskStore()
const { isDark } = usePageTheme()
const nickname = ref(store.settings.value.nickname || '日程达人')

function onNicknameBlur(e) {
  const name = e.detail.value.trim() || '日程达人'
  nickname.value = name
  store.setNickname(name)
}

function onBackup() {
  backupData(store.tasks.value)
  uni.showToast({ title: '备份成功', icon: 'success' })
}

function onRestore() {
  const backup = restoreBackup()
  if (!backup || !backup.tasks) {
    uni.showToast({ title: '暂无备份数据', icon: 'none' })
    return
  }
  uni.showModal({
    title: '恢复备份',
    content: `确定恢复 ${backup.tasks.length} 条任务？当前数据将被覆盖。`,
    confirmColor: '#FF69B4',
    success(res) {
      if (res.confirm) {
        store.restoreTasks(backup.tasks)
        uni.showToast({ title: '恢复成功', icon: 'success' })
      }
    }
  })
}

function onClearData() {
  uni.showModal({
    title: '清除数据',
    content: '确定要清除所有任务数据吗？此操作不可恢复。',
    confirmColor: '#FF69B4',
    success(res) {
      if (res.confirm) {
        store.clearAllTasks()
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
  min-height: 100vh;
}

.section {
  margin-bottom: 24rpx;
  padding: 8rpx 0;
}

.section-title {
  display: block;
  font-size: 24rpx;
  color: var(--theme-text-secondary);
  padding: 20rpx 32rpx 8rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;

  &.danger .setting-name {
    color: #e57373;
  }

  &:active {
    background: rgba(255, 182, 193, 0.08);
  }
}

.setting-name {
  font-size: 28rpx;
  color: var(--theme-text);
}

.nickname-input {
  text-align: right;
  font-size: 28rpx;
  color: var(--theme-text-secondary);
  flex: 1;
  margin-left: 24rpx;
}
</style>
