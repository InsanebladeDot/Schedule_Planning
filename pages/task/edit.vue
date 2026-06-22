<template>
  <view class="edit-page" :class="{ 'theme-dark': isDark }">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-back check-bounce" @tap="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="nav-title">{{ isEdit ? '编辑目标' : '添加目标' }}</text>
      <view class="nav-confirm check-bounce" @tap="onSubmit">确定</view>
    </view>

    <scroll-view class="scroll-body" scroll-y :show-scrollbar="false">
      <view class="form-card">
        <view class="name-row">
          <text class="pencil-icon">✎</text>
          <input
            class="name-input"
            v-model="form.title"
            placeholder="输入目标名称"
            maxlength="50"
          />
          <view class="common-btn" @tap="showCommonPicker">常用</view>
        </view>

        <view class="section-row" @tap="showIconSheet = true">
          <text class="row-label">选择目标图标</text>
          <view class="icon-picker">
            <view class="icon-box">
              <text class="icon-emoji">{{ form.icon }}</text>
            </view>
            <text class="arrow-down">▼</text>
          </view>
        </view>

        <view class="date-range">
          <picker mode="date" :value="form.startDate" @change="onStartDateChange">
            <view class="date-box start">
              <text class="date-label">开始时间</text>
              <text class="date-main">{{ startDateMain }}</text>
              <text class="date-sub">{{ startDateSub }}</text>
            </view>
          </picker>
          <picker mode="date" :value="form.endDate || form.startDate" @change="onEndDateChange">
            <view class="date-box end">
              <text class="date-label">结束时间</text>
              <text class="date-main">{{ endDateMain }}</text>
              <text class="date-sub">{{ endDateSub }}</text>
            </view>
          </picker>
        </view>

        <view class="time-range">
          <picker mode="time" :value="form.time" @change="onTimeChange">
            <view class="time-box">
              <text class="time-label">开始</text>
              <text class="time-value">{{ form.time }}</text>
            </view>
          </picker>
          <text class="time-sep">—</text>
          <picker mode="time" :value="form.endTime" @change="onEndTimeChange">
            <view class="time-box">
              <text class="time-label">结束</text>
              <text class="time-value">{{ form.endTime }}</text>
            </view>
          </picker>
        </view>

        <view class="divider"></view>

        <view class="section-block">
          <text class="row-label">频率</text>
          <view class="freq-tabs">
            <view
              v-for="opt in freqOptions"
              :key="opt.key"
              class="freq-tab"
              :class="{ active: form.repeatType === opt.key }"
              @tap="setRepeatType(opt.key)"
            >
              <text v-if="opt.key === 'weekly' && form.repeatType === 'weekly'" class="freq-icon">⏰</text>
              <text class="freq-text">{{ opt.label }}</text>
            </view>
          </view>
          <view v-if="form.repeatType === 'weekly'" class="weekdays">
            <view
              v-for="day in weekdayOptions"
              :key="day.value"
              class="weekday-pill"
              :class="{ active: form.repeatWeekdays.includes(day.value) }"
              @tap="toggleWeekday(day.value)"
            >
              {{ day.label }}
            </view>
          </view>
        </view>

        <view class="section-row">
          <text class="row-label">每天打卡次数</text>
          <view class="stepper">
            <view class="step-btn" @tap="changeDailyCount(-1)">−</view>
            <text class="step-num">{{ form.dailyCount }}</text>
            <view class="step-btn" @tap="changeDailyCount(1)">+</view>
          </view>
        </view>

        <view class="section-row multi">
          <view class="row-left">
            <view class="label-line">
              <text class="row-label">每次打卡记录</text>
              <text class="lock-icon">🔒</text>
            </view>
            <text class="row-hint">如跳绳500个，看书30分钟等</text>
          </view>
          <switch
            :checked="form.recordEnabled"
            color="#E58B88"
            @change="onRecordToggle"
          />
        </view>
        <input
          v-if="form.recordEnabled"
          class="record-input"
          v-model="form.desc"
          placeholder="填写每次打卡记录内容"
          maxlength="100"
        />

        <view class="section-row">
          <text class="row-label">提醒</text>
          <switch :checked="form.reminder" color="#E58B88" @change="onReminderToggle" />
        </view>

        <view class="section-row link-row">
          <view class="row-left">
            <text class="row-label">打卡特效</text>
            <text class="row-hint">仅在【专业模式】下生效</text>
          </view>
          <text class="link-text">默认效果 ›</text>
        </view>

        <view class="section-row">
          <text class="row-label">打卡后写日志</text>
          <switch :checked="form.journal" color="#E58B88" @change="onJournalToggle" />
        </view>

        <view class="section-row link-row">
          <text class="row-label">打卡后鼓励明信片</text>
          <text class="link-text">每次弹出 ▾</text>
        </view>
      </view>

      <view v-if="isEdit" class="bottom-actions">
        <view class="action-btn end-btn" @tap="onEndGoal">
          <text class="action-icon">⏻</text>
          <text class="action-text">结束目标</text>
        </view>
        <view class="action-btn delete-btn" @tap="onDelete">
          <text class="action-icon">🗑</text>
          <text class="action-text danger">删除目标</text>
        </view>
      </view>

      <view class="scroll-bottom"></view>
    </scroll-view>

    <view v-if="showIconSheet" class="sheet-mask" @tap="showIconSheet = false">
      <view class="sheet-panel" @tap.stop>
        <text class="sheet-title">选择图标</text>
        <view class="icon-grid">
          <view
            v-for="icon in iconList"
            :key="icon"
            class="icon-option"
            :class="{ active: form.icon === icon }"
            @tap="selectIcon(icon)"
          >
            <text class="icon-emoji">{{ icon }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTaskStore, getWeekdayIndex } from '@/utils/taskStore'
import { usePageTheme } from '@/utils/tabBar'
import {
  formatDate,
  addDays,
  formatSlashDate,
  formatFullSlashDate,
  getRelativeDayLabel,
  getDurationDays,
  getWeekdayShort
} from '@/utils/date'

const store = useTaskStore()
const { isDark } = usePageTheme()

const taskId = ref('')
const defaultDate = ref(formatDate(new Date()))
const showIconSheet = ref(false)
const statusBarHeight = ref(20)

const iconList = ['😴', '🏃', '📚', '💪', '☕', '🎯', '🧘', '💧', '🍎', '✍️', '🌅', '🎵']
const commonTasks = ['早睡早起', '运动健身', '阅读学习', '喝水', '冥想放松']
const freqOptions = [
  { key: 'none', label: '不重复' },
  { key: 'weekly', label: '每周固定' },
  { key: 'daily', label: '不限制' }
]
const weekdayOptions = [
  { value: 1, label: '一' },
  { value: 2, label: '二' },
  { value: 3, label: '三' },
  { value: 4, label: '四' },
  { value: 5, label: '五' },
  { value: 6, label: '六' },
  { value: 7, label: '日' }
]

const form = reactive({
  title: '',
  icon: '😴',
  startDate: '',
  endDate: '',
  time: '09:00',
  endTime: '10:00',
  repeatType: 'weekly',
  repeatWeekdays: [1, 2, 3, 4, 5, 6, 7],
  dailyCount: 1,
  recordEnabled: false,
  desc: '',
  reminder: false,
  journal: true
})

const isEdit = computed(() => !!taskId.value)

const startDateMain = computed(() => {
  if (!form.startDate) return '--/--'
  return `${formatSlashDate(form.startDate)} ${getWeekdayShort(form.startDate)}`
})

const startDateSub = computed(() => getRelativeDayLabel(form.startDate) || ' ')

const endDateMain = computed(() => {
  const end = form.endDate || form.startDate
  if (!end) return '----/--/--'
  return `${formatFullSlashDate(end)} ${getWeekdayShort(end)}`
})

const endDateSub = computed(() => {
  const end = form.endDate || form.startDate
  if (!form.startDate || !end) return ' '
  const days = getDurationDays(form.startDate, end)
  return days > 0 ? `持续${days}天` : ' '
})

onLoad((query) => {
  try {
    const sys = uni.getSystemInfoSync()
    statusBarHeight.value = sys.statusBarHeight || 20
  } catch (e) {
    statusBarHeight.value = 20
  }

  defaultDate.value = query.date || formatDate(new Date())
  form.startDate = defaultDate.value
  form.endDate = formatDate(addDays(defaultDate.value, 365))
  form.time = query.time || '09:00'
  form.endTime = query.endTime || '10:00'

  if (query.id) {
    taskId.value = query.id
    loadTask(query.id)
  } else {
    if (query.repeatType) form.repeatType = query.repeatType
    if (query.title) form.title = decodeURIComponent(query.title)
    if (query.icon) form.icon = decodeURIComponent(query.icon)
  }
})

function loadTask(id) {
  const task = store.getTaskById(id)
  if (!task) return
  form.title = task.title
  form.icon = task.icon || '🎯'
  form.startDate = task.startDate || task.date
  form.endDate = task.endDate || formatDate(addDays(task.startDate || task.date, 365))
  form.time = task.time
  form.endTime = task.endTime || '10:00'
  form.repeatType = task.repeatType
  form.repeatWeekdays = task.repeatWeekdays?.length
    ? [...task.repeatWeekdays]
    : [task.repeatWeekday || getWeekdayIndex(task.date)]
  form.dailyCount = task.dailyCount || 1
  form.desc = task.desc || ''
  form.recordEnabled = !!task.desc
  form.reminder = !!task.reminder
  form.journal = task.journal !== false
}

function goBack() {
  uni.navigateBack()
}

function onStartDateChange(e) {
  form.startDate = e.detail.value
  if (form.endDate && form.endDate < form.startDate) {
    form.endDate = form.startDate
  }
}

function onEndDateChange(e) {
  form.endDate = e.detail.value
}

function onTimeChange(e) {
  form.time = e.detail.value
}

function onEndTimeChange(e) {
  form.endTime = e.detail.value
}

function setRepeatType(key) {
  form.repeatType = key
  if (key === 'weekly' && form.repeatWeekdays.length === 0) {
    form.repeatWeekdays = [getWeekdayIndex(form.startDate || defaultDate.value)]
  }
}

function toggleWeekday(value) {
  const idx = form.repeatWeekdays.indexOf(value)
  if (idx >= 0) {
    if (form.repeatWeekdays.length > 1) {
      form.repeatWeekdays.splice(idx, 1)
    }
  } else {
    form.repeatWeekdays.push(value)
    form.repeatWeekdays.sort((a, b) => a - b)
  }
}

function changeDailyCount(delta) {
  form.dailyCount = Math.max(1, Math.min(99, form.dailyCount + delta))
}

function onRecordToggle(e) {
  form.recordEnabled = e.detail.value
  if (!form.recordEnabled) form.desc = ''
}

function onReminderToggle(e) {
  form.reminder = e.detail.value
}

function onJournalToggle(e) {
  form.journal = e.detail.value
}

function showCommonPicker() {
  uni.showActionSheet({
    itemList: commonTasks,
    success(res) {
      form.title = commonTasks[res.tapIndex]
      const iconMap = { 0: '😴', 1: '💪', 2: '📚', 3: '💧', 4: '🧘' }
      form.icon = iconMap[res.tapIndex] || '🎯'
    }
  })
}

function selectIcon(icon) {
  form.icon = icon
  showIconSheet.value = false
}

function compareTime(a, b) {
  const [ah, am] = a.split(':').map(Number)
  const [bh, bm] = b.split(':').map(Number)
  return ah !== bh ? ah - bh : am - bm
}

function buildPayload() {
  return {
    title: form.title.trim(),
    icon: form.icon,
    date: form.startDate,
    startDate: form.startDate,
    endDate: form.endDate,
    time: form.time,
    endTime: form.endTime,
    repeatType: form.repeatType,
    repeatWeekdays: form.repeatType === 'weekly' ? [...form.repeatWeekdays] : [],
    dailyCount: form.dailyCount,
    desc: form.recordEnabled ? form.desc.trim() : '',
    reminder: form.reminder,
    journal: form.journal
  }
}

function onSubmit() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入目标名称', icon: 'none' })
    return
  }
  if (compareTime(form.endTime, form.time) <= 0) {
    uni.showToast({ title: '结束时间须晚于开始时间', icon: 'none' })
    return
  }
  if (form.repeatType === 'weekly' && form.repeatWeekdays.length === 0) {
    uni.showToast({ title: '请选择重复星期', icon: 'none' })
    return
  }

  const payload = buildPayload()
  if (isEdit.value) {
    store.updateTask(taskId.value, payload)
    uni.showToast({ title: '已保存', icon: 'success' })
  } else {
    store.addTask(payload)
    uni.showToast({ title: '添加成功', icon: 'success' })
  }
  setTimeout(() => uni.navigateBack(), 400)
}

function onEndGoal() {
  uni.showModal({
    title: '结束目标',
    content: '将结束日期设为今天，确定吗？',
    confirmColor: '#E58B88',
    success(res) {
      if (res.confirm) {
        store.updateTask(taskId.value, { endDate: formatDate(new Date()) })
        uni.showToast({ title: '已结束', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 400)
      }
    }
  })
}

function onDelete() {
  uni.showModal({
    title: '删除目标',
    content: '确定要删除这个目标吗？',
    confirmColor: '#E58B88',
    success(res) {
      if (res.confirm) {
        store.deleteTask(taskId.value)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 400)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.edit-page {
  min-height: 100vh;
  background: var(--theme-bg, #d5e0c1);
  display: flex;
  flex-direction: column;
}

.status-bar {
  flex-shrink: 0;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 28rpx 20rpx;
  flex-shrink: 0;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  font-size: 44rpx;
  color: #8a7358;
  font-weight: 300;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--theme-text, #5a5a48);
}

.nav-confirm {
  padding: 14rpx 36rpx;
  background: #e58b88;
  color: #fff;
  font-size: 28rpx;
  border-radius: 999rpx;
  font-weight: 500;
}

.scroll-body {
  flex: 1;
  height: 0;
}

.form-card {
  margin: 0 24rpx;
  background: #fff;
  border-radius: 32rpx 32rpx 24rpx 24rpx;
  padding: 8rpx 0 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(90, 90, 72, 0.1);
}

.theme-dark .form-card {
  background: var(--theme-card, #363b30);
}

.name-row {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  gap: 16rpx;
}

.pencil-icon {
  font-size: 36rpx;
  color: #8a7358;
}

.name-input {
  flex: 1;
  font-size: 32rpx;
  color: var(--theme-text, #5a5a48);
}

.common-btn {
  padding: 8rpx 24rpx;
  border: 1rpx solid #d4cfc0;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #8a8a78;
  flex-shrink: 0;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0ea;

  &.multi {
    align-items: flex-start;
  }

  &.link-row {
    padding-right: 28rpx;
  }
}

.theme-dark .section-row {
  border-top-color: var(--theme-border, #4a5044);
}

.row-label {
  font-size: 30rpx;
  color: var(--theme-text, #5a5a48);
}

.row-left {
  flex: 1;
}

.label-line {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.lock-icon {
  font-size: 24rpx;
}

.row-hint {
  display: block;
  font-size: 22rpx;
  color: var(--theme-text-muted, #a8a896);
  margin-top: 6rpx;
}

.icon-picker {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: #f1f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-dark .icon-box {
  background: var(--theme-input-bg, #3a4034);
}

.icon-emoji {
  font-size: 44rpx;
  line-height: 1;
}

.arrow-down {
  font-size: 20rpx;
  color: #a8a896;
}

.date-range {
  display: flex;
  padding: 16rpx 24rpx 8rpx;
  gap: 0;
}

.date-box {
  flex: 1;
  background: #f1f5e9;
  padding: 24rpx 20rpx;
  min-height: 140rpx;

  &.start {
    border-radius: 20rpx 0 0 20rpx;
    clip-path: polygon(0 0, 92% 0, 100% 100%, 0 100%);
    padding-right: 32rpx;
  }

  &.end {
    border-radius: 0 20rpx 20rpx 0;
    clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%);
    margin-left: -16rpx;
    padding-left: 36rpx;
  }
}

.theme-dark .date-box {
  background: var(--theme-input-bg, #3a4034);
}

.date-label {
  display: block;
  font-size: 22rpx;
  color: var(--theme-text-secondary, #8a8a78);
  margin-bottom: 8rpx;
}

.date-main {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--theme-text, #5a5a48);
  margin-bottom: 4rpx;
}

.date-sub {
  display: block;
  font-size: 22rpx;
  color: var(--theme-text-muted, #a8a896);
  min-height: 30rpx;
}

.time-range {
  display: flex;
  align-items: center;
  padding: 12rpx 32rpx 20rpx;
  gap: 16rpx;
}

.time-box {
  flex: 1;
  background: #f1f5e9;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  text-align: center;
}

.theme-dark .time-box {
  background: var(--theme-input-bg, #3a4034);
}

.time-label {
  display: block;
  font-size: 22rpx;
  color: var(--theme-text-secondary, #8a8a78);
}

.time-value {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--theme-text, #5a5a48);
  margin-top: 4rpx;
}

.time-sep {
  color: var(--theme-text-muted, #a8a896);
  font-size: 28rpx;
}

.divider {
  height: 1rpx;
  background: #f0f0ea;
  margin: 8rpx 32rpx;
}

.theme-dark .divider {
  background: var(--theme-border, #4a5044);
}

.section-block {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0ea;
}

.theme-dark .section-block {
  border-top-color: var(--theme-border, #4a5044);
}

.freq-tabs {
  display: flex;
  background: #f1f5e9;
  border-radius: 16rpx;
  padding: 6rpx;
  margin-top: 20rpx;
}

.theme-dark .freq-tabs {
  background: var(--theme-input-bg, #3a4034);
}

.freq-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 18rpx 8rpx;
  border-radius: 12rpx;
  transition: background 0.2s;

  &.active {
    background: #f5d9b9;
  }
}

.freq-icon {
  font-size: 22rpx;
}

.freq-text {
  font-size: 26rpx;
  color: var(--theme-text, #5a5a48);
}

.weekdays {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
  gap: 8rpx;
}

.weekday-pill {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: #f1f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: var(--theme-text-secondary, #8a8a78);

  &.active {
    background: #f5d9b9;
    color: var(--theme-text, #5a5a48);
    font-weight: 600;
  }
}

.theme-dark .weekday-pill {
  background: var(--theme-input-bg, #3a4034);

  &.active {
    background: var(--theme-accent-soft, #8a7358);
  }
}

.stepper {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #f1f5e9;
  border-radius: 12rpx;
  padding: 8rpx 16rpx;
}

.theme-dark .stepper {
  background: var(--theme-input-bg, #3a4034);
}

.step-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: var(--theme-text-secondary, #8a8a78);
}

.step-num {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--theme-text, #5a5a48);
  min-width: 40rpx;
  text-align: center;
}

.record-input {
  margin: 0 32rpx 16rpx;
  padding: 20rpx 24rpx;
  background: #f1f5e9;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: var(--theme-text, #5a5a48);
}

.theme-dark .record-input {
  background: var(--theme-input-bg, #3a4034);
}

.link-text {
  font-size: 26rpx;
  color: var(--theme-text-secondary, #8a8a78);
}

.bottom-actions {
  margin: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(90, 90, 72, 0.06);
}

.theme-dark .action-btn {
  background: var(--theme-card, #363b30);
}

.action-icon {
  font-size: 32rpx;
}

.action-text {
  font-size: 30rpx;
  color: var(--theme-text, #5a5a48);

  &.danger {
    color: #c96a6a;
  }
}

.scroll-bottom {
  height: 48rpx;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.sheet-panel {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
}

.theme-dark .sheet-panel {
  background: var(--theme-card, #363b30);
}

.sheet-title {
  display: block;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--theme-text, #5a5a48);
  margin-bottom: 24rpx;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
}

.icon-option {
  width: 100rpx;
  height: 100rpx;
  border-radius: 24rpx;
  background: #f1f5e9;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background: #f5d9b9;
    box-shadow: 0 0 0 3rpx #e58b88;
  }
}
</style>
