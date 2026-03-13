<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" :class="['toast', toastType]">
        <span class="toast-message">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const message = ref('');
const toastType = ref('info');
let timer = null;

const show = (msg, type = 'info', duration = 3000) => {
  // Clear any existing timer
  if (timer) {
    clearTimeout(timer);
  }

  message.value = msg;
  toastType.value = type;
  visible.value = true;

  timer = setTimeout(() => {
    visible.value = false;
  }, duration);
};

const success = (msg, duration = 3000) => {
  show(msg, 'success', duration);
};

const error = (msg, duration = 3000) => {
  show(msg, 'error', duration);
};

const info = (msg, duration = 3000) => {
  show(msg, 'info', duration);
};

// Expose methods for parent components
defineExpose({
  show,
  success,
  error,
  info
});
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  text-align: center;
}

.toast.success {
  background: #10b981;
  color: white;
}

.toast.error {
  background: #ef4444;
  color: white;
}

.toast.info {
  background: #3b82f6;
  color: white;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
