<template>
  <view v-if="visible" class="modal-mask" @tap="onClose">
    <view class="modal-card" :class="{ 'theme-dark': isDark }" @tap.stop>
      <text class="modal-title">{{ title }}</text>

      <view class="form-item">
        <text class="label">任务名称</text>
        <input
          class="input"
          v-model="form.title"
          placeholder="请输入任务名称"
          maxlength="50"
        />
      </view>

      <view v-if="showDesc" class="form-item">
        <text class="label">描述（选填）</text>
        <input
          class="input"
          v-model="form.desc"
          placeholder="任务描述"
          maxlength="100"
        />
      </view>

      <view class="form-item">
        <text class="label">开始时间 - 结束时间</text>
        <view class="time-range">
          <picker mode="time" :value="form.time" @change="onTimeChange">
            <view class="picker-value">{{ form.time }}</view>
          </picker>
          <text class="time-sep">—</text>
          <picker mode="time" :value="form.endTime" @change="onEndTimeChange">
            <view class="picker-value">{{ form.endTime }}</view>
          </picker>
        </view>
      </view>

      <template v-if="showRepeat">
        <view class="form-item switch-row">
          <view class="switch-label-wrap">
            <text class="label inline">每周重复</text>
            <text class="hint">每周这一天同一时间出现</text>
          </view>
          <switch
            :checked="form.weeklyRepeat"
            color="#1A1A1A"
            @change="onWeeklyChange"
          />
        </view>

        <view class="form-item switch-row">
          <view class="switch-label-wrap">
            <text class="label inline">每天重复</text>
            <text class="hint">每天同一时间都会出现</text>
          </view>
          <switch
            :checked="form.dailyRepeat"
            color="#1A1A1A"
            @change="onDailyChange"
          />
        </view>
      </template>

      <view class="modal-actions">
        <button class="btn btn-cancel" @tap="onClose">取消</button>
        <button class="btn btn-confirm" @tap="onSubmit">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { themeState } from '@/utils/theme'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '添加任务' },
  showRepeat: { type: Boolean, default: true },
  showDesc: { type: Boolean, default: false },
  defaultTime: { type: String, default: '09:00' },
  defaultEndTime: { type: String, default: '10:00' }
})

const emit = defineEmits(['close', 'submit'])
const isDark = computed(() => themeState.darkMode)

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const form = reactive({
  title: '',
  desc: '',
  time: '09:00',
  endTime: '10:00',
  weeklyRepeat: false,
  dailyRepeat: false
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.title = ''
      form.desc = ''
      form.time = props.defaultTime
      form.endTime = props.defaultEndTime || '10:00'
      form.weeklyRepeat = false
      form.dailyRepeat = false
    }
  }
)

function onTimeChange(e) {
  form.time = e.detail.value
}

function onEndTimeChange(e) {
  form.endTime = e.detail.value
}

function onWeeklyChange(e) {
  form.weeklyRepeat = e.detail.value
  if (form.weeklyRepeat) form.dailyRepeat = false
}

function onDailyChange(e) {
  form.dailyRepeat = e.detail.value
  if (form.dailyRepeat) form.weeklyRepeat = false
}

function onClose() {
  emit('close')
}

function compareTime(a, b) {
  const [ah, am] = a.split(':').map(Number)
  const [bh, bm] = b.split(':').map(Number)
  return ah !== bh ? ah - bh : am - bm
}

function onSubmit() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入任务名称', icon: 'none' })
    return
  }
  if (!TIME_RE.test(form.time)) {
    uni.showToast({ title: '开始时间格式不正确', icon: 'none' })
    return
  }
  if (!TIME_RE.test(form.endTime)) {
    uni.showToast({ title: '结束时间格式不正确', icon: 'none' })
    return
  }
  if (compareTime(form.endTime, form.time) <= 0) {
    uni.showToast({ title: '结束时间须晚于开始时间', icon: 'none' })
    return
  }
  emit('submit', { ...form })
}
</script>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  width: 620rpx;
  background: var(--theme-card, #ffffff);
  border-radius: 16rpx;
  padding: 40rpx 32rpx 32rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid var(--theme-border, #e5e5ea);
}

.modal-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--theme-text, #1a1a1a);
  text-align: center;
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  font-size: 24rpx;
  color: var(--theme-text-secondary, #8e8e93);
  margin-bottom: 12rpx;

  &.inline {
    margin-bottom: 4rpx;
    font-size: 28rpx;
    color: var(--theme-text, #1a1a1a);
  }
}

.hint {
  display: block;
  font-size: 22rpx;
  color: var(--theme-text-muted, #c7c7cc);
}

.input,
.picker-value {
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 24rpx;
  background: var(--theme-bg, #f5f6f7);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--theme-text, #1a1a1a);
  border: 1rpx solid var(--theme-border, #e5e5ea);
}

.time-range {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.time-range .picker-value {
  flex: 1;
  text-align: center;
}

.time-sep {
  font-size: 28rpx;
  color: var(--theme-text-muted, #c7c7cc);
  flex-shrink: 0;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.switch-label-wrap {
  flex: 1;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 16rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  transition: transform 0.15s ease, opacity 0.15s ease;

  &::after {
    border: none;
  }

  &:active {
    transform: scale(0.97);
    opacity: 0.85;
  }
}

.btn-cancel {
  background: var(--theme-bg, #f5f6f7);
  color: var(--theme-text-secondary, #8e8e93);
  border: 1rpx solid var(--theme-border, #e5e5ea);
}

.btn-confirm {
  background: #1a1a1a;
  color: #fff;
}

.theme-dark .btn-confirm {
  background: #f2f2f7;
  color: #1a1a1a;
}
</style>
