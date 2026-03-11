import { getSupabase } from '../../_lib/supabase.js';
import { setCorsHeaders, handleOptions, handleError } from '../../_lib/middleware.js';

/**
 * 订单状态更新接口
 * PATCH /api/orders/:id/status
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

  // 只支持 PATCH 方法
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: '不支持的请求方法' });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    // 获取当前订单状态
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 验证状态流转
    if (status === '进行中' && order.status !== '已接单') {
      return res.status(400).json({ error: '当前状态无法标记为已取件' });
    }

    if (status === '已完成' && order.status !== '进行中') {
      return res.status(400).json({ error: '当前状态无法标记为已送达' });
    }

    // 更新状态
    const updateData = { status };
    if (status === '已完成') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.json({
      message: '状态更新成功',
      order: data[0]
    });
  } catch (error) {
    return handleError(res, error, '操作失败，请稍后重试');
  }
}
