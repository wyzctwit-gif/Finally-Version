<template>
  <div class="order-detail">
    <div class="header">
      <router-link to="/orders" class="back-btn">← 返回</router-link>
      <h2>订单详情</h2>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="order" class="detail">
      <div class="info-group">
        <div class="info-item">
          <span class="label">任务类型:</span>
          <span>{{ order.task_type }}</span>
        </div>

        <div class="info-item">
          <span class="label">取件地点:</span>
          <span>{{ order.pickup_location }}</span>
        </div>

        <div class="info-item">
          <span class="label">送达地点:</span>
          <span>{{ order.delivery_location }}</span>
        </div>

        <div class="info-item">
          <span class="label">任务描述:</span>
          <span>{{ order.task_description }}</span>
        </div>

        <div class="info-item">
          <span class="label">报酬金额:</span>
          <span class="reward">¥{{ order.reward_amount }}</span>
        </div>

        <div v-if="order.expected_time" class="info-item">
          <span class="label">期望时间:</span>
          <span>{{ formatTime(order.expected_time) }}</span>
        </div>

        <div v-if="order.notes" class="info-item">
          <span class="label">备注:</span>
          <span>{{ order.notes }}</span>
        </div>

        <div class="info-item">
          <span class="label">发布时间:</span>
          <span>{{ formatTime(order.created_at) }}</span>
        </div>
      </div>

      <div class="warning">
        <p>⚠️ 风险提示：交易双方需自行承担风险，请谨慎交易</p>
      </div>

      <div v-if="order.status === '待接单'" class="actions">
        <router-link to="/orders" class="btn secondary">返回列表</router-link>
        <button @click="showAcceptModal = true" class="btn primary">接单</button>
      </div>

      <div v-else class="status-info">
        <p>该订单已被接取</p>
        <router-link to="/orders" class="btn secondary">返回列表</router-link>
      </div>
    </div>

    <!-- 接单确认弹窗 -->
    <div v-if="showAcceptModal" class="modal-overlay" @click="showAcceptModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>确认接单</h3>
          <button @click="showAcceptModal = false" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <p>请填写您的联系方式，以便发布者联系您</p>

          <div class="form-group">
            <label>联系方式 <span class="required">*</span></label>
            <input
              v-model="acceptor_contact"
              type="text"
              placeholder="请输入微信/QQ"
            />
          </div>

          <div class="warning">
            <p>⚠️ 提交后订单将锁定，请及时联系发布者</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showAcceptModal = false" class="btn secondary">取消</button>
          <button @click="handleAccept" :disabled="accepting" class="btn primary">
            {{ accepting ? '接单中...' : '确认接单' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 接单成功弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>接单成功</h3>
        </div>

        <div class="modal-body success">
          <div class="success-icon">✓</div>
          <p>接单成功！请及时联系发布者</p>

          <div class="contact-info">
            <p><strong>发布者联系方式:</strong></p>
            <p>{{ publisherContact }}</p>
          </div>

          <div class="warning">
            <p>⚠️ 请通过联系方式与发布者沟通，自行完成交易</p>
          </div>
        </div>

        <div class="modal-footer">
          <router-link to="/orders" class="btn secondary">返回订单列表</router-link>
          <router-link to="/my-orders" class="btn primary">查看我的接单</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { orderApi } from '../api';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const accepting = ref(false);
const order = ref(null);
const showAcceptModal = ref(false);
const showSuccessModal = ref(false);
const acceptor_contact = ref('');
const publisherContact = ref('');

const loadOrder = async () => {
  loading.value = true;

  try {
    const response = await orderApi.getDetail(route.params.id);
    order.value = response.data;
  } catch (error) {
    console.error('加载订单失败:', error);
    alert('加载订单失败');
    router.push('/orders');
  } finally {
    loading.value = false;
  }
};

const handleAccept = async () => {
  if (!acceptor_contact.value) {
    alert('请填写联系方式');
    return;
  }

  accepting.value = true;

  try {
    const response = await orderApi.accept(order.value.id, {
      acceptor_contact: acceptor_contact.value
    });

    // 保存接单者ID到localStorage，用于查询"我的接单"
    if (response.data.order && response.data.order.acceptor_id) {
      let acceptorIds = JSON.parse(localStorage.getItem('acceptor_ids') || '[]');
      if (!acceptorIds.includes(response.data.order.acceptor_id)) {
        acceptorIds.push(response.data.order.acceptor_id);
        localStorage.setItem('acceptor_ids', JSON.stringify(acceptorIds));
      }
    }

    publisherContact.value = response.data.publisher_contact;
    showAcceptModal.value = false;
    showSuccessModal.value = true;
  } catch (error) {
    console.error('接单失败:', error);
    alert(error.response?.data?.error || '接单失败，请稍后重试');
  } finally {
    accepting.value = false;
  }
};

const formatTime = (time) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

onMounted(() => {
  loadOrder();
});
</script>

<style scoped>
.order-detail {
  max-width: 600px;
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

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.detail {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-group {
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 15px;
  font-size: 14px;
}

.info-item .label {
  display: block;
  color: #999;
  margin-bottom: 5px;
}

.reward {
  font-size: 18px;
  font-weight: bold;
  color: #f5576c;
}

.warning {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.warning p {
  margin: 0;
  color: #856404;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 15px;
}

.status-info {
  text-align: center;
}

.status-info p {
  color: #666;
  margin-bottom: 15px;
}

.btn {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 15px 0;
  color: #666;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #f5576c;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.success {
  text-align: center;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin: 0 auto 15px;
}

.contact-info {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
}

.contact-info p {
  margin: 5px 0;
}
</style>
