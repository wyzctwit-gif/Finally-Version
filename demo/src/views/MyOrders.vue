<template>
  <div class="my-orders-page">
    <div class="page-container">
      <!-- 页面头部 -->
      <header class="page-header animate-fade-in-down">
        <h1 class="page-title">我的订单</h1>
        
        <!-- Tab 切换 - 卡片式 -->
        <div class="tab-card">
          <button
            :class="['tab-btn', { active: activeTab === 'published' }]"
            @click="activeTab = 'published'"
          >
            <span class="tab-label">我发布的</span>
            <span class="tab-count" v-if="publishedOrders.length > 0">{{ publishedOrders.length }}</span>
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'accepted' }]"
            @click="activeTab = 'accepted'"
          >
            <span class="tab-label">我接单的</span>
            <span class="tab-count" v-if="acceptedOrders.length > 0">{{ acceptedOrders.length }}</span>
          </button>
          <div class="tab-indicator" :style="{ transform: activeTab === 'published' ? 'translateX(0)' : 'translateX(100%)' }"></div>
        </div>
      </header>

      <!-- 订单列表 -->
      <div class="orders-list">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="currentOrders.length === 0" class="empty-state animate-fade-in-up">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="empty-title">{{ activeTab === 'published' ? '暂无发布的订单' : '暂无接单记录' }}</h3>
          <p class="empty-desc">
            {{ activeTab === 'published' ? '去发布一个代取任务吧' : '去浏览待接订单，赚取零花钱' }}
          </p>
          <button
            v-if="activeTab === 'published'"
            class="btn btn-primary"
            @click="handlePublish"
          >
            发布代取
          </button>
        </div>

        <!-- 列表内容 -->
        <transition-group name="list" tag="div" class="list-wrapper" v-else>
          <div
            v-for="(order, index) in currentOrders"
            :key="order.id"
            class="order-card"
            @click="viewDetail(order.id)"
          >
            <div class="card-status-bar" :class="getStatusClass(order.status)"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="type-tag" :class="getTypeClass(order.task_type)">
                  {{ order.task_type }}
                </div>
                <div class="status-tag" :class="getStatusClass(order.status)">
                  {{ order.status }}
                </div>
              </div>
              
              <div class="card-route">
                <div class="route-item">
                  <div class="dot pickup"></div>
                  <span class="address">{{ order.pickup_location }}</span>
                </div>
                <div class="route-line"></div>
                <div class="route-item">
                  <div class="dot delivery"></div>
                  <span class="address">{{ order.delivery_location }}</span>
                </div>
              </div>

              <div class="card-footer">
                <div class="time-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6V12L16 14"/>
                  </svg>
                  <span>{{ formatTimeAgo(order.created_at) }}</span>
                </div>
                <div class="reward-info">
                  <span class="currency">¥</span>
                  <span class="amount">{{ order.reward_amount }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineExpose, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { orderApi } from '../api';

const router = useRouter();
const emit = defineEmits(['open-detail']);

const loading = ref(false);
const activeTab = ref('published');
const publishedOrders = ref([]);
const acceptedOrders = ref([]);

const currentOrders = computed(() => {
  return activeTab.value === 'published' ? publishedOrders.value : acceptedOrders.value;
});

const getUserIds = (type) => JSON.parse(localStorage.getItem(`${type}_ids`) || '[]');

const loadPublishedOrders = async () => {
  loading.value = true;
  try {
    const publisherIds = getUserIds('publisher');
    if (publisherIds.length === 0) { publishedOrders.value = []; return; }
    const promises = publisherIds.map(id => orderApi.getMyPublished(id));
    const responses = await Promise.all(promises);
    const allOrders = responses.flatMap(res => res.data);
    allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    publishedOrders.value = allOrders;
  } catch (error) {
    console.error('加载发布订单失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadAcceptedOrders = async () => {
  loading.value = true;
  try {
    const acceptorIds = getUserIds('acceptor');
    if (acceptorIds.length === 0) { acceptedOrders.value = []; return; }
    const promises = acceptorIds.map(id => orderApi.getMyAccepted(id));
    const responses = await Promise.all(promises);
    const allOrders = responses.flatMap(res => res.data);
    allOrders.sort((a, b) => new Date(b.accepted_at) - new Date(a.accepted_at));
    acceptedOrders.value = allOrders;
  } catch (error) {
    console.error('加载接单记录失败:', error);
  } finally {
    loading.value = false;
  }
};

const refreshOrders = () => {
  if (activeTab.value === 'published') loadPublishedOrders();
  else loadAcceptedOrders();
};

const viewDetail = (id) => {
  const mode = activeTab.value === 'published' ? 'published' : 'accepted';
  emit('open-detail', id, mode);
};

const handlePublish = () => {
  router.push({ name: 'Publish' });
};

const showContact = (order) => {
  if (activeTab.value === 'published') {
    return (order.status === '已接单' || order.status === '进行中') && order.acceptor_contact;
  }
  return activeTab.value === 'accepted' && order.publisher_contact;
};

const getStatusClass = (status) => {
  const map = { '待接单': 'pending', '已接单': 'accepted', '进行中': 'progress', '已完成': 'completed', '已取消': 'cancelled' };
  return map[status] || '';
};

const getTypeClass = (type) => {
  const map = { '快递代取': 'type-express', '外卖代取': 'type-food', '其他跑腿': 'type-other' };
  return map[type] || 'type-default';
};

const formatTimeAgo = (time) => {
  const now = new Date();
  const date = new Date(time.endsWith('Z') ? time : time + 'Z');
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
};

watch(activeTab, () => refreshOrders());
defineExpose({ refreshOrders });
onMounted(() => { loadPublishedOrders(); });
</script>

<style scoped>
.my-orders-page {
  background: var(--slate-50);
  min-height: calc(100vh - 60px);
  padding-bottom: 80px;
}

.page-container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-4);
}

.page-header {
  margin-bottom: var(--space-6);
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--slate-900);
  margin-bottom: var(--space-4);
  padding-left: var(--space-2);
}

/* Tab 切换 - 卡片式 */
.tab-card {
  display: flex;
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: 4px;
  position: relative;
  box-shadow: var(--shadow-sm);
}

.tab-btn {
  flex: 1;
  position: relative;
  z-index: 2;
  border: none;
  background: transparent;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--slate-500);
  cursor: pointer;
  transition: color var(--duration-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab-btn.active {
  color: var(--slate-900);
}

.tab-count {
  background: var(--slate-100);
  color: var(--slate-600);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.tab-btn.active .tab-count {
  background: var(--primary-500);
  color: #000000;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: var(--primary-100);
  border-radius: var(--radius-lg);
  transition: transform var(--duration-normal) var(--ease-spring);
  z-index: 1;
}

/* 列表样式 */
.list-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.order-card {
  background: #FFFFFF;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  position: relative;
  transition: all var(--duration-fast);
  cursor: pointer;
  border: 1px solid transparent;
}

.order-card:active {
  transform: scale(0.98);
}

.card-status-bar {
  width: 6px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
}

.card-status-bar.pending { background: var(--warning); }
.card-status-bar.accepted { background: var(--info); }
.card-status-bar.progress { background: var(--primary-500); }
.card-status-bar.completed { background: var(--success); }
.card-status-bar.cancelled { background: var(--slate-300); }

.card-content {
  padding: var(--space-4) var(--space-4) var(--space-4) var(--space-6);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.type-tag {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--slate-100);
  color: var(--slate-600);
}

.type-tag.type-express { color: #1D4ED8; background: #EFF6FF; }
.type-tag.type-food { color: #B45309; background: #FFFBEB; }
.type-tag.type-other { color: #4338CA; background: #EEF2FF; }

.status-tag {
  font-size: 12px;
  font-weight: 600;
}

.status-tag.pending { color: var(--warning); }
.status-tag.accepted { color: var(--info); }
.status-tag.progress { color: var(--primary-600); }
.status-tag.completed { color: var(--success); }
.status-tag.cancelled { color: var(--slate-400); }

.card-route {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.route-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.dot.pickup { background: var(--slate-900); }
.dot.delivery { background: var(--primary-500); }

.route-line {
  position: absolute;
  left: 27px; /* Adjust based on padding + dot center */
  top: 60px;
  bottom: 60px;
  width: 2px;
  background: var(--slate-100);
  z-index: 1;
}

.address {
  font-size: 14px;
  color: var(--slate-800);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px dashed var(--slate-100);
}

.time-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--slate-400);
}

.time-info svg {
  width: 14px;
  height: 14px;
}

.reward-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 12px;
  font-weight: 600;
  color: var(--slate-900);
}

.amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--slate-900);
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 空状态优化 */
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  color: var(--slate-200);
}

.empty-title {
  font-size: 16px;
  color: var(--slate-600);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--slate-400);
  margin-bottom: 24px;
}
</style>
