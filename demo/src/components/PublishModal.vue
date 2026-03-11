<template>
  <div v-if="visible" class="publish-modal-overlay" @click.self="handleClose">
    <div class="publish-modal">
      <div class="modal-header">
        <div class="header-content">
          <h3>发布代取</h3>
          <p>填写代取需求，等待接单</p>
        </div>
        <button @click="handleClose" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6L18 18" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 任务类型 -->
          <div class="form-group">
            <label class="form-label">任务类型 <span class="required">*</span></label>
            <div class="type-selector">
              <button
                type="button"
                :class="['type-option', { active: form.task_type === '快递代取' }]"
                @click="form.task_type = '快递代取'"
              >
                <span>快递</span>
              </button>
              <button
                type="button"
                :class="['type-option', { active: form.task_type === '外卖代取' }]"
                @click="form.task_type = '外卖代取'"
              >
                <span>外卖</span>
              </button>
              <button
                type="button"
                :class="['type-option', { active: form.task_type === '其他跑腿' }]"
                @click="form.task_type = '其他跑腿'"
              >
                <span>其他</span>
              </button>
            </div>
            <span v-if="errors.task_type" class="error-text">{{ errors.task_type }}</span>
          </div>

          <!-- 取件地点 -->
          <div class="form-group">
            <label class="form-label">取件地点 <span class="required">*</span></label>
            <input
              v-model="form.pickup_location"
              type="text"
              class="form-input"
              placeholder="例：校内快递中心 / 校外美团外卖点"
            />
            <span v-if="errors.pickup_location" class="error-text">{{ errors.pickup_location }}</span>
          </div>

          <!-- 送达地点 -->
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

          <!-- 报酬金额 -->
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

          <!-- 联系方式 -->
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
            <button type="button" class="btn btn-secondary" @click="handleClose">
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
import { ref, reactive, watch } from 'vue';
import { orderApi } from '../api';

const props = defineProps({
  visible: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'success']);

const loading = ref(false);
const initialForm = {
  task_type: '', pickup_location: '', delivery_location: '',
  task_description: '', reward_amount: null, publisher_contact: '',
  expected_time: '', notes: ''
};
const form = reactive({ ...initialForm });
const errors = reactive({
  task_type: '', pickup_location: '', delivery_location: '',
  task_description: '', reward_amount: '', publisher_contact: ''
});

const resetForm = () => {
  Object.assign(form, initialForm);
  Object.keys(errors).forEach(key => errors[key] = '');
};

watch(() => props.visible, (newVal) => { if (!newVal) resetForm(); });

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
    if (response.data.order?.publisher_id) {
      let publisherIds = JSON.parse(localStorage.getItem('publisher_ids') || '[]');
      if (!publisherIds.includes(response.data.order.publisher_id)) {
        publisherIds.push(response.data.order.publisher_id);
        localStorage.setItem('publisher_ids', JSON.stringify(publisherIds));
      }
    }
    alert('发布成功！');
    emit('success');
    handleClose();
  } catch (error) {
    alert(error.response?.data?.error || '发布失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => emit('close');
</script>

<style scoped>
.publish-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--duration-fast) var(--ease-out);
}

.publish-modal {
  background: var(--gradient-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp var(--duration-normal) var(--ease-out);
  box-shadow: var(--elevation-4);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

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

.header-content h3 {
  margin: 0;
  font-size: var(--text-title);
  font-weight: 600;
  color: var(--slate-800);
  line-height: var(--line-height-title);
}

.header-content p {
  margin: 4px 0 0 0;
  font-size: var(--text-body);
  color: var(--slate-500);
  line-height: var(--line-height-body);
}

.close-btn {
  width: 40px;
  height: 40px;
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

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: var(--space-5);
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--slate-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.required { color: var(--danger); }
.optional { color: var(--slate-400); font-weight: 400; text-transform: none; letter-spacing: 0; }

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.type-option {
  padding: var(--space-3) var(--space-4);
  font-size: 14px;
  font-weight: 500;
  color: var(--slate-600);
  background: var(--slate-100);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.type-option:hover {
  background: var(--slate-200);
}

.type-option.active {
  background: var(--primary-50);
  border-color: var(--primary-500);
  color: var(--primary-700);
  box-shadow: var(--elevation-1);
}

.form-input {
  width: 100%;
  padding: var(--space-4);
  font-family: inherit;
  font-size: 16px;
  color: var(--slate-800);
  background: var(--slate-100);
  border: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  border-bottom: 2px solid var(--slate-300);
  transition: all var(--duration-fast) var(--ease-out);
}

.form-input:hover {
  background: var(--slate-200);
  border-bottom-color: var(--slate-400);
}

.form-input:focus {
  outline: none;
  background: var(--slate-50);
  border-bottom-color: var(--primary-500);
  box-shadow: 0 1px 0 0 var(--primary-500);
}

.form-input::placeholder { color: var(--slate-400); }

.form-textarea {
  width: 100%;
  padding: var(--space-4);
  font-family: inherit;
  font-size: 16px;
  color: var(--slate-800);
  background: var(--slate-100);
  border: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  border-bottom: 2px solid var(--slate-300);
  resize: vertical;
  transition: all var(--duration-fast) var(--ease-out);
  min-height: 100px;
}

.form-textarea:hover {
  background: var(--slate-200);
  border-bottom-color: var(--slate-400);
}

.form-textarea:focus {
  outline: none;
  background: var(--slate-50);
  border-bottom-color: var(--primary-500);
  box-shadow: 0 1px 0 0 var(--primary-500);
}

.alert {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.5;
}

.alert-warning {
  background: var(--warning-bg);
  color: #8A6A0A;
  border: none;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: currentColor;
}

.alert-icon svg {
  width: 100%;
  height: 100%;
}

.error-text {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-2);
  font-size: 12px;
  color: var(--danger);
}

.form-helper {
  margin-top: var(--space-2);
  font-size: 12px;
  color: var(--slate-500);
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-4);
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

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

  .type-option {
    background: var(--slate-700);
    color: var(--slate-400);
  }

  .type-option:hover {
    background: var(--slate-600);
  }

  .type-option.active {
    background: rgba(255, 107, 53, 0.15);
    border-color: var(--primary-500);
    color: var(--primary-400);
  }

  .form-input,
  .form-textarea {
    background: var(--slate-700);
    color: var(--slate-200);
    border-bottom-color: var(--slate-500);
  }

  .form-input:hover,
  .form-textarea:hover {
    background: var(--slate-600);
    border-bottom-color: var(--slate-400);
  }

  .form-input:focus,
  .form-textarea:focus {
    background: var(--slate-700);
    border-bottom-color: var(--primary-500);
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
