<template>
  <nav class="tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.key"
      :class="['tab-item', { active: activeTab === tab.key }]"
      @click="handleTabChange(tab.key)"
    >
      <div class="tab-icon-wrapper">
        <component :is="tab.iconComponent" :class="['tab-icon', tab.key]" />
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </div>
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </nav>
</template>

<script setup>
import { defineProps, defineEmits, h } from 'vue';

const props = defineProps({
  activeTab: {
    type: String,
    default: 'home'
  }
});

const emit = defineEmits(['change']);

// Home Icon
const HomeIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 22V12h6v10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
};

// List Icon
const ListIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
};

// User Icon
const UserIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
};

const tabs = [
  { key: 'home', iconComponent: h(HomeIcon), label: '首页', badge: null },
  { key: 'orders', iconComponent: h(ListIcon), label: '订单', badge: null },
  { key: 'my', iconComponent: h(UserIcon), label: '我的', badge: null }
];

const handleTabChange = (key) => {
  if (props.activeTab !== key) {
    emit('change', key);
  }
};
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--slate-200);
  padding: var(--space-2) var(--space-2) calc(var(--space-2) + env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-1);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  border-radius: var(--radius-md);
  position: relative;
}

.tab-item:hover {
  background: var(--slate-50);
}

.tab-item:active {
  transform: scale(0.95);
}

.tab-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon {
  width: 24px;
  height: 24px;
  color: var(--slate-400);
  transition: all var(--duration-normal) var(--ease-out);
}

.tab-item.active .tab-icon {
  color: var(--primary-600);
}

.tab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  background: var(--danger);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--slate-400);
  transition: all var(--duration-fast) var(--ease-out);
}

.tab-item.active .tab-label {
  color: var(--primary-600);
  font-weight: 600;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .tab-bar {
    background: rgba(30, 41, 59, 0.95);
    border-top-color: var(--slate-700);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.2);
  }

  .tab-item:hover {
    background: var(--slate-800);
  }
}
</style>
