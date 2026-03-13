<template>
  <div class="publish-page">
    <div class="page-container">
      <div class="publish-card animate-fade-in-up">
        <div class="card-header">
          <h1 class="page-title">发布新任务</h1>
          <p class="page-subtitle">填写代取需求，等待接单</p>
        </div>

        <form @submit.prevent="handleSubmit" class="publish-form">
          <!-- 任务类型 -->
          <div class="form-group">
            <label class="form-label">任务类型 <span class="required">*</span></label>
            <div class="type-selector">
              <button
                type="button"
                v-for="type in taskTypes"
                :key="type.value"
                :class="['type-option', { active: form.task_type === type.value }]"
                @click="form.task_type = type.value"
              >
                <div class="type-icon">
                  <svg v-if="type.value === '快递代取'" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3v16h18v-8zM5 6h10v2H5V6zm14 12H5v-6h14v6z"/><path d="M7 14h2v2H7z"/></svg>
                  <svg v-else-if="type.value === '外卖代取'" viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <span>{{ type.label }}</span>
              </button>
            </div>
            <span v-if="errors.task_type" class="error-text">{{ errors.task_type }}</span>
          </div>

          <!-- 地址信息 -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">取件地点 <span class="required">*</span></label>
              <input
                v-model="form.pickup_location"
                type="text"
                class="form-input"
                placeholder="例：校内快递中心 / 校外美团外卖点"
              />
              <!-- 快捷地址选项 -->
              <div v-if="form.task_type === '快递代取'" class="quick-tags">
                <span
                  v-for="point in quickPickupPoints"
                  :key="point"
                  class="tag"
                  @click="setPickupLocation(point)"
                >
                  {{ point }}
                </span>
              </div>
              <span v-if="errors.pickup_location" class="error-text">{{ errors.pickup_location }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">送达地点 <span class="required">*</span></label>
              <input
                v-model="form.delivery_location"
                type="text"
                class="form-input"
                placeholder="例：男生宿舍 3 号楼 / 女生宿舍 5 号楼"
              />
              <span v-if="errors.delivery_location" class="error-text">{{ errors.delivery_location }}</span>
            </div>
          </div>

          <!-- 任务描述 -->
          <div class="form-group">
            <label class="form-label">任务描述 <span class="required">*</span></label>
            <textarea
              v-model="form.task_description"
              class="form-textarea"
              rows="3"
              placeholder="请填写快递单号后 4 位、外卖订单号、包裹大小等信息"
            ></textarea>
            <span v-if="errors.task_description" class="error-text">{{ errors.task_description }}</span>
          </div>

          <!-- 报酬与联系 -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">报酬金额 <span class="required">*</span></label>
              <div class="input-with-suffix">
                <input
                  v-model.number="form.reward_amount"
                  type="number"
                  class="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <span class="input-suffix">元</span>
              </div>
              <span v-if="errors.reward_amount" class="error-text">{{ errors.reward_amount }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">联系方式 <span class="required">*</span></label>
              <input
                v-model="form.publisher_contact"
                type="text"
                class="form-input"
                placeholder="例：微信号 / QQ 号"
              />
              <span v-if="errors.publisher_contact" class="error-text">{{ errors.publisher_contact }}</span>
            </div>
          </div>

          <!-- 期望时间 -->
          <div class="form-group">
            <label class="form-label">期望时间 <span class="optional">（选填）</span></label>
            <input
              v-model="form.expected_time"
              type="datetime-local"
              class="form-input"
            />
          </div>

          <!-- 备注 -->
          <div class="form-group">
            <label class="form-label">备注 <span class="optional">（选填）</span></label>
            <textarea
              v-model="form.notes"
              class="form-textarea"
              rows="2"
              placeholder="其他需要说明的信息"
            ></textarea>
          </div>

          <!-- 风险提示 -->
          <div class="alert alert-warning">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <path d="M12 9V13M12 17H12.01" stroke-linecap="round"/>
            </svg>
            <span>交易前请仔细核对信息，注意人身和财产安全</span>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="handleCancel">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="btn-spinner"></span>
              {{ loading ? '发布中...' : '发布任务' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { orderApi } from '../api';

const router = useRouter();
const toast = inject('toast');
const loading = ref(false);

const taskTypes = [
  { value: '快递代取', label: '快递' },
  { value: '外卖代取', label: '外卖' },
  { value: '其他跑腿', label: '其他' }
];

const quickPickupPoints = ['校内菜鸟驿站', '校外乐收驿站'];

const form = reactive({
  task_type: '快递代取',
  pickup_location: '',
  delivery_location: '',
  task_description: '',
  reward_amount: null,
  publisher_contact: '',
  expected_time: '',
  notes: ''
});

const errors = reactive({
  task_type: '',
  pickup_location: '',
  delivery_location: '',
  task_description: '',
  reward_amount: '',
  publisher_contact: ''
});

// 加载历史地址
onMounted(() => {
  const history = JSON.parse(localStorage.getItem('address_history') || '{}');
  if (history.pickup) form.pickup_location = history.pickup;
  if (history.delivery) form.delivery_location = history.delivery;
  if (history.contact) form.publisher_contact = history.contact;
});

const setPickupLocation = (location) => {
  form.pickup_location = location;
};

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(key => errors[key] = '');
  if (!form.task_type) { errors.task_type = '请选择任务类型'; isValid = false; }
  if (!form.pickup_location) { errors.pickup_location = '请填写取件地点'; isValid = false; }
  if (!form.delivery_location) { errors.delivery_location = '请填写送达地点'; isValid = false; }
  if (!form.task_description) { errors.task_description = '请填写任务描述'; isValid = false; }
  if (!form.reward_amount || form.reward_amount <= 0) { errors.reward_amount = '请输入有效金额'; isValid = false; }
  if (!form.publisher_contact) { errors.publisher_contact = '请填写联系方式'; isValid = false; }
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  loading.value = true;
  try {
    const data = { ...form, expected_time: form.expected_time || null };
    const response = await orderApi.create(data);
    
    // 保存发布者ID
    if (response.data.order?.publisher_id) {
      let publisherIds = JSON.parse(localStorage.getItem('publisher_ids') || '[]');
      if (!publisherIds.includes(response.data.order.publisher_id)) {
        publisherIds.push(response.data.order.publisher_id);
        localStorage.setItem('publisher_ids', JSON.stringify(publisherIds));
      }
    }

    // 保存历史地址
    localStorage.setItem('address_history', JSON.stringify({
      pickup: form.pickup_location,
      delivery: form.delivery_location,
      contact: form.publisher_contact
    }));

    toast.success('发布成功！');
    // 发布成功后跳转到订单列表
    router.push({ name: 'OrderList' });
  } catch (error) {
    toast.error(error.response?.data?.error || '发布失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped>
.publish-page {
  background: var(--slate-50);
  min-height: 100vh;
  padding: var(--space-8) var(--container-padding);
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
}

.publish-card {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-md);
}

.card-header {
  margin-bottom: var(--space-8);
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--slate-900);
  margin-bottom: var(--space-2);
}

.page-subtitle {
  font-size: 16px;
  color: var(--slate-500);
}

.publish-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--slate-700);
}

.required {
  color: var(--danger);
  margin-left: 4px;
}

.optional {
  color: var(--slate-400);
  font-weight: 400;
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--slate-50);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.type-option:hover {
  background: var(--slate-100);
}

.type-option.active {
  background: var(--primary-500); /* 亮黄色选中 */
  color: #000000;
  border-color: var(--primary-500);
  box-shadow: var(--shadow-sm);
}

.type-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-icon svg {
  width: 100%;
  height: 100%;
}

.quick-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--slate-100);
  color: var(--slate-600);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s;
}

.tag:hover {
  background: var(--primary-100);
  color: var(--primary-700);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  font-size: 16px;
  background: var(--slate-50);
  transition: all var(--duration-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  background: #FFFFFF;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(216, 196, 26, 0.1);
}

.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-suffix {
  position: absolute;
  right: 16px;
  color: var(--slate-500);
  font-size: 14px;
}

.error-text {
  font-size: 12px;
  color: var(--danger);
  margin-top: 4px;
}

.alert {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.btn {
  flex: 1;
  padding: 14px;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--duration-fast);
}

.btn-primary {
  background: var(--slate-900);
  color: #FFFFFF;
}

.btn-primary:hover {
  background: var(--slate-800);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--slate-100);
  color: var(--slate-700);
}

.btn-secondary:hover {
  background: var(--slate-200);
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .type-selector {
    grid-template-columns: 1fr;
  }
  
  .type-option {
    flex-direction: row;
    justify-content: flex-start;
  }
}
</style>