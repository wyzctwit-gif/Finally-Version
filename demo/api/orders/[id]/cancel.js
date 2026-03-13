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

  if (req.method === 'POST') {
    try {
      const { publisher_id, acceptor_id, cancel_type } = req.body;

      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !order) {
        return res.status(404).json({ error: '订单不存在' });
      }

      if (cancel_type === 'publisher' && order.publisher_id !== publisher_id) {
        return res.status(403).json({ error: '无权取消此订单' });
      }
      
      if (order.status === '已取消' || order.status === '已完成') {
        return res.status(400).json({ error: '该订单无法取消' });
      }

      if (cancel_type === 'publisher' && order.status !== '待接单') {
        return res.status(400).json({ error: '只能取消待接单状态的订单' });
      }

      let updates = {};
      if (cancel_type === 'acceptor') {
        updates = {
          status: '待接单',
          acceptor_contact: null,
          acceptor_id: null,
          accepted_at: null
        };
      } else {
        updates = {
          status: '已取消',
          cancelled_at: new Date().toISOString()
        };
      }

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return res.json({
        message: '取消成功',
        order: updatedOrder
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message || '取消失败' });
    }
  }

  return res.status(405).json({ error: '不支持的请求方法' });
}
