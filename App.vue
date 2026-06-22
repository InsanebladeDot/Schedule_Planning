<script>
import { initStore } from './utils/taskStore'

export default {
  onLaunch() {
    initStore()
  }
}
</script>

<style lang="scss">
@import './uni.scss';

page {
  --theme-bg: #d5e0c1;
  --theme-card: #ffffff;
  --theme-text: #5a5a48;
  --theme-text-secondary: #8a8a78;
  --theme-text-muted: #a8a896;
  --theme-accent: #e58b88;
  --theme-accent-soft: #f5d9b9;
  --theme-input-bg: #f1f5e9;
  --theme-border: #e8e8dc;
  --theme-radius: 24rpx;
  --theme-shadow: 0 4rpx 24rpx rgba(90, 90, 72, 0.08);

  background-color: var(--theme-bg);
  transition: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: var(--theme-text);
  box-sizing: border-box;
}

page.theme-dark,
.theme-dark {
  --theme-bg: #2a2e24;
  --theme-card: #363b30;
  --theme-text: #e8e6dc;
  --theme-text-secondary: #a8a896;
  --theme-text-muted: #7a7a6a;
  --theme-accent: #e58b88;
  --theme-accent-soft: #8a7358;
  --theme-input-bg: #3a4034;
  --theme-border: #4a5044;
  --theme-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.35);
}

view,
text,
button,
input {
  box-sizing: border-box;
}

.card {
  background: var(--theme-card);
  border-radius: var(--theme-radius);
  box-shadow: var(--theme-shadow);
  border: 1rpx solid var(--theme-border);
}

.page-root {
  min-height: 100vh;
  background: var(--theme-bg);
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
  transition: none;
}

.page-root.theme-dark {
  --theme-bg: #2a2e24;
  --theme-card: #363b30;
  --theme-text: #e8e6dc;
  --theme-text-secondary: #a8a896;
  --theme-text-muted: #7a7a6a;
  --theme-accent: #e58b88;
  --theme-accent-soft: #8a7358;
  --theme-input-bg: #3a4034;
  --theme-border: #4a5044;
  --theme-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.35);
}

.fade-in {
  animation: none;
}

.slide-in {
  animation: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(16rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes strikeThrough {
  from {
    color: var(--theme-text);
  }
  to {
    color: var(--theme-text-muted);
  }
}

.task-done-anim {
  animation: strikeThrough 0.3s ease forwards;
  text-decoration: line-through;
  text-decoration-color: var(--theme-text-muted);
}

.check-bounce {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.check-bounce:active {
  transform: scale(0.88);
}
</style>
