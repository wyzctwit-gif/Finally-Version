import { getSupabase } from '../../_lib/supabase.js';
import { setCorsHeaders, handleOptions, handleError } from '../../_lib/middleware.js';

/**
 * 取消订单接口
 * POST /api/orders/:id/cancel
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
    const { cancel_type } = req.body;

    // 获取订单信息
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (cancel_type === 'publisher') {
      // 发布者取消
      if (order.status !== '待接单') {
        return res.status(400).json({ error: '订单已被接取，无法取消' });
      }

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: '已取消',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      return res.json({ message: '订单已取消', order: data[0] });
    } else if (cancel_type === 'acceptor') {
      // 接单者取消
      if (order.status !== '已接单') {
        return res.status(400).json({ error: '当前状态无法取消接单' });
      }

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: '待接单',
          acceptor_contact: null,
          accepted_at: null
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      return res.json({ message: '已取消接单，订单重新开放', order: data[0] });
    } else {
      return res.status(400).json({ error: '无效的取消类型' });
    }
  } catch (error) {
    return handleError(res, error, '操作失败，请稍后重试');
  }
}
