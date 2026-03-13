import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：参数验证和日志记录
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// 订单相关API
export const orderApi = {
  // 发布任务
  create: (data) => api.post('/orders', data),

  // 获取待接订单列表
  getList: (params) => api.get('/orders', { params }),

  // 获取订单详情 - 确保 orderId 类型正确
  getDetail: (id) => {
    // 确保 id 为数字类型
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId) || numericId <= 0) {
      console.error('[orderApi.getDetail] 无效的订单ID:', id);
      return Promise.reject(new Error('无效的订单ID'));
    }

    console.log('[orderApi.getDetail] 请求订单详情, id:', numericId, '原始:', id);
    return api.get(`/orders/${numericId}`);
  },

  // 接单
  accept: (id, data) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId) || numericId <= 0) {
      console.error('[orderApi.accept] 无效的订单ID:', id);
      return Promise.reject(new Error('无效的订单ID'));
    }
    return api.post(`/orders/${numericId}/accept`, data);
  },

  // 更新订单状态
  updateStatus: (id, data) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId) || numericId <= 0) {
      console.error('[orderApi.updateStatus] 无效的订单ID:', id);
      return Promise.reject(new Error('无效的订单ID'));
    }
    return api.patch(`/orders/${numericId}/status`, data);
  },

  // 取消订单
  cancel: (id, data) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId) || numericId <= 0) {
      console.error('[orderApi.cancel] 无效的订单ID:', id);
      return Promise.reject(new Error('无效的订单ID'));
    }
    return api.post(`/orders/${numericId}/cancel`, data);
  },

  // 获取我的发布
  getMyPublished: (publisherId) => api.get('/orders/my/published', { params: { publisher_id: publisherId } }),

  // 获取我的接单
  getMyAccepted: (acceptorId) => api.get('/orders/my/accepted', { params: { acceptor_id: acceptorId } })
};

// 管理员相关API
export const adminApi = {
  // 获取所有订单
  getOrders: (params, adminKey) => api.get('/admin/orders', {
    params,
    headers: { 'x-admin-key': adminKey }
  }),

  // 获取统计数据
  getStats: (adminKey) => api.get('/admin/stats', {
    headers: { 'x-admin-key': adminKey }
  }),

  // 清理过期订单
  expireOrders: (adminKey) => api.post('/admin/expire-orders', {}, {
    headers: { 'x-admin-key': adminKey }
  })
};

export default api;
