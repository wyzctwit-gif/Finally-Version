<template>
  <div id="app">
    <Toast ref="toastRef" />
    <div class="app-container">
      <div class="main-content">
        <!-- 如果是发布页面，不显示 TabBar 且全屏显示 -->
        <router-view v-if="isPublishPage"></router-view>
        
        <!-- 其他页面显示 TabBar -->
        <template v-else>
          <Home
            v-show="activeTab === 'home'"
            @switch-tab="switchTab"
          />
          <OrderList
            v-show="activeTab === 'orders'"
            ref="orderListRef"
            @open-detail="openOrderDetail"
          />
          <MyOrders
            v-show="activeTab === 'my'"
            ref="myOrdersRef"
            @open-detail="openMyOrderDetail"
          />
        </template>
      </div>

      <TabBar 
        v-if="!isPublishPage" 
        :active-tab="activeTab" 
        @change="handleTabChange" 
      />

      <!-- 订单详情弹窗 -->
      <transition name="modal">
        <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
          <div class="modal-container" @click.stop>
            <OrderDetailModal
              :visible="showDetailModal"
              :order-id="selectedOrderId"
              :mode="detailMode"
              @close="closeDetailModal"
              @refresh="refreshCurrentTab"
            />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TabBar from './components/TabBar.vue';
import Home from './views/Home.vue';
import OrderList from './views/OrderList.vue';
import MyOrders from './views/MyOrders.vue';
import OrderDetailModal from './components/OrderDetailModal.vue';
import Toast from './components/Toast.vue';

const route = useRoute();
const router = useRouter();

const toastRef = ref(null);
const activeTab = ref('home');
const showDetailModal = ref(false);
const selectedOrderId = ref(null);
const detailMode = ref('accept');

const orderListRef = ref(null);
const myOrdersRef = ref(null);

const isPublishPage = computed(() => route.name === 'Publish');

// 提供 Toast 方法给子组件
provide('toast', {
  show: (msg, type, duration) => toastRef.value?.show(msg, type, duration),
  success: (msg) => toastRef.value?.show(msg, 'success'),
  error: (msg) => toastRef.value?.show(msg, 'error'),
  info: (msg) => toastRef.value?.show(msg, 'info')
});

// 监听路由变化更新 activeTab（如果需要支持路由导航到 Tab）
watch(() => route.path, (path) => {
  if (path === '/') activeTab.value = 'home';
  else if (path === '/orders') activeTab.value = 'orders';
  else if (path === '/my-orders') activeTab.value = 'my';
});

const handleTabChange = (tab) => {
  activeTab.value = tab;
  // 可以在这里添加路由跳转逻辑，使 URL 与 Tab 同步
  if (tab === 'home') router.push('/');
  else if (tab === 'orders') router.push('/orders');
  else if (tab === 'my') router.push('/my-orders');
};

const switchTab = (tab) => {
  handleTabChange(tab);
};

const openOrderDetail = (orderId) => {
  selectedOrderId.value = orderId;
  detailMode.value = 'accept';
  showDetailModal.value = true;
};

const openMyOrderDetail = (orderId, mode) => {
  selectedOrderId.value = orderId;
  detailMode.value = mode;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedOrderId.value = null;
};

const refreshCurrentTab = () => {
  if (activeTab.value === 'orders' && orderListRef.value) {
    orderListRef.value.loadOrders();
  } else if (activeTab.value === 'my' && myOrdersRef.value) {
    myOrdersRef.value.refreshOrders();
  }
};
</script>

<style>
/* 导入全局样式 - 已在 style.css 中定义 */
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

/* 模态框过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(20px);
}

/* 模态框覆盖层 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  border-radius: var(--radius-xl);
  animation: modalSlideUp var(--duration-normal) var(--ease-out);
  overflow: hidden;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 滚动条美化 */
.modal-container::-webkit-scrollbar {
  width: 6px;
}

.modal-container::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container::-webkit-scrollbar-thumb {
  background: var(--slate-300);
  border-radius: var(--radius-full);
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: var(--slate-400);
}
</style>
