<template>
  <div id="app">
    <div class="app-container">
      <div class="main-content">
        <Home
          v-show="activeTab === 'home'"
          @open-publish="openPublishModal"
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
      </div>

      <TabBar :active-tab="activeTab" @change="handleTabChange" />

      <!-- 发布弹窗 -->
      <transition name="modal">
        <div v-if="showPublishModal" class="modal-overlay" @click="closePublishModal">
          <div class="modal-container" @click.stop>
            <PublishModal
              :visible="showPublishModal"
              @close="closePublishModal"
              @success="handlePublishSuccess"
            />
          </div>
        </div>
      </transition>

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
import { ref, reactive } from 'vue';
import TabBar from './components/TabBar.vue';
import Home from './views/Home.vue';
import OrderList from './views/OrderList.vue';
import MyOrders from './views/MyOrders.vue';
import PublishModal from './components/PublishModal.vue';
import OrderDetailModal from './components/OrderDetailModal.vue';

const activeTab = ref('home');
const showPublishModal = ref(false);
const showDetailModal = ref(false);
const selectedOrderId = ref(null);
const detailMode = ref('accept');

const orderListRef = ref(null);
const myOrdersRef = ref(null);

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const switchTab = (tab) => {
  activeTab.value = tab;
};

const openPublishModal = () => {
  showPublishModal.value = true;
};

const closePublishModal = () => {
  showPublishModal.value = false;
};

const handlePublishSuccess = () => {
  activeTab.value = 'orders';
  showPublishModal.value = false;
  if (orderListRef.value) {
    orderListRef.value.loadOrders();
  }
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
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  animation: modalSlideUp var(--duration-normal) var(--ease-out);
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
