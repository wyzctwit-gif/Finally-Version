import { getSupabase } from '../../_lib/supabase.js';
import { setCorsHeaders, handleOptions, handleError } from '../../_lib/middleware.js';

/**
 * 接单接口
 * POST /api/orders/:id/accept
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

  // 只支持 POST 方法
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '不支持的请求方法' });
  }

  try {
    const { id } = req.query;
    const { acceptor_contact } = req.body;

    if (!acceptor_contact) {
      return res.status(400).json({ error: '请填写联系方式' });
    }

    // 检查订单状态
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (order.status !== '待接单') {
      return res.status(400).json({ error: '该订单已被接取' });
    }

    // 生成接单者ID
    const acceptor_id = 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 更新订单状态（并发控制）
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: '已接单',
        acceptor_contact,
        acceptor_id,
        accepted_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', '待接单')
      .select();

    if (error || data.length === 0) {
      return res.status(400).json({ error: '该订单已被接取' });
    }

    return res.json({
      message: '接单成功',
      order: data[0],
      publisher_contact: order.publisher_contact
    });
  } catch (error) {
    return handleError(res, error, '接单失败，请稍后重试');
  }
}
