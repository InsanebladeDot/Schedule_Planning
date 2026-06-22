<template>
  <view class="swipe-wrap">
    <view class="swipe-action action-done" @tap.stop="onDone">
      <AppIcon name="done" color="#FFFFFF" :size="36" />
      <text class="action-text">完成</text>
    </view>
    <view
      class="swipe-content"
      :class="{ dragging: isDragging }"
      :style="{ transform: `translateX(${offsetX}px)` }"
      @touchstart="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @tap="onTap"
    >
      <slot />
    </view>
    <view class="swipe-action action-delete" @tap.stop="onDelete">
      <AppIcon name="trash" color="#FFFFFF" :size="36" />
      <text class="action-text">删除</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  taskId: { type: String, required: true }
})

const emit = defineEmits(['toggle', 'delete', 'tap'])

const offsetX = ref(0)
const startX = ref(0)
const startY = ref(0)
const startOffset = ref(0)
const isDragging = ref(false)
const moved = ref(false)
const ACTION_WIDTH = uni.upx2px(160)

function onTouchStart(e) {
  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
  startOffset.value = offsetX.value
  isDragging.value = false
  moved.value = false
}

function onTouchMove(e) {
  const dx = e.touches[0].clientX - startX.value
  const dy = e.touches[0].clientY - startY.value

  if (!isDragging.value && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
    isDragging.value = true
  }
  if (!isDragging.value) return

  moved.value = true
  let next = startOffset.value + dx
  if (next > ACTION_WIDTH) next = ACTION_WIDTH
  if (next < -ACTION_WIDTH) next = -ACTION_WIDTH
  offsetX.value = next
}

function onTouchEnd() {
  isDragging.value = false
  if (offsetX.value > ACTION_WIDTH / 2) {
    offsetX.value = ACTION_WIDTH
  } else if (offsetX.value < -ACTION_WIDTH / 2) {
    offsetX.value = -ACTION_WIDTH
  } else {
    offsetX.value = 0
  }
  setTimeout(() => {
    moved.value = false
  }, 80)
}

function resetOffset() {
  offsetX.value = 0
}

function onDone() {
  emit('toggle', props.taskId)
  resetOffset()
}

function onDelete() {
  emit('delete', props.taskId)
  resetOffset()
}

function onTap() {
  if (moved.value || Math.abs(offsetX.value) > 5) {
    if (offsetX.value !== 0) resetOffset()
    return
  }
  emit('tap', props.taskId)
}

defineExpose({ resetOffset })
</script>

<style lang="scss" scoped>
.swipe-wrap {
  position: relative;
  overflow: hidden;
  border-radius: var(--theme-radius, 16rpx);
  margin-bottom: 20rpx;
}

.swipe-action {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.action-done {
  left: 0;
  background: #e58b88;
}

.action-delete {
  right: 0;
  background: #e57373;
}

.action-text {
  font-size: 22rpx;
  color: #fff;
}

.swipe-content {
  position: relative;
  z-index: 1;
  transition: transform 0.22s ease;
  background: var(--theme-card, #fff);
  border-radius: var(--theme-radius, 16rpx);
  box-shadow: var(--theme-shadow, 0 2rpx 16rpx rgba(0, 0, 0, 0.05));
  border: 1rpx solid var(--theme-border, #e5e5ea);

  &.dragging {
    transition: none;
  }
}
</style>
