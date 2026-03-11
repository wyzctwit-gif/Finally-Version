import { getSupabase } from '../_lib/supabase.js';
import { setCorsHeaders, handleOptions, handleError } from '../_lib/middleware.js';

/**
 * 订单列表接口
 * GET /api/orders - 获取待接订单列表
 * POST /api/orders - 发布新任务
 */
export default async function handler(req, res) {
  // 设置 CORS 头
  setCorsHeaders(req, res);

  // 处理预检请求
  if (handleOptions(req, res)) return;

  const supabase = getSupabase();

  // 检查 Supabase 配置
  if (!supabase) {
    return res.status(503).json({
      error: '服务未配置',
      message: '请先配置 Supabase 环境变量'
    });
  }

  // GET: 获取待接订单列表
  if (req.method === 'GET') {
    try {
      const { task_type, sort_by, order } = req.query;

      let query = supabase
        .from('orders')
        .select('id, task_type, pickup_location, delivery_location, reward_amount, expected_time, created_at, status')
        .eq('status', '待接单')
        .gt('expires_at', new Date().toISOString());

      // 按任务类型筛选
      if (task_type && task_type !== '全部') {
        query = query.eq('task_type', task_type);
      }

      // 排序
      if (sort_by === 'reward') {
        query = query.order('reward_amount', { ascending: order === 'asc' });
      } else if (sort_by === 'time') {
        query = query.order('created_at', { ascending: order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return res.json(data || []);
    } catch (error) {
      return handleError(res, error, '获取订单列表失败');
    }
  }

  // POST: 发布新任务
  if (req.method === 'POST') {
    try {
      const {
        task_type,
        pickup_location,
        delivery_location,
        task_description,
        reward_amount,
        publisher_contact,
        expected_time,
        notes
      } = req.body;

      // 验证必填字段
      if (!task_type || !pickup_location || !delivery_location || !task_description || !reward_amount || !publisher_contact) {
        return res.status(400).json({ error: '请填写所有必填项' });
      }

      // 验证报酬金额
      if (isNaN(reward_amount) || reward_amount <= 0) {
        return res.status(400).json({ error: '请输入有效金额' });
      }

      // 生成发布者ID
      const publisher_id = 'pub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // 创建订单
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          task_type,
          pickup_location,
          delivery_location,
          task_description,
          reward_amount,
          publisher_contact,
          expected_time,
          notes,
          status: '待接单',
          publisher_id
        }])
        .select();

      if (error) throw error;

      return res.status(201).json({
        message: '订单创建成功',
        order: data[0]
      });
    } catch (error) {
      return handleError(res, error, '发布失败，请稍后重试');
    }
  }

  // 不支持的方法
  return res.status(405).json({ error: '不支持的请求方法' });
}
