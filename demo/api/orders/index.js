import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

const setCorsHeaders = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
};

const handleOptions = (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(200).end();
    return true;
  }
  return false;
};

const handleError = (res, error, message = '服务器错误') => {
  console.error(error);
  return res.status(500).json({ error: message, details: error.message });
};

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (handleOptions(req, res)) return;

  if (req.method === 'GET') {
    try {
      const { task_type, sort_by, order } = req.query;
      
      let query = supabase
        .from('orders')
        .select('id, task_type, pickup_location, delivery_location, reward_amount, expected_time, created_at, status')
        .eq('status', '待接单')
        .gt('expires_at', new Date().toISOString());

      if (task_type && task_type !== '全部') {
        query = query.eq('task_type', task_type);
      }

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

      if (!task_type || !pickup_location || !delivery_location || !task_description || !reward_amount || !publisher_contact) {
        return res.status(400).json({ error: '请填写所有必填项' });
      }

      if (isNaN(reward_amount) || reward_amount <= 0) {
        return res.status(400).json({ error: '请输入有效金额' });
      }

      const publisher_id = 'pub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

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

  return res.status(405).json({ error: '不支持的请求方法' });
}
