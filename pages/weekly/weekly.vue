<template>
  <view class="page page-root" :class="{ 'theme-dark': isDark }">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="top-header">
      <view class="header-left">
        <view class="header-icon-btn check-bounce" @tap="goAllTasks">
          <text class="header-emoji">📝</text>
        </view>
        <view class="header-icon-btn check-bounce" @tap="goToday">
          <text class="header-emoji">📅</text>
        </view>
      </view>
      <text class="header-title">打卡</text>
      <view class="header-right">
        <view class="avatar-btn check-bounce" @tap="goProfile">
          <text class="avatar-emoji">👤</text>
          <view v-if="pendingCount > 0" class="notify-dot"></view>
        </view>
        <view class="add-btn check-bounce" @tap="showCustomModal = true">
          <text class="add-plus">+</text>
        </view>
      </view>
    </view>

    <view class="main-board">
      <view class="board-toolbar">
        <scroll-view class="date-scroll" scroll-x :show-scrollbar="false" :scroll-into-view="scrollIntoView">
          <view class="date-tabs">
            <view
              v-for="(day, index) in dateTabs"
              :key="day.dateStr"
              :id="'tab-' + index"
              class="date-tab"
              :class="{ active: day.dateStr === selectedDate }"
              @tap="selectDate(day.dateStr)"
            >
              <text class="tab-week">{{ day.topLabel }}</text>
              <text class="tab-num">{{ day.dayNum }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="view-switchers">
          <view
            class="view-item"
            :class="{ active: viewMode === 'grid' }"
            @tap="viewMode = 'grid'"
          >
            <text class="view-icon">▦</text>
            <text class="view-label">月视图</text>
          </view>
          <view
            class="view-item"
            :class="{ active: viewMode === 'list' }"
            @tap="viewMode = 'list'"
          >
            <text class="view-icon">☰</text>
            <text class="view-label">列表</text>
          </view>
          <view class="view-item" @tap="goTimeline">
            <text class="view-icon">⏱</text>
            <text class="view-label">时间轴</text>
          </view>
        </view>
      </view>

      <view v-if="taskList.length === 0" class="empty-board">
        <text class="empty-emoji">🌱</text>
        <text class="empty-text">今天还没有任务</text>
        <text class="empty-hint">点右上角 + 定制任务</text>
      </view>

      <view v-else-if="viewMode === 'grid'" class="task-grid">
        <view
          v-for="task in taskList"
          :key="task.id + selectedDate"
          class="task-card check-bounce"
          @tap="toggleTask(task.id)"
          @longpress="goEditTask(task.id)"
        >
          <view class="task-icon-wrap" :class="{ done: task.done }">
            <text class="task-emoji">{{ task.icon || '🎯' }}</text>
            <view v-if="task.done" class="done-badge">
              <text class="badge-check">✓</text>
            </view>
          </view>
          <text class="task-name">{{ truncateTitle(task.title) }}</text>
          <text class="task-streak">{{ persistLabel(task) }}</text>
        </view>
      </view>

      <view v-else class="task-list">
        <view
          v-for="task in taskList"
          :key="task.id + selectedDate + '-list'"
          class="list-item check-bounce"
          @tap="toggleTask(task.id)"
          @longpress="goEditTask(task.id)"
        >
          <view class="list-icon" :class="{ done: task.done }">
            <text>{{ task.icon || '🎯' }}</text>
          </view>
          <view class="list-body">
            <text class="list-title" :class="{ 'task-done-anim': task.done }">{{ task.title }}</text>
            <text class="list-meta">{{ formatTimeRange(task) }} · {{ persistLabel(task) }}</text>
          </view>
          <view class="list-check" :class="{ checked: task.done }">
            <text v-if="task.done">✓</text>
          </view>
        </view>
      </view>

      <view v-if="taskList.length > 0" class="board-footer">
        <view class="page-tag">{{ doneCount }}/{{ taskList.length }}</view>
        <text class="footer-tip">点击打卡 · 长按编辑</text>
      </view>
    </view>

    <CustomTaskModal
      :visible="showCustomModal"
      :date="selectedDate"
      @close="showCustomModal = false"
      @submit="onCustomSubmit"
      @advanced="onCustomAdvanced"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CustomTaskModal from '@/components/CustomTaskModal.vue'
import { useTaskStore } from '@/utils/taskStore'
import { usePageTheme } from '@/utils/tabBar'
import {
  formatDate,
  addDays,
  WEEKDAY_LABELS,
  getRelativeDayLabel,
  parseDate
} from '@/utils/date'

const store = useTaskStore()
const { isDark } = usePageTheme(0)

const selectedDate = ref(formatDate(new Date()))
const scrollIntoView = ref('')
const showCustomModal = ref(false)
const viewMode = ref('grid')
const statusBarHeight = ref(20)
const todayStr = formatDate(new Date())

const dateTabs = computed(() => {
  const center = parseDate(selectedDate.value)
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(center, i - 3)
    const dateStr = formatDate(d)
    const relative = getRelativeDayLabel(dateStr)
    const topLabel = relative || `周${WEEKDAY_LABELS[d.getDay()]}`
    return {
      dateStr,
      topLabel,
      dayNum: d.getDate()
    }
  })
})

const taskList = computed(() => store.getTasksForDate(selectedDate.value))

const doneCount = computed(() => taskList.value.filter(t => t.done).length)

const pendingCount = computed(() => {
  const todayTasks = store.getTasksForDate(todayStr)
  return todayTasks.filter(t => !t.done).length
})

onMounted(() => {
  try {
    const sys = uni.getSystemInfoSync()
    statusBarHeight.value = sys.statusBarHeight || 20
  } catch (e) {
    statusBarHeight.value = 20
  }
  scrollToSelected()
})

function scrollToSelected() {
  const idx = dateTabs.value.findIndex(d => d.dateStr === selectedDate.value)
  if (idx >= 0) scrollIntoView.value = 'tab-' + idx
}

function selectDate(dateStr) {
  selectedDate.value = dateStr
  scrollToSelected()
}

function goToday() {
  selectedDate.value = todayStr
  scrollToSelected()
}

function formatTimeRange(task) {
  if (task.endTime) return `${task.time}-${task.endTime}`
  return task.time
}

function truncateTitle(title) {
  if (!title) return ''
  return title.length > 6 ? `${title.slice(0, 5)}…` : title
}

function persistLabel(task) {
  const days = store.getTaskPersistDays(task, selectedDate.value)
  if (days > 0) return `已坚持${days}天`
  if (task.done) return '今日已完成'
  return '点击打卡'
}

function toggleTask(id) {
  store.toggleComplete(id, selectedDate.value)
}

function goEditTask(id) {
  uni.navigateTo({ url: `/pages/task/edit?id=${id}` })
}

function goAllTasks() {
  uni.navigateTo({ url: '/pages/tasks/all' })
}

function goProfile() {
  uni.switchTab({ url: '/pages/profile/profile' })
}

function goTimeline() {
  uni.switchTab({ url: '/pages/timeline/timeline' })
}

function onCustomSubmit(form) {
  const result = store.addTask({
    title: form.title,
    icon: form.icon,
    time: form.time,
    endTime: form.endTime,
    date: selectedDate.value,
    repeatType: form.repeatType,
    weeklyRepeat: form.weeklyRepeat,
    dailyRepeat: form.dailyRepeat
  })
  if (result) {
    showCustomModal.value = false
    uni.showToast({ title: '定制成功', icon: 'success' })
  }
}

function onCustomAdvanced(form) {
  showCustomModal.value = false
  const q = [
    `date=${selectedDate.value}`,
    `time=${form.time || '09:00'}`,
    `endTime=${form.endTime || '10:00'}`
  ]
  if (form.title) q.push(`title=${encodeURIComponent(form.title)}`)
  if (form.icon) q.push(`icon=${encodeURIComponent(form.icon)}`)
  if (form.repeatType) q.push(`repeatType=${form.repeatType}`)
  uni.navigateTo({ url: `/pages/task/edit?${q.join('&')}` })
}
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}

.status-bar {
  flex-shrink: 0;
}

.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 28rpx 20rpx;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 160rpx;
}

.header-right {
  justify-content: flex-end;
}

.header-icon-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-emoji {
  font-size: 32rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--theme-text, #5a5a48);
  letter-spacing: 2rpx;
}

.avatar-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-emoji {
  font-size: 30rpx;
}

.notify-dot {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 16rpx;
  height: 16rpx;
  background: #e85d5d;
  border-radius: 50%;
  border: 2rpx solid #fff;
}

.add-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #e85d5d;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(232, 93, 93, 0.35);
}

.add-plus {
  font-size: 48rpx;
  color: #fff;
  line-height: 1;
  margin-top: -4rpx;
}

.main-board {
  margin: 0 24rpx;
  background: #fff;
  border: 4rpx solid #8a7358;
  border-radius: 32rpx;
  overflow: hidden;
  min-height: 720rpx;
  display: flex;
  flex-direction: column;
}

.theme-dark .main-board {
  background: var(--theme-card, #363b30);
  border-color: #6a5a48;
}

.board-toolbar {
  display: flex;
  align-items: stretch;
  border-bottom: 2rpx solid #f0ebe0;
  background: #fff;
}

.theme-dark .board-toolbar {
  background: var(--theme-card, #363b30);
  border-bottom-color: var(--theme-border, #4a5044);
}

.date-scroll {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
}

.date-tabs {
  display: inline-flex;
  height: 100%;
}

.date-tab {
  width: 96rpx;
  padding: 16rpx 8rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  flex-shrink: 0;

  &.active {
    background: #f5d9b9;
    border-radius: 20rpx 20rpx 0 0;
  }
}

.tab-week {
  font-size: 22rpx;
  color: var(--theme-text-secondary, #8a8a78);
}

.tab-num {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--theme-text, #5a5a48);
}

.date-tab.active .tab-week,
.date-tab.active .tab-num {
  color: #6a5040;
}

.view-switchers {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4rpx;
  padding: 8rpx 12rpx;
  border-left: 2rpx solid #f0ebe0;
  flex-shrink: 0;
}

.theme-dark .view-switchers {
  border-left-color: var(--theme-border, #4a5044);
}

.view-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;

  &.active .view-label {
    color: #e58b88;
    font-weight: 600;
  }
}

.view-icon {
  font-size: 22rpx;
  color: var(--theme-text-secondary, #8a8a78);
  line-height: 1.2;
}

.view-label {
  font-size: 18rpx;
  color: var(--theme-text-muted, #a8a896);
  white-space: nowrap;
}

.empty-board {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  gap: 12rpx;
}

.empty-emoji {
  font-size: 80rpx;
}

.empty-text {
  font-size: 30rpx;
  color: var(--theme-text, #5a5a48);
  font-weight: 500;
}

.empty-hint {
  font-size: 24rpx;
  color: var(--theme-text-muted, #a8a896);
}

.task-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 28rpx 20rpx 12rpx;
  gap: 8rpx 0;
}

.task-card {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 8rpx 20rpx;
}

.task-icon-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 28rpx;
  background: #f1f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 12rpx;
  border: 2rpx solid transparent;
  transition: opacity 0.2s;

  &.done {
    opacity: 0.75;
  }
}

.theme-dark .task-icon-wrap {
  background: var(--theme-input-bg, #3a4034);
}

.task-emoji {
  font-size: 56rpx;
  line-height: 1;
}

.done-badge {
  position: absolute;
  right: -6rpx;
  bottom: -6rpx;
  width: 36rpx;
  height: 36rpx;
  background: #7bc67e;
  border-radius: 50%;
  border: 3rpx solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-check {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
}

.task-name {
  font-size: 24rpx;
  color: var(--theme-text, #5a5a48);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.task-streak {
  font-size: 20rpx;
  color: var(--theme-text-muted, #a8a896);
  margin-top: 4rpx;
  text-align: center;
}

.task-list {
  padding: 16rpx 20rpx;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 12rpx;
  border-bottom: 1rpx solid #f0ebe0;
}

.theme-dark .list-item {
  border-bottom-color: var(--theme-border, #4a5044);
}

.list-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: #f1f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;

  &.done {
    opacity: 0.7;
  }
}

.list-body {
  flex: 1;
  min-width: 0;
}

.list-title {
  display: block;
  font-size: 28rpx;
  color: var(--theme-text, #5a5a48);
  font-weight: 500;
}

.list-meta {
  display: block;
  font-size: 22rpx;
  color: var(--theme-text-muted, #a8a896);
  margin-top: 4rpx;
}

.list-check {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #d4cfc0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #fff;

  &.checked {
    background: #7bc67e;
    border-color: #7bc67e;
  }
}

.board-footer {
  margin-top: auto;
  padding: 16rpx 24rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-tag {
  background: #f5c4c4;
  color: #8a5040;
  font-size: 22rpx;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
  font-weight: 600;
}

.footer-tip {
  font-size: 22rpx;
  color: var(--theme-text-muted, #a8a896);
}
</style>
