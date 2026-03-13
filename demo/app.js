import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

// Supabase 客户端初始化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS 配置 - 仅允许特定来源
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://campus-help.vercel.app',
  'https://campushelp.top',
  'https://www.campushelp.top'
];

const setCorsHeaders = (req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};

app.use(setCorsHeaders);

// 获取待接订单列表
app.get('/api/orders', async (req, res) => {
  const { task_type, sort_by, order } = req.query;
  
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('status', '待接单')
      .gt('expires_at', new Date().toISOString());

    if (task_type && task_type !== '全部') {
      query = query.eq('task_type', task_type);
    }

    if (sort_by === 'reward') {
      query = query.order('reward_amount', { ascending: order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 发布新订单
app.post('/api/orders', async (req, res) => {
  const { task_type, pickup_location, delivery_location, task_description, reward_amount, publisher_contact, expected_time, notes } = req.body;
  
  if (!task_type || !pickup_location || !delivery_location || !task_description || !reward_amount || !publisher_contact) {
    return res.status(400).json({ error: '请填写所有必填项' });
  }
  
  const publisher_id = 'pub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  const newOrder = {
    task_type,
    pickup_location,
    delivery_location,
    task_description,
    reward_amount,
    publisher_contact,
    expected_time: expected_time || null,
    notes: notes || null,
    status: '待接单',
    publisher_id,
    acceptor_contact: null,
    acceptor_id: null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  
  try {
    const { data, error } = await supabase.from('orders').insert([newOrder]).select();
    if (error) throw error;
    res.status(201).json({
      message: '订单创建成功',
      order: data[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取订单详情
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    console.log('[API] 获取订单详情, id:', orderId, '原始:', req.params.id);

    if (isNaN(orderId) || orderId <= 0) {
      console.error('[API] 无效的订单ID:', req.params.id);
      return res.status(400).json({
        error: '无效的订单ID',
        code: 'INVALID_ORDER_ID'
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    console.log('[API] Supabase 查询结果 - data:', data ? '存在' : '不存在', 'error:', error);

    if (error) {
      console.error('[API] Supabase 查询错误:', error);
      return res.status(500).json({
        error: '数据库查询失败',
        code: 'DATABASE_ERROR',
        details: error.message
      });
    }

    if (!data) {
      console.error('[API] 订单不存在, id:', orderId);
      return res.status(404).json({
        error: '订单不存在',
        code: 'ORDER_NOT_FOUND'
      });
    }

    // 验证数据完整性
    const requiredFields = ['id', 'task_type', 'pickup_location', 'delivery_location', 'status'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      console.warn('[API] 订单数据缺失字段:', missingFields, 'orderId:', orderId);
    }

    console.log('[API] 订单详情查询成功, id:', orderId);
    res.json(data);
  } catch (err) {
    console.error('[API] 获取订单详情异常:', err);
    res.status(500).json({
      error: err.message || '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 接单
app.post('/api/orders/:id/accept', async (req, res) => {
  const { acceptor_contact } = req.body;
  if (!acceptor_contact) return res.status(400).json({ error: '请填写联系方式' });

  try {
    // 1. 检查订单状态
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (fetchError || !order) return res.status(404).json({ error: '订单不存在' });
    if (order.status !== '待接单') return res.status(400).json({ error: '该订单已被接取或已取消' });

    // 2. 更新状态
    const acceptor_id = 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const updates = {
      status: '已接单',
      acceptor_contact,
      acceptor_id,
      accepted_at: new Date().toISOString()
    };

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    res.json({
      message: '接单成功',
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新订单状态（已取件/已送达）
app.patch('/api/orders/:id/status', async (req, res) => {
  const { status, acceptor_id } = req.body;
  
  if (!['进行中', '已完成'].includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }

  try {
    // 1. 权限校验
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (fetchError || !order) return res.status(404).json({ error: '订单不存在' });
    // 注意：实际应该校验 acceptor_id，但为了演示方便，如果前端传了正确的 acceptor_id 才允许
    // 这里简单校验一下，防止随意调用
    if (order.acceptor_id && order.acceptor_id !== acceptor_id) {
       // 如果前端没有传 acceptor_id 或者传错了，理论上应该拒绝
       // 但为了保持原有逻辑兼容性（前端可能存了 acceptor_id），这里暂不做强校验，或者假设前端是对的
       // 严谨做法：
       return res.status(403).json({ error: '无权操作此订单' });
    }

    // 2. 更新
    const updates = { status };
    if (status === '已完成') {
      updates.completed_at = new Date().toISOString();
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      message: '状态更新成功',
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 取消订单
app.post('/api/orders/:id/cancel', async (req, res) => {
  const { publisher_id, acceptor_id, cancel_type } = req.body; // cancel_type: 'publisher' | 'acceptor'

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !order) return res.status(404).json({ error: '订单不存在' });

    // 权限校验：发布者只能取消自己的订单
    if (cancel_type === 'publisher' && order.publisher_id !== publisher_id) {
      return res.status(403).json({ error: '无权取消此订单' });
    }
    
    if (order.status === '已取消' || order.status === '已完成') {
      return res.status(400).json({ error: '该订单无法取消' });
    }

    if (cancel_type === 'publisher' && order.status !== '待接单') {
      return res.status(400).json({ error: '只能取消待接单状态的订单' });
    }

    // 更新为待接单（如果被接单后取消接单）或者已取消（如果发布者取消）
    let updates = {};
    if (cancel_type === 'acceptor') {
       // 接单者取消 -> 重置为待接单
       updates = {
         status: '待接单',
         acceptor_contact: null,
         acceptor_id: null,
         accepted_at: null
       };
    } else {
       // 发布者取消 -> 彻底取消
       updates = {
         status: '已取消',
         cancelled_at: new Date().toISOString()
       };
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      message: '取消成功',
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 我的发布
app.get('/api/orders/my/published', async (req, res) => {
  const { publisher_id } = req.query;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('publisher_id', publisher_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 我的接单
app.get('/api/orders/my/accepted', async (req, res) => {
  const { acceptor_id } = req.query;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('acceptor_id', acceptor_id)
      .order('accepted_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 管理员认证中间件
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

const adminAuthMiddleware = (req, res, next) => {
  if (!ADMIN_SECRET_KEY) {
    console.error('ADMIN_SECRET_KEY 未配置');
    return res.status(503).json({ error: '服务器配置错误: 管理员接口未启用' });
  }

  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: '无效的管理员密钥' });
  }

  next();
};

// 管理员接口 - 获取所有订单
app.get('/api/admin/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 管理员接口 - 统计信息
app.get('/api/admin/stats', adminAuthMiddleware, async (req, res) => {
  res.json({ message: "暂未实现数据库统计，建议直接在 Supabase 后台查看" });
});

export default app;