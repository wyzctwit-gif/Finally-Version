<template>
  <div class="admin">
    <div class="header">
      <router-link to="/" class="back-btn">← 返回</router-link>
      <h2>管理员后台</h2>
    </div>

    <div v-if="!isLoggedIn" class="login">
      <div class="login-form">
        <h3>管理员登录</h3>
        <div class="form-group">
          <label>管理员密钥</label>
          <input
            v-model="adminKey"
            type="password"
            placeholder="请输入管理员密钥"
            @keyup.enter="handleLogin"
          />
        </div>
        <button @click="handleLogin" class="btn primary">登录</button>
      </div>
    </div>

    <div v-else class="dashboard">
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总订单数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.today }}</div>
          <div class="stat-label">今日订单</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待接单</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>

      <div class="actions">
        <button @click="loadOrders" class="btn secondary">刷新订单</button>
        <button @click="handleExpireOrders" class="btn danger">清理过期订单</button>
      </div>

      <div class="filters">
        <select v-model="filters.status" @change="loadOrders">
          <option value="">全部状态</option>
          <option value="待接单">待接单</option>
          <option value="已接单">已接单</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="已取消">已取消</option>
        </select>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else class="orders">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <div class="order-header">
            <span class="task-type">{{ order.task_type }}</span>
            <span class="status" :class="order.status">{{ order.status }}</span>
          </div>

          <div class="order-body">
            <div class="info-row">
              <span class="label">订单ID:</span>
              <span class="id">{{ order.id }}</span>
            </div>
            <div class="info-row">
              <span class="label">取件:</span>
              <span>{{ order.pickup_location }}</span>
            </div>
            <div class="info-row">
              <span class="label">送达:</span>
              <span>{{ order.delivery_location }}</span>
            </div>
            <div class="info-row">
              <span class="label">报酬:</span>
              <span class="reward">¥{{ order.reward_amount }}</span>
            </div>
            <div class="info-row">
              <span class="label">发布者联系方式:</span>
              <span>{{ order.publisher_contact }}</span>
            </div>
            <div v-if="order.acceptor_contact" class="info-row">
              <span class="label">接单者联系方式:</span>
              <span>{{ order.acceptor_contact }}</span>
            </div>
            <div class="info-row">
              <span class="label">发布时间:</span>
              <span>{{ formatTime(order.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="orders.length > 0" class="pagination">
        <button
          :disabled="pagination.page === 1"
          @click="pagination.page--; loadOrders()"
          class="btn secondary"
        >
          上一页
        </button>
        <span>第 {{ pagination.page }} 页</span>
        <button
          :disabled="orders.length < pagination.limit"
          @click="pagination.page++; loadOrders()"
          class="btn secondary"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { adminApi } from '../api';

const isLoggedIn = ref(false);
const adminKey = ref('');
const loading = ref(false);
const stats = ref({
  total: 0,
  today: 0,
  pending: 0,
  completed: 0
});
const orders = ref([]);
const filters = reactive({
  status: ''
});
const pagination = reactive({
  page: 1,
  limit: 20
});

const handleLogin = () => {
  if (!adminKey.value) {
    alert('请输入管理员密钥');
    return;
  }

  // 验证密钥
  localStorage.setItem('adminKey', adminKey.value);
  isLoggedIn.value = true;
  loadStats();
  loadOrders();
};

const loadStats = async () => {
  try {
    const key = localStorage.getItem('adminKey');
    const response = await adminApi.getStats(key);
    stats.value = response.data;
  } catch (error) {
    console.error('加载统计数据失败:', error);
    if (error.response?.status === 401) {
      alert('管理员密钥无效');
      localStorage.removeItem('adminKey');
      isLoggedIn.value = false;
    }
  }
};

const loadOrders = async () => {
  loading.value = true;

  try {
    const key = localStorage.getItem('adminKey');
    const response = await adminApi.getOrders(
      {
        status: filters.status,
        page: pagination.page,
        limit: pagination.limit
      },
      key
    );
    orders.value = response.data.orders;
  } catch (error) {
    console.error('加载订单失败:', error);
    if (error.response?.status === 401) {
      alert('管理员密钥无效');
      localStorage.removeItem('adminKey');
      isLoggedIn.value = false;
    }
  } finally {
    loading.value = false;
  }
};

const handleExpireOrders = async () => {
  if (!confirm('确定要清理过期订单吗？')) return;

  try {
    const key = localStorage.getItem('adminKey');
    await adminApi.expireOrders(key);
    alert('过期订单已清理');
    loadStats();
    loadOrders();
  } catch (error) {
    console.error('清理失败:', error);
    alert('清理失败');
  }
};

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

onMounted(() => {
  const key = localStorage.getItem('adminKey');
  if (key) {
    adminKey.value = key;
    isLoggedIn.value = true;
    loadStats();
    loadOrders();
  }
});
</script>

<style scoped>
.admin {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  color: #667eea;
  text-decoration: none;
  margin-right: 15px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
}

.login {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.login-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h3 {
  margin: 0 0 20px 0;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
}

.filters select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.orders {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.task-type {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.待接单 {
  background: #fff3cd;
  color: #856404;
}

.status.已接单 {
  background: #d1ecf1;
  color: #0c5460;
}

.status.进行中 {
  background: #d4edda;
  color: #155724;
}

.status.已完成 {
  background: #d4edda;
  color: #155724;
}

.status.已取消 {
  background: #f8d7da;
  color: #721c24;
}

.order-body {
  font-size: 14px;
  color: #666;
}

.info-row {
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #999;
  margin-right: 8px;
}

.id {
  font-family: monospace;
  font-size: 12px;
  color: #999;
}

.reward {
  font-weight: bold;
  color: #f5576c;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
}

.btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.btn.danger {
  background: #f5576c;
  color: white;
}
</style>
