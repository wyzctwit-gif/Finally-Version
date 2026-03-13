import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { status, acceptor_id } = req.body;
      
      if (!['进行中', '已完成'].includes(status)) {
        return res.status(400).json({ error: '无效的状态' });
      }

      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !order) {
        return res.status(404).json({ error: '订单不存在' });
      }
      
      if (order.acceptor_id && order.acceptor_id !== acceptor_id) {
        return res.status(403).json({ error: '无权操作此订单' });
      }

      const updates = { status };
      if (status === '已完成') {
        updates.completed_at = new Date().toISOString();
      }

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return res.json({
        message: '状态更新成功',
        order: updatedOrder
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message || '状态更新失败' });
    }
  }

  return res.status(405).json({ error: '不支持的请求方法' });
}
