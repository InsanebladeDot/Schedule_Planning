<template>
  <view class="tab-icon" :class="[name, { active }]" :style="iconStyle" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  active: { type: Boolean, default: false },
  size: { type: Number, default: 22 }
})

const iconStyle = computed(() => ({
  width: props.size + 'px',
  height: props.size + 'px',
  '--icon-color': props.active ? '#1A1A1A' : '#B0B0B0'
}))
</script>

<style scoped>
.tab-icon {
  position: relative;
  display: block;
  flex-shrink: 0;
  color: var(--icon-color);
}

.tab-icon.active {
  --icon-color: #1A1A1A;
}

:global(.theme-dark) .tab-icon.active {
  --icon-color: #F2F2F7;
}

:global(.theme-dark) .tab-icon:not(.active) {
  --icon-color: #636366;
}

/* 日历 */
.tab-icon.calendar::before {
  content: '';
  position: absolute;
  inset: 2px 1px 1px;
  border: 2px solid var(--icon-color);
  border-radius: 3px;
}

.tab-icon.calendar::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 2px;
  right: 2px;
  height: 2px;
  background: var(--icon-color);
}

/* 时钟 */
.tab-icon.clock::before {
  content: '';
  position: absolute;
  inset: 1px;
  border: 2px solid var(--icon-color);
  border-radius: 50%;
}

.tab-icon.clock::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 6px;
  background: var(--icon-color);
  transform: translate(-50%, -90%);
  border-radius: 1px;
  box-shadow: 4px 3px 0 0 var(--icon-color);
}

/* 用户 */
.tab-icon.user::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 50%;
  width: 8px;
  height: 8px;
  border: 2px solid var(--icon-color);
  border-radius: 50%;
  transform: translateX(-50%);
}

.tab-icon.user::after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: 50%;
  width: 14px;
  height: 7px;
  border: 2px solid var(--icon-color);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  transform: translateX(-50%);
}
</style>
