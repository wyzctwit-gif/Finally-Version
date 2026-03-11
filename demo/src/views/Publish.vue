<template>
  <div class="publish-page">
    <!-- 页面头部 -->
    <header class="page-header animate-fade-in-down">
      <button class="back-btn" @click="handleCancel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
      <div class="header-text">
        <h1 class="page-title">发布代取</h1>
        <p class="page-subtitle">填写代取需求，等待接单</p>
      </div>
    </header>

    <!-- 表单区域 -->
    <form @submit.prevent="handleSubmit" class="publish-form">
      <!-- 任务类型 -->
      <div class="form-section animate-fade-in-up stagger-1">
        <label class="section-label">
          <span>任务类型</span>
          <span class="required">*</span>
        </label>
        <div class="type-selector">
          <button
            type="button"
            :class="['type-option', { active: form.task_type === '快递代取' }]"
            @click="form.task_type = '快递代取'"
          >
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 00-1-1.73L13 2.27a2 2 0 00-2 0L4 6.27A2 2 0 003 8v8a2 2 0 001 1.73L11 21.73a2 2 0 002 0L20 17.73A2 2 0 0021 16z"/>
                <path d="M12 22V12M12 8L3.5 12.5"/>
              </svg>
            </div>
            <span>快递代取</span>
          </button>
          <button
            type="button"
            :class="['type-option', { active: form.task_type === '外卖代取' }]"
            @click="form.task_type = '外卖代取'"
          >
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM12 8v8M8 12h8"/>
              </svg>
            </div>
            <span>外卖代取</span>
          </button>
          <button
            type="button"
            :class="['type-option', { active: form.task_type === '其他跑腿' }]"
            @click="form.task_type = '其他跑腿'"
          >
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
            </div>
            <span>其他跑腿</span>
          </button>
        </div>
        <span v-if="errors.task_type" class="error-text">{{ errors.task_type }}</span>
      </div>

      <!-- 取件地点 -->
      <div class="form-group animate-fade-in-up stagger-2">
        <label class="form-label">
          <span>取件地点</span>
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </span>
          <input
            v-model="form.pickup_location"
            type="text"
            class="form-input"
            placeholder="例：校内快递中心 / 校外美团外卖点"
          />
        </div>
        <span v-if="errors.pickup_location" class="error-text">{{ errors.pickup_location }}</span>
      </div>

      <!-- 送达地点 -->
      <div class="form-group animate-fade-in-up stagger-3">
        <label class="form-label">
          <span>送达地点</span>
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </span>
          <input
            v-model="form.delivery_location"
            type="text"
            class="form-input"
            placeholder="例：男生宿舍 3 号楼 / 女生宿舍 5 号楼 201 室"
          />
        </div>
        <span v-if="errors.delivery_location" class="error-text">{{ errors.delivery_location }}</span>
      </div>

      <!-- 任务描述 -->
      <div class="form-group animate-fade-in-up stagger-4">
        <label class="form-label">
          <span>任务描述</span>
          <span class="required">*</span>
        </label>
        <div class="input-wrapper textarea-wrapper">
          <textarea
            v-model="form.task_description"
            class="form-textarea"
            rows="3"
            placeholder="请填写快递单号后 4 位、外卖订单号、包裹大小等信息"
          ></textarea>
        </div>
        <span v-if="errors.task_description" class="error-text">{{ errors.task_description }}</span>
      </div>

      <!-- 报酬金额 -->
      <div class="form-group animate-fade-in-up stagger-5">
        <label class="form-label">
          <span>报酬金额</span>
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </span>
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
      <div class="form-group animate-fade-in-up stagger-6">
        <label class="form-label">
          <span>联系方式</span>
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
            </svg>
          </span>
          <input
            v-model="form.publisher_contact"
            type="text"
            class="form-input"
            placeholder="例：微信号 / QQ 号"
          />
        </div>
        <span v-if="errors.publisher_contact" class="error-text">{{ errors.publisher_contact }}</span>
      </div>

      <!-- 期望时间 -->
      <div class="form-group animate-fade-in-up stagger-7">
        <label class="form-label">
          <span>期望时间</span>
          <span class="optional">（选填）</span>
        </label>
        <div class="input-wrapper">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6V12L16 14" stroke-linecap="round"/>
            </svg>
          </span>
          <input
            v-model="form.expected_time"
            type="datetime-local"
            class="form-input"
          />
        </div>
      </div>

      <!-- 备注 -->
      <div class="form-group animate-fade-in-up stagger-8">
        <label class="form-label">
          <span>备注</span>
          <span class="optional">（选填）</span>
        </label>
        <div class="input-wrapper textarea-wrapper">
          <textarea
            v-model="form.notes"
            class="form-textarea"
            rows="3"
            placeholder="其他需要说明的信息"
          ></textarea>
        </div>
      </div>

      <!-- 风险提示 -->
      <div class="alert alert-warning animate-fade-in-up stagger-9">
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <path d="M12 9V13M12 17H12.01" stroke-linecap="round"/>
        </svg>
        <span>交易前请仔细核对信息，注意人身和财产安全</span>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions animate-fade-in-up stagger-10">
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
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { orderApi } from '../api';

const router = useRouter();
const loading = ref(false);

const form = reactive({
  task_type: '',
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
    router.push('/orders');
  } catch (error) {
    alert(error.response?.data?.error || '发布失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/');
};
</script>

<style scoped>
.publish-page {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding) calc(80px + env(safe-area-inset-bottom));
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) 0 var(--space-4);
  margin-bottom: var(--space-4);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  color: var(--slate-600);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-size: 14px;
}

.back-btn:hover {
  color: var(--primary-600);
  background: var(--primary-50);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--slate-800);
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--slate-500);
  margin: 4px 0 0 0;
}

/* 表单区域 */
.publish-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* 任务类型选择器 */
.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-2);
  background: var(--gradient-surface);
  border: 2px solid var(--slate-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  font-size: 13px;
  font-weight: 500;
  color: var(--slate-600);
}

.type-option:hover {
  border-color: var(--slate-300);
  background: var(--slate-50);
}

.type-option.active {
  border-color: var(--primary-500);
  background: var(--primary-50);
  color: var(--primary-700);
}

.option-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--slate-100);
  transition: all var(--duration-normal) var(--ease-out);
}

.option-icon svg {
  width: 18px;
  height: 18px;
}

.type-option.active .option-icon {
  background: var(--primary-500);
  color: white;
}

.type-option svg {
  width: 16px;
  height: 16px;
}

/* 表单组 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 14px;
  font-weight: 500;
  color: var(--slate-700);
}

.required {
  color: var(--danger);
}

.optional {
  color: var(--slate-400);
  font-weight: 400;
}

/* 输入框 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--space-4);
  width: 20px;
  height: 20px;
  color: var(--slate-400);
  pointer-events: none;
  z-index: 1;
}

.input-icon svg {
  width: 100%;
  height: 100%;
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  padding-left: var(--space-11);
  font-family: inherit;
  font-size: 15px;
  color: var(--slate-800);
  background: #FFFFFF;
  border: 1.5px solid var(--slate-200);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.form-input:hover {
  border-color: var(--slate-300);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-400);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.form-input::placeholder {
  color: var(--slate-400);
}

.input-suffix {
  position: absolute;
  right: var(--space-4);
  font-size: 14px;
  color: var(--slate-500);
  pointer-events: none;
}

/* 文本域 */
.textarea-wrapper {
  padding-top: 0;
}

.textarea-wrapper .input-icon {
  top: var(--space-3);
}

.form-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  padding-left: var(--space-11);
  font-family: inherit;
  font-size: 15px;
  color: var(--slate-800);
  background: #FFFFFF;
  border: 1.5px solid var(--slate-200);
  border-radius: var(--radius-md);
  resize: vertical;
  min-height: 80px;
  transition: all var(--duration-fast) var(--ease-out);
}

.form-textarea:hover {
  border-color: var(--slate-300);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-400);
  box-shadow: 0 0 0 3px var(--primary-100);
}

/* 错误提示 */
.error-text {
  font-size: 13px;
  color: var(--danger);
  margin-top: -2px;
}

/* 警告框 */
.alert {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  font-size: 14px;
  line-height: 1.5;
}

.alert-warning {
  background: var(--warning-bg);
  color: #92400E;
  border: 1px solid #FDE68A;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #D97706;
}

.alert-icon svg {
  width: 100%;
  height: 100%;
}

/* 表单操作 */
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
  padding: var(--space-4) var(--space-6);
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--slate-100);
  color: var(--slate-700);
}

.btn-secondary:hover {
  background: var(--slate-200);
}

.btn-primary {
  background: var(--gradient-primary);
  color: #FFFFFF;
  box-shadow: var(--shadow-primary);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary-hover);
  transform: translateY(-1px);
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .back-btn {
    color: var(--slate-400);
  }

  .back-btn:hover {
    color: var(--primary-400);
    background: rgba(255, 107, 53, 0.1);
  }

  .type-option {
    background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%);
    border-color: var(--slate-700);
  }

  .type-option:hover {
    border-color: var(--slate-600);
  }

  .type-option.active {
    border-color: var(--primary-500);
    background: rgba(255, 107, 53, 0.15);
  }

  .form-input,
  .form-textarea {
    background: #1E293B;
    border-color: var(--slate-700);
  }

  .form-input:hover,
  .form-textarea:hover {
    border-color: var(--slate-600);
  }

  .btn-secondary {
    background: var(--slate-700);
  }

  .btn-secondary:hover {
    background: var(--slate-600);
  }
}
</style>
