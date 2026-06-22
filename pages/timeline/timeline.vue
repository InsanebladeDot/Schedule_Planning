<template>
  <view class="page page-root" :class="{ 'theme-dark': isDark }">
    <view class="date-bar card fade-in">
      <view class="date-nav check-bounce" @tap="prevDay">
        <AppIcon name="chevronLeft" color="#8A7358" :size="36" />
      </view>
      <view class="date-info" @tap="goToday">
        <text class="date-main">{{ dateLabel }}</text>
        <text class="date-sub">{{ weekdayLabel }}</text>
      </view>
      <view class="date-nav check-bounce" @tap="nextDay">
        <AppIcon name="chevronRight" color="#8A7358" :size="36" />
      </view>
    </view>

    <view v-if="dayTasks.length === 0" class="empty card fade-in">
      <AppIcon name="empty" color="#C7C7CC" :size="88" />
      <text class="empty-title">暂无日程</text>
      <text class="empty-desc">长按时间轴空白处可快速添加</text>
    </view>

    <scroll-view
      v-else
      class="timeline-scroll"
      scroll-y
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <view class="timeline">
        <view
          v-for="hour in hours"
          :key="hour"
          class="hour-row"
          @longpress="onLongPress(hour)"
        >
          <view class="time-scale">
            <text class="time-text">{{ formatHour(hour) }}</text>
          </view>
          <view class="hour-content">
            <view class="hour-line"></view>
            <view
              v-for="task in getTasksAtHour(hour)"
              :key="task.id"
              class="event-card fade-in"
              @tap="toggleTask(task.id)"
            >
              <view class="color-bar"></view>
              <view class="event-inner">
                <view class="event-header">
                  <AppIcon name="alarm" color="#8E8E93" :size="32" />
                  <text class="event-time">{{ formatEventTime(task) }}</text>
                </view>
                <text class="event-title" :class="{ 'task-done-anim': task.done }">{{ task.title }}</text>
                <text v-if="task.desc" class="event-desc">{{ task.desc }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <scroll-view
      v-if="dayTasks.length === 0"
      class="timeline-scroll empty-timeline"
      scroll-y
    >
      <view class="timeline">
        <view
          v-for="hour in hours"
          :key="hour"
          class="hour-row"
          @longpress="onLongPress(hour)"
        >
          <view class="time-scale">
            <text class="time-text">{{ formatHour(hour) }}</text>
          </view>
          <view class="hour-content">
            <view class="hour-line"></view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { useTaskStore } from '@/utils/taskStore'
import { usePageTheme } from '@/utils/tabBar'
import { formatDate, addDays, WEEKDAY_LABELS } from '@/utils/date'

const store = useTaskStore()
const { isDark } = usePageTheme(1)

const currentDate = ref(formatDate(new Date()))
const touchStartX = ref(0)
const touchStartY = ref(0)
const hours = Array.from({ length: 25 }, (_, i) => i)

const dateLabel = computed(() => {
  const today = formatDate(new Date())
  const tomorrow = formatDate(addDays(new Date(), 1))
  if (currentDate.value === today) return '今天'
  if (currentDate.value === tomorrow) return '明天'
  const d = new Date(currentDate.value.replace(/-/g, '/'))
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const weekdayLabel = computed(() => {
  const d = new Date(currentDate.value.replace(/-/g, '/'))
  return '周' + WEEKDAY_LABELS[d.getDay()]
})

const dayTasks = computed(() => store.getTasksForDate(currentDate.value))

function formatHour(h) {
  return `${String(h).padStart(2, '0')}:00`
}

function getHourFromTime(time) {
  return parseInt(time.split(':')[0], 10)
}

function getTasksAtHour(hour) {
  return dayTasks.value.filter(t => getHourFromTime(t.time) === hour)
}

function formatEventTime(task) {
  if (task.endTime) return `${task.time} - ${task.endTime}`
  return task.time
}

function prevDay() {
  currentDate.value = formatDate(addDays(currentDate.value, -1))
}

function nextDay() {
  currentDate.value = formatDate(addDays(currentDate.value, 1))
}

function goToday() {
  currentDate.value = formatDate(new Date())
}

function onTouchStart(e) {
  touchStartX.value = e.changedTouches[0].clientX
  touchStartY.value = e.changedTouches[0].clientY
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX.value
  const dy = e.changedTouches[0].clientY - touchStartY.value
  if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 60) return
  if (dx > 0) prevDay()
  else nextDay()
}

function onLongPress(hour) {
  const time = formatHour(Math.min(hour, 23))
  const endTime = formatHour(Math.min(hour + 1, 23))
  uni.navigateTo({
    url: `/pages/task/edit?date=${currentDate.value}&time=${time}&endTime=${endTime}`
  })
}

function toggleTask(id) {
  store.toggleComplete(id, currentDate.value)
}
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
}

.date-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 16rpx;
  margin-bottom: 24rpx;
}

.date-nav {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--theme-bg);
  border: 1rpx solid var(--theme-border);
}

.date-info {
  text-align: center;
}

.date-main {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--theme-text);
}

.date-sub {
  display: block;
  font-size: 24rpx;
  color: var(--theme-text-secondary);
  margin-top: 4rpx;
}

.empty {
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--theme-text);
}

.empty-desc {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.timeline-scroll {
  flex: 1;
  height: calc(100vh - 320rpx);
}

.empty-timeline {
  height: calc(100vh - 480rpx);
}

.timeline {
  padding-bottom: 40rpx;
}

.hour-row {
  display: flex;
  min-height: 100rpx;
}

.time-scale {
  width: 100rpx;
  flex-shrink: 0;
  padding-top: 4rpx;
}

.time-text {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.hour-content {
  flex: 1;
  position: relative;
  padding-left: 16rpx;
  padding-bottom: 8rpx;
}

.hour-line {
  position: absolute;
  left: 0;
  top: 16rpx;
  right: 0;
  height: 1rpx;
  background: var(--theme-border);
}

.event-card {
  position: relative;
  display: flex;
  margin-top: 8rpx;
  margin-bottom: 8rpx;
  border-radius: var(--theme-radius);
  overflow: hidden;
  background: var(--theme-card);
  box-shadow: var(--theme-shadow);
  border: 1rpx solid var(--theme-border);
}

.color-bar {
  width: 6rpx;
  flex-shrink: 0;
  background: var(--theme-accent, #e58b88);
}

.event-inner {
  flex: 1;
  padding: 16rpx 20rpx;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.event-time {
  font-size: 24rpx;
  color: var(--theme-text-secondary);
}

.event-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--theme-text);
}

.event-desc {
  display: block;
  font-size: 24rpx;
  color: var(--theme-text-secondary);
  margin-top: 6rpx;
}
</style>
