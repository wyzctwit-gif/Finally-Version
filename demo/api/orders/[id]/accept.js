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
      const { acceptor_contact } = req.body;
      if (!acceptor_contact) {
        return res.status(400).json({ error: '请填写联系方式' });
      }

      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !order) {
        return res.status(404).json({ error: '订单不存在' });
      }
      if (order.status !== '待接单') {
        return res.status(400).json({ error: '该订单已被接取或已取消' });
      }

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
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      return res.json({
        message: '接单成功',
        order: updatedOrder
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message || '接单失败' });
    }
  }

  return res.status(405).json({ error: '不支持的请求方法' });
}
