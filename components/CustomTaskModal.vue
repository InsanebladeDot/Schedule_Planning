<template>
  <view v-if="visible" class="sheet-mask" @tap="onClose">
    <view class="sheet-panel" :class="{ 'theme-dark': isDark }" @tap.stop>
      <view class="sheet-handle"></view>
      <text class="sheet-title">定制任务</text>
      <text class="sheet-sub">快速创建，也可进入高级定制</text>

      <view class="icon-row">
        <view
          v-for="icon in iconList"
          :key="icon"
          class="icon-option"
          :class="{ active: form.icon === icon }"
          @tap="form.icon = icon"
        >
          <text class="icon-emoji">{{ icon }}</text>
        </view>
      </view>

      <view class="field">
        <text class="field-label">任务名称</text>
        <input
          class="field-input"
          v-model="form.title"
          placeholder="如：早睡早起、学习日语"
          maxlength="50"
        />
      </view>

      <view class="field">
        <text class="field-label">重复频率</text>
        <view class="freq-row">
          <view
            v-for="opt in freqOptions"
            :key="opt.key"
            class="freq-chip"
            :class="{ active: form.repeatType === opt.key }"
            @tap="form.repeatType = opt.key"
          >
            {{ opt.label }}
          </view>
        </view>
      </view>

      <view class="field">
        <text class="field-label">提醒时间</text>
        <picker mode="time" :value="form.time" @change="onTimeChange">
          <view class="time-picker">{{ form.time }}</view>
        </picker>
      </view>

      <view class="actions">
        <view class="btn-advanced" @tap="goAdvanced">高级定制 ›</view>
        <view class="btn-confirm check-bounce" @tap="onSubmit">完成定制</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { themeState } from '@/utils/theme'

const props = defineProps({
  visible: { type: Boolean, default: false },
  date: { type: String, default: '' },
  defaultTime: { type: String, default: '09:00' }
})

const emit = defineEmits(['close', 'submit', 'advanced'])
const isDark = computed(() => themeState.darkMode)

const iconList = ['😴', '📚', '🏃', '💪', '🎯', '🧘', '💧', '☕']
const freqOptions = [
  { key: 'none', label: '不重复' },
  { key: 'weekly', label: '每周' },
  { key: 'daily', label: '每天' }
]

const form = reactive({
  title: '',
  icon: '🎯',
  repeatType: 'weekly',
  time: '09:00',
  endTime: '10:00'
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.title = ''
      form.icon = '🎯'
      form.repeatType = 'weekly'
      form.time = props.defaultTime || '09:00'
      form.endTime = '10:00'
    }
  }
)

function onTimeChange(e) {
  form.time = e.detail.value
  const [h] = e.detail.value.split(':').map(Number)
  form.endTime = `${String(Math.min(h + 1, 23)).padStart(2, '0')}:00`
}

function onClose() {
  emit('close')
}

function goAdvanced() {
  emit('advanced', { ...form })
}

function onSubmit() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入任务名称', icon: 'none' })
    return
  }
  emit('submit', {
    title: form.title.trim(),
    icon: form.icon,
    repeatType: form.repeatType,
    time: form.time,
    endTime: form.endTime,
    weeklyRepeat: form.repeatType === 'weekly',
    dailyRepeat: form.repeatType === 'daily'
  })
}
</script>

<style lang="scss" scoped>
.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(90, 90, 72, 0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.sheet-panel {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 16rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -8rpx 40rpx rgba(90, 90, 72, 0.12);
}

.theme-dark .sheet-panel {
  background: var(--theme-card, #363b30);
}

.sheet-handle {
  width: 64rpx;
  height: 8rpx;
  background: #e8e8dc;
  border-radius: 4rpx;
  margin: 0 auto 20rpx;
}

.sheet-title {
  display: block;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: var(--theme-text, #5a5a48);
}

.sheet-sub {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: var(--theme-text-muted, #a8a896);
  margin: 8rpx 0 28rpx;
}

.icon-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
  margin-bottom: 28rpx;
}

.icon-option {
  width: 88rpx;
  height: 88rpx;
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

.theme-dark .icon-option {
  background: var(--theme-input-bg, #3a4034);

  &.active {
    background: var(--theme-accent-soft, #8a7358);
  }
}

.icon-emoji {
  font-size: 40rpx;
}

.field {
  margin-bottom: 24rpx;
}

.field-label {
  display: block;
  font-size: 26rpx;
  color: var(--theme-text-secondary, #8a8a78);
  margin-bottom: 12rpx;
}

.field-input,
.time-picker {
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 24rpx;
  background: #f1f5e9;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: var(--theme-text, #5a5a48);
}

.theme-dark .field-input,
.theme-dark .time-picker {
  background: var(--theme-input-bg, #3a4034);
}

.freq-row {
  display: flex;
  gap: 16rpx;
}

.freq-chip {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 16rpx;
  background: #f1f5e9;
  font-size: 26rpx;
  color: var(--theme-text-secondary, #8a8a78);

  &.active {
    background: #f5d9b9;
    color: var(--theme-text, #5a5a48);
    font-weight: 600;
  }
}

.theme-dark .freq-chip {
  background: var(--theme-input-bg, #3a4034);

  &.active {
    background: var(--theme-accent-soft, #8a7358);
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 8rpx;
}

.btn-advanced {
  text-align: center;
  font-size: 26rpx;
  color: var(--theme-text-secondary, #8a8a78);
  padding: 16rpx;
}

.btn-confirm {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: #e58b88;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 999rpx;
}
</style>
