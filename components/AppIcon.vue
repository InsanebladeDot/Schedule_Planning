<template>
  <image
    class="app-icon"
    :src="src"
    :style="{ width: sizeRpx, height: sizeRpx }"
    mode="aspectFit"
  />
</template>

<script setup>
import { computed } from 'vue'
import { getIconDataUri } from '@/utils/icons'

const props = defineProps({
  name: { type: String, required: true },
  color: { type: String, default: '#8E8E93' },
  size: { type: Number, default: 40 }
})

const sizeRpx = computed(() => props.size + 'rpx')
const src = computed(() => getIconDataUri(props.name, props.color, 48))
</script>

<style scoped>
.app-icon {
  display: block;
  flex-shrink: 0;
}
</style>
