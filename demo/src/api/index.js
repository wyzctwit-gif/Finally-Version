import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 订单相关API
export const orderApi = {
  // 发布任务
  create: (data) => api.post('/orders', data),

  // 获取待接订单列表
  getList: (params) => api.get('/orders', { params }),

  // 获取订单详情
  getDetail: (id) => api.get(`/orders/${id}`),

  // 接单
  accept: (id, data) => api.post(`/orders/${id}/accept`, data),

  // 更新订单状态
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),

  // 取消订单
  cancel: (id, data) => api.post(`/orders/${id}/cancel`, data),

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
