<template>
  <view class="page page-root" :class="{ 'theme-dark': isDark }">
    <view class="summary card fade-in">
      <text class="summary-num">{{ taskList.length }}</text>
      <text class="summary-label">任务总数</text>
      <text class="summary-hint">重复任务（每天 / 每周）只计 1 个</text>
    </view>

    <view v-if="taskList.length === 0" class="empty card fade-in">
      <AppIcon name="empty" color="#C7C7CC" :size="72" />
      <text class="empty-text">还没有任务</text>
    </view>

    <view v-else class="list fade-in">
      <view v-for="task in taskList" :key="task.id" class="task-item card">
        <view class="task-main">
          <text class="task-title">{{ task.title }}</text>
          <view class="task-meta">
            <AppIcon name="time" color="#8E8E93" :size="24" />
            <text class="meta-text">{{ formatTime(task) }}</text>
            <text v-if="repeatLabel(task)" class="repeat-tag">{{ repeatLabel(task) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { useTaskStore } from '@/utils/taskStore'
import { usePageTheme } from '@/utils/tabBar'

const store = useTaskStore()
const { isDark } = usePageTheme()

const taskList = computed(() => store.getAllTasksList())

function formatTime(task) {
  return store.formatTaskTime(task)
}

function repeatLabel(task) {
  return store.getRepeatLabel(task)
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
  padding-bottom: 48rpx;
}

.summary {
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.summary-num {
  font-size: 56rpx;
  font-weight: 600;
  color: var(--theme-text);
}

.summary-label {
  font-size: 28rpx;
  color: var(--theme-text);
}

.summary-hint {
  font-size: 22rpx;
  color: var(--theme-text-muted);
  margin-top: 8rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.task-item {
  padding: 28rpx 32rpx;
}

.task-title {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--theme-text);
  margin-bottom: 12rpx;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-text {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.repeat-tag {
  font-size: 20rpx;
  color: var(--theme-text-secondary);
  background: var(--theme-accent-soft, #f5d9b9);
  padding: 2rpx 12rpx;
  border-radius: 16rpx;
  margin-left: 8rpx;
}

.empty {
  padding: 80rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: var(--theme-text-secondary);
}
</style>
