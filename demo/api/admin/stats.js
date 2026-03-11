import { getSupabase } from '../_lib/supabase.js';
import { setCorsHeaders, handleOptions, handleError, adminAuth } from '../_lib/middleware.js';

/**
 * 获取统计数据
 * GET /api/admin/stats
 */
export default async function handler(req, res) {
  // 设置 CORS 头
  setCorsHeaders(req, res);

  // 处理预检请求
  if (handleOptions(req, res)) return;

  // 管理员认证
  if (!adminAuth(req, res)) return;

  const supabase = getSupabase();

  // 检查 Supabase 配置
  if (!supabase) {
    return res.status(503).json({
      error: '服务未配置',
      message: '请先配置 Supabase 环境变量'
    });
  }

  // 只支持 GET 方法
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '不支持的请求方法' });
  }

  try {
    // 获取各状态订单数量
    const { data: statusData, error: statusError } = await supabase
      .from('orders')
      .select('status');

    if (statusError) throw statusError;

    const stats = {
      total: statusData.length,
      pending: statusData.filter(o => o.status === '待接单').length,
      accepted: statusData.filter(o => o.status === '已接单').length,
      inProgress: statusData.filter(o => o.status === '进行中').length,
      completed: statusData.filter(o => o.status === '已完成').length,
      cancelled: statusData.filter(o => o.status === '已取消').length
    };

    // 获取今日订单数
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayData, error: todayError } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', today.toISOString());

    if (todayError) throw todayError;

    stats.today = todayData.length;

    return res.json(stats);
  } catch (error) {
    return handleError(res, error, '获取统计数据失败');
  }
}
