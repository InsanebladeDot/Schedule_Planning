<template>
  <view class="page page-root" :class="{ 'theme-dark': isDark }">
    <view class="summary card fade-in">
      <text class="summary-num">{{ totalDone }}</text>
      <text class="summary-label">已完成记录</text>
      <text class="summary-hint">按完成日期分组，重复任务每次完成单独记录</text>
    </view>

    <view v-if="groups.length === 0" class="empty card fade-in">
      <AppIcon name="check" color="#C7C7CC" :size="72" />
      <text class="empty-text">还没有完成的任务</text>
    </view>

    <view v-else class="groups fade-in">
      <view v-for="group in groups" :key="group.date" class="date-group">
        <text class="date-title">{{ formatDate(group.date) }}</text>
        <view class="group-list">
          <view v-for="(item, idx) in group.items" :key="item.task.id + item.completedDate + idx" class="task-item card">
            <view class="task-main">
              <text class="task-title">{{ item.task.title }}</text>
              <view class="task-meta">
                <AppIcon name="time" color="#8E8E93" :size="24" />
                <text class="meta-text">{{ formatTime(item.task) }}</text>
                <text v-if="repeatLabel(item.task)" class="repeat-tag">{{ repeatLabel(item.task) }}</text>
              </view>
            </view>
            <AppIcon name="check" color="#8E8E93" :size="28" />
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
import { formatDateDisplay } from '@/utils/date'

const store = useTaskStore()
const { isDark } = usePageTheme()

const groups = computed(() => store.getCompletedGroupedByDate())
const totalDone = computed(() => store.getDoneCount())

function formatDate(dateStr) {
  return formatDateDisplay(dateStr)
}

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
  text-align: center;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.date-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--theme-text-secondary);
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.task-item {
  padding: 28rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-main {
  flex: 1;
  min-width: 0;
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
