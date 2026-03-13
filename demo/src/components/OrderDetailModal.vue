<template>
  <div class="detail-modal">
    <div class="modal-header">
      <div class="header-content">
        <h3>订单详情</h3>
        <p v-if="order" :class="['status-badge', getStatusClass(order.status)]">{{ order.status }}</p>
      </div>
      <button @click="handleClose" class="close-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6L18 18" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="!order" class="loading-state">
        <span>暂无订单数据</span>
      </div>

      <div v-else class="modal-body">
        <!-- 订单信息 -->
        <div class="order-info-card">
          <div class="info-header">
            <span class="type-badge" :class="getTypeClass(order.task_type)">{{ order.task_type }}</span>
            <div class="reward-amount">
              <span class="currency">¥</span>
              <span class="amount">{{ order.reward_amount }}</span>
            </div>
          </div>

          <div class="info-list">
            <div class="info-item">
              <div class="item-icon location-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="item-content">
                <span class="item-label">取件地点</span>
                <span class="item-value">{{ order.pickup_location }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="item-icon delivery-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <div class="item-content">
                <span class="item-label">送达地点</span>
                <span class="item-value">{{ order.delivery_location }}</span>
              </div>
            </div>

            <div class="info-item full">
              <div class="item-icon desc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
              </div>
              <div class="item-content">
                <span class="item-label">任务描述</span>
                <span class="item-value">{{ order.task_description }}</span>
              </div>
            </div>

            <div v-if="order.expected_time" class="info-item">
              <div class="item-icon time-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6V12L16 14" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="item-content">
                <span class="item-label">期望时间</span>
                <span class="item-value">{{ formatTime(order.expected_time) }}</span>
              </div>
            </div>

            <div v-if="order.notes" class="info-item full">
              <div class="item-icon note-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div class="item-content">
                <span class="item-label">备注</span>
                <span class="item-value">{{ order.notes }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系方式 -->
        <div v-if="showContactInfo" class="contact-card">
          <div class="contact-label">{{ contactLabel }}</div>
          <div class="contact-value" @click="copyContact">
            {{ contactValue }}
            <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </div>
        </div>

        <!-- 风险提示 -->
        <div class="alert alert-warning">
          <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <path d="M12 9V13M12 17H12.01" stroke-linecap="round"/>
          </svg>
          <span>交易前请仔细核对信息，注意人身和财产安全</span>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <!-- 待接单 - 接单按钮 -->
          <template v-if="order.status === '待接单' && mode === 'accept'">
            <div v-if="isMyOrder" class="notice-text warning">
              这是您发布的订单，不能自己接单
            </div>
            <button v-else @click="showAcceptForm = true" class="btn btn-primary btn-lg">
              接单
            </button>
          </template>

          <!-- 我的发布 - 待接单 -->
          <button v-if="order.status === '待接单' && mode === 'published'" @click="handleCancelPublish" class="btn btn-danger btn-lg">
            取消订单
          </button>

          <!-- 我的发布 - 已接单/进行中 -->
          <div v-if="(order.status === '已接单' || order.status === '进行中') && mode === 'published'" class="notice-text">
            订单已被接取，如需取消请联系接单者
          </div>

          <!-- 我的接单 - 已接单 -->
          <div v-if="order.status === '已接单' && mode === 'accepted'" class="action-group">
            <button @click="handleUpdateStatus('进行中')" class="btn btn-primary btn-lg">已取件</button>
            <button @click="handleCancelAccept" class="btn btn-danger btn-lg">取消接单</button>
          </div>

          <!-- 我的接单 - 进行中 -->
          <div v-if="order.status === '进行中' && mode === 'accepted'" class="action-group">
            <button @click="handleUpdateStatus('已完成')" class="btn btn-primary btn-lg">已送达</button>
          </div>

          <!-- 已完成 -->
          <div v-if="order.status === '已完成'" class="status-text complete">
            订单已完成
          </div>

          <!-- 已取消 -->
          <div v-if="order.status === '已取消'" class="status-text cancelled">
            订单已取消
          </div>
        </div>
      </div>

      <!-- 接单表单 -->
      <div v-if="showAcceptForm" class="accept-form-overlay" @click.self="showAcceptForm = false">
        <div class="accept-form">
          <div class="accept-header">
            <h4>确认接单</h4>
            <p>请填写您的联系方式</p>
          </div>
          <div class="accept-body">
            <input v-model="acceptor_contact" type="text" placeholder="请输入微信/QQ" class="accept-input"/>
            <div class="alert alert-warning small">
              <span>提交后订单将锁定，请及时联系发布者</span>
            </div>
          </div>
          <div class="accept-footer">
            <button @click="showAcceptForm = false" class="btn btn-secondary">取消</button>
            <button @click="handleAccept" :disabled="accepting" class="btn btn-primary">
              {{ accepting ? '接单中...' : '确认接单' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 成功提示 -->
      <div v-if="showSuccessTip" class="success-overlay" @click.self="closeSuccessTip">
        <div class="success-content">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h4>接单成功！</h4>
          <p>请及时联系发布者</p>
          <div class="contact-display">
            <span>发布者联系方式：</span>
            <strong>{{ publisherContact }}</strong>
          </div>
          <button @click="closeSuccessTip" class="btn btn-primary btn-lg">确定</button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, inject, nextTick } from 'vue';
import { orderApi } from '../api';

const props = defineProps({
  visible: { type: Boolean, default: false },
  orderId: { type: [String, Number], default: null },
  mode: { type: String, default: 'accept' }
});

const emit = defineEmits(['close', 'refresh']);
const toast = inject('toast');

const loading = ref(false);
const order = ref(null);
const showAcceptForm = ref(false);
const showSuccessTip = ref(false);
const accepting = ref(false);
const acceptor_contact = ref('');
const publisherContact = ref('');

// 数据验证函数：确保订单数据完整性
const validateOrderData = (data) => {
  if (!data || typeof data !== 'object') {
    console.error('[validateOrderData] 无效的数据:', data);
    return null;
  }

  const validatedData = {
    id: data.id || 0,
    task_type: data.task_type || '未知类型',
    pickup_location: data.pickup_location || '未填写',
    delivery_location: data.delivery_location || '未填写',
    task_description: data.task_description || '无描述',
    reward_amount: data.reward_amount || 0,
    publisher_contact: data.publisher_contact || '未提供',
    status: data.status || '未知状态',
    publisher_id: data.publisher_id || '',
    acceptor_contact: data.acceptor_contact || null,
    acceptor_id: data.acceptor_id || null,
    created_at: data.created_at || new Date().toISOString(),
    expires_at: data.expires_at || new Date().toISOString(),
    expected_time: data.expected_time || null,
    notes: data.notes || null,
    accepted_at: data.accepted_at || null
  };

  console.log('[validateOrderData] 验证后的数据:', validatedData);
  return validatedData;
};

const showContactInfo = computed(() => {
  if (!order.value) return false;
  if (props.mode === 'accepted' && order.value.publisher_contact) return true;
  if (props.mode === 'published' && (order.value.status === '已接单' || order.value.status === '进行中') && order.value.acceptor_contact) return true;
  return false;
});

const contactLabel = computed(() => {
  if (props.mode === 'accepted') return '发布者联系方式';
  if (props.mode === 'published') return '接单者联系方式';
  return '';
});

const contactValue = computed(() => {
  if (!order.value) return '';
  if (props.mode === 'accepted') return order.value.publisher_contact;
  if (props.mode === 'published') return order.value.acceptor_contact;
  return '';
});

const isMyOrder = computed(() => {
  if (!order.value || !order.value.publisher_id) return false;
  const publisherIds = JSON.parse(localStorage.getItem('publisher_ids') || '[]');
  return publisherIds.includes(order.value.publisher_id);
});

const loadOrder = async () => {
  console.log('[loadOrder] 开始加载订单, orderId:', props.orderId, 'type:', typeof props.orderId);
  if (!props.orderId) {
    console.log('[loadOrder] 无效的 orderId, 返回');
    return;
  }
  loading.value = true;
  try {
    console.log('[loadOrder] 调用 API, orderId:', props.orderId);
    const response = await orderApi.getDetail(props.orderId);
    console.log('[loadOrder] API 响应:', response);
    console.log('[loadOrder] API response.data:', response.data);

    if (response.data) {
      // 应用数据验证
      const validatedData = validateOrderData(response.data);
      if (validatedData) {
        order.value = validatedData;
        // 等待 DOM 更新
        await nextTick();
        console.log('[loadOrder] 订单加载成功, DOM 已更新:', order.value);
      } else {
        console.error('[loadOrder] 数据验证失败');
        toast.error('订单数据格式错误');
        handleClose();
      }
    } else {
      console.error('[loadOrder] 响应中无数据');
      toast.error('订单数据为空');
      handleClose();
    }
  } catch (error) {
    console.error('[loadOrder] 加载订单失败:', error);
    console.error('[loadOrder] 错误响应:', error.response);

    // 区分不同类型的错误
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.error || '加载订单失败';

      if (status === 404) {
        toast.error('订单不存在或已被删除');
      } else if (status === 400) {
        toast.error('请求参数错误');
      } else if (status >= 500) {
        toast.error('服务器错误，请稍后重试');
      } else {
        toast.error(errorMsg);
      }
    } else if (error.request) {
      toast.error('网络连接失败，请检查网络');
    } else {
      toast.error('加载订单失败');
    }

    handleClose();
  } finally {
    loading.value = false;
  }
};

// 优化 watch 监听器，添加 immediate 选项
watch(() => props.visible, (newVal) => {
  console.log('[watch] visible changed:', newVal, 'orderId:', props.orderId);
  if (newVal && props.orderId) loadOrder();
}, { immediate: true });

watch(() => props.orderId, (newVal) => {
  console.log('[watch] orderId changed:', newVal, 'visible:', props.visible);
  if (newVal && props.visible) loadOrder();
}, { immediate: true });

const handleAccept = async () => {
  if (!acceptor_contact.value) { toast.error('请填写联系方式'); return; }
  accepting.value = true;
  try {
    const response = await orderApi.accept(order.value.id, { acceptor_contact: acceptor_contact.value });
    if (response.data.order?.acceptor_id) {
      let acceptorIds = JSON.parse(localStorage.getItem('acceptor_ids') || '[]');
      if (!acceptorIds.includes(response.data.order.acceptor_id)) {
        acceptorIds.push(response.data.order.acceptor_id);
        localStorage.setItem('acceptor_ids', JSON.stringify(acceptorIds));
      }
    }
    publisherContact.value = response.data.publisher_contact;
    showAcceptForm.value = false;
    showSuccessTip.value = true;
  } catch (error) {
    toast.error(error.response?.data?.error || '接单失败');
  } finally {
    accepting.value = false;
  }
};

const closeSuccessTip = () => { showSuccessTip.value = false; emit('refresh'); handleClose(); };
const handleCancelPublish = async () => {
  if (!confirm('确定要取消该订单吗？')) return;
  try { await orderApi.cancel(order.value.id, { cancel_type: 'publisher' }); toast.success('订单已取消'); emit('refresh'); handleClose(); }
  catch (error) { toast.error(error.response?.data?.error || '取消失败'); }
};
const handleCancelAccept = async () => {
  if (!confirm('确定要取消接单吗？')) return;
  try {
    await orderApi.cancel(order.value.id, {
      cancel_type: 'acceptor',
      acceptor_id: order.value.acceptor_id
    });
    toast.success('已取消接单');
    emit('refresh');
    handleClose();
  } catch (error) {
    toast.error(error.response?.data?.error || '取消失败');
  }
};
const handleUpdateStatus = async (status) => {
  if (!confirm(status === '进行中' ? '确认已取件？' : '确认已送达？')) return;
  try {
    await orderApi.updateStatus(order.value.id, {
      status,
      acceptor_id: order.value.acceptor_id
    });
    toast.success('状态更新成功');
    emit('refresh');
    handleClose();
  } catch (error) {
    toast.error(error.response?.data?.error || '操作失败');
  }
};

const copyContact = () => {
  if (!contactValue.value) return;
  navigator.clipboard.writeText(contactValue.value).then(() => {
    toast.success('复制成功');
  }).catch(() => {
    toast.error('复制失败');
  });
};

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const getStatusClass = (status) => `status-${status.replace(' ', '-')}`;
const getTypeClass = (type) => {
  const map = { '快递代取': 'type-express', '外卖代取': 'type-food', '其他跑腿': 'type-other' };
  return map[type] || 'type-default';
};

const handleClose = () => { showAcceptForm.value = false; acceptor_contact.value = ''; emit('close'); };
</script>

<style scoped>
.detail-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--duration-fast) var(--ease-out);
}

.detail-modal {
  background: var(--gradient-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp var(--duration-normal) var(--ease-out);
  box-shadow: var(--elevation-4);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-5);
  border-bottom: 1px solid var(--slate-200);
  position: sticky;
  top: 0;
  background: var(--gradient-surface);
  z-index: 10;
}

.header-content { display: flex; align-items: center; gap: var(--space-3); }
.header-content h3 {
  margin: 0;
  font-size: var(--text-title);
  font-weight: 600;
  color: var(--slate-800);
  line-height: var(--line-height-title);
}
.header-content p {
  margin: 0;
  font-size: 12px;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-weight: 600;
}

.status-badge { background: var(--slate-100); color: var(--slate-600); }
.status-待接单 { background: #DBEAFE; color: #1D4ED8; }
.status-已接单 { background: #FEF3C7; color: #B45309; }
.status-进行中 { background: #E0E7FF; color: #4338CA; }
.status-已完成 { background: #ECFDF5; color: #059669; }
.status-已取消 { background: #FEE2E2; color: #DC2626; }

.close-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--slate-100);
  color: var(--slate-600);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}
.close-btn:hover {
  background: var(--slate-200);
  color: var(--slate-800);
  box-shadow: var(--elevation-1);
}
.close-btn:active {
  transform: scale(0.95);
}
.close-btn svg { width: 20px; height: 20px; }

.modal-body { padding: var(--space-5); }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-12);
  gap: var(--space-3);
  color: var(--slate-400);
}
.loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--slate-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* 订单信息卡片 */
.order-info-card {
  background: var(--gradient-card);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--elevation-1);
  border: 1px solid var(--slate-100);
  margin-bottom: var(--space-4);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--slate-100);
  margin-bottom: var(--space-4);
}

.type-badge {
  padding: var(--space-1) var(--space-3);
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-full);
}
.type-express { background: #DBEAFE; color: #1D4ED8; }
.type-food { background: #FEF3C7; color: #B45309; }
.type-other { background: #E0E7FF; color: #4338CA; }

.reward-amount {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.currency { font-size: 14px; font-weight: 600; color: var(--primary-600); }
.amount { font-size: 28px; font-weight: 700; color: var(--primary-600); line-height: 1; }

.info-list { display: flex; flex-direction: column; gap: var(--space-4); }

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}
.info-item.full { flex-direction: column; gap: var(--space-2); }

.item-icon {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.item-icon svg { width: 16px; height: 16px; }
.location-icon { background: var(--primary-100); color: var(--primary-600); }
.delivery-icon { background: var(--success-bg); color: var(--success); }
.desc-icon { background: var(--slate-100); color: var(--slate-600); }
.time-icon { background: var(--info-bg); color: var(--info); }
.note-icon { background: var(--slate-100); color: var(--slate-600); }

.item-content { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.item-label { font-size: 11px; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.05em; }
.item-value { font-size: 14px; color: var(--slate-700); font-weight: 500; word-break: break-word; }

/* 联系方式卡片 */
.contact-card {
  background: var(--slate-50);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  text-align: center;
  margin-bottom: var(--space-4);
  border: 1px solid var(--slate-100);
}
.contact-label { font-size: 13px; color: var(--slate-500); margin-bottom: var(--space-1); }
.contact-value { 
  font-size: 20px; 
  font-weight: 700; 
  color: var(--slate-800); 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: color var(--duration-fast);
}

.contact-value:hover {
  color: var(--primary-600);
}

.copy-icon {
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.contact-value:hover .copy-icon {
  opacity: 1;
}

/* 警告框 */
.alert {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.alert-warning {
  background: var(--warning-bg);
  color: #8A6A0A;
  border: none;
}

.alert.small {
  padding: var(--space-2) var(--space-3);
  font-size: 13px;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: currentColor;
}

.alert-icon svg { width: 100%; height: 100%; }

/* 操作按钮 */
.action-buttons { display: flex; flex-direction: column; gap: var(--space-3); }
.action-group { display: flex; gap: var(--space-3); }

.btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-lg {
  padding: var(--space-4) var(--space-6);
  font-size: 16px;
  border-radius: var(--radius-lg);
}

.btn-secondary {
  background: transparent;
  color: var(--primary-600);
  border: 1px solid var(--primary-300);
  box-shadow: none;
}

.btn-secondary:hover {
  background: var(--primary-50);
  border-color: var(--primary-500);
  box-shadow: var(--elevation-1);
}

.btn-primary {
  background: var(--gradient-primary);
  color: #FFFFFF;
  box-shadow: var(--elevation-2);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--elevation-3);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  box-shadow: var(--elevation-1);
  transform: translateY(0) scale(0.98);
}

.btn-danger {
  background: var(--danger);
  color: #FFFFFF;
  box-shadow: var(--elevation-2);
}

.btn-danger:hover:not(:disabled) {
  background: var(--danger-light);
  box-shadow: var(--elevation-3);
  transform: translateY(-2px);
}

.notice-text {
  background: var(--info-bg);
  border: 1px solid #BFDBFE;
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
  color: #1E40AF;
  font-size: 14px;
}

.notice-text.warning {
  background: #FEF3C7;
  border-color: #FCD34D;
  color: #92400E;
}

.status-text {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 600;
}
.status-text.complete { background: var(--success-bg); color: var(--success); }
.status-text.cancelled { background: var(--danger-bg); color: var(--danger); }

/* 接单表单覆盖层 */
.accept-form-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  backdrop-filter: blur(4px);
}

.accept-form {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 360px;
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
}

.accept-header {
  padding: var(--space-5);
  text-align: center;
  border-bottom: 1px solid var(--slate-100);
}
.accept-header h4 { margin: 0 0 var(--space-1) 0; font-size: 18px; color: var(--slate-800); }
.accept-header p { margin: 0; font-size: 14px; color: var(--slate-500); }

.accept-body { padding: var(--space-5); }
.accept-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: 15px;
  border: 1.5px solid var(--slate-200);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
}
.accept-input:focus { outline: none; border-color: var(--primary-400); box-shadow: 0 0 0 3px var(--primary-100); }

.accept-footer {
  display: flex;
  border-top: 1px solid var(--slate-100);
}
.accept-footer .btn {
  flex: 1;
  border-radius: 0;
  border: none;
  border-right: 1px solid var(--slate-100);
  padding: var(--space-4);
}
.accept-footer .btn:last-child { border-right: none; }

/* 成功提示覆盖层 */
.success-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  backdrop-filter: blur(4px);
}

.success-content {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  text-align: center;
  max-width: 340px;
  width: 90%;
}

.success-icon {
  width: 64px; height: 64px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  box-shadow: var(--shadow-primary);
}
.success-icon svg { width: 32px; height: 32px; color: white; }

.success-content h4 { margin: 0 0 var(--space-1) 0; font-size: 20px; color: var(--slate-800); }
.success-content p { margin: 0 0 var(--space-5) 0; font-size: 14px; color: var(--slate-500); }

.contact-display {
  background: var(--slate-50);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
}
.contact-display span { font-size: 13px; color: var(--slate-500); }
.contact-display strong { display: block; margin-top: var(--space-2); font-size: 20px; color: var(--slate-800); }

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .modal-header {
    border-bottom-color: var(--slate-700);
  }

  .close-btn {
    background: var(--slate-700);
    color: var(--slate-400);
  }

  .close-btn:hover {
    background: var(--slate-600);
    color: var(--slate-300);
  }

  .order-info-card {
    border-color: var(--slate-700);
  }

  .info-header {
    border-bottom-color: var(--slate-700);
  }

  .contact-card {
    background: var(--slate-800);
    border-color: var(--slate-700);
  }

  .accept-form {
    background: #1E293B;
  }

  .accept-header {
    border-bottom-color: var(--slate-700);
  }

  .accept-input {
    background: var(--slate-700);
    border-color: var(--slate-600);
    color: var(--slate-200);
  }

  .accept-input:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 1px 0 0 var(--primary-500);
  }

  .accept-footer {
    border-top-color: var(--slate-700);
  }

  .accept-footer .btn {
    border-right-color: var(--slate-700);
  }

  .success-content {
    background: #1E293B;
  }

  .btn-secondary {
    background: transparent;
    border-color: var(--slate-600);
    color: var(--slate-400);
  }

  .btn-secondary:hover {
    background: var(--slate-700);
    border-color: var(--slate-500);
  }
}
</style>
