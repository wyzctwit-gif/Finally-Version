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

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (handleOptions(req, res)) return;

  if (!ADMIN_SECRET_KEY) {
    console.error('ADMIN_SECRET_KEY 未配置');
    return res.status(503).json({ error: '服务器配置错误: 管理员接口未启用' });
  }

  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: '无效的管理员密钥' });
  }

  if (req.method === 'GET') {
    try {
      const { data: allOrders, error } = await supabase.from('orders').select('status');
      if (error) throw error;

      const stats = {
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === '待接单').length,
        accepted: allOrders.filter(o => o.status === '已接单').length,
        inProgress: allOrders.filter(o => o.status === '进行中').length,
        completed: allOrders.filter(o => o.status === '已完成').length,
        cancelled: allOrders.filter(o => o.status === '已取消').length
      };

      return res.json(stats);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: '不支持的请求方法' });
}
