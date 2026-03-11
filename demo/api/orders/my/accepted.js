import { getSupabase } from '../../_lib/supabase.js';
import { setCorsHeaders, handleOptions, handleError } from '../../_lib/middleware.js';

/**
 * 获取我的接单
 * GET /api/orders/my/accepted
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

  // 只支持 GET 方法
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '不支持的请求方法' });
  }

  try {
    const { acceptor_id } = req.query;

    if (!acceptor_id) {
      return res.status(400).json({ error: '缺少接单者ID' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('acceptor_id', acceptor_id)
      .order('accepted_at', { ascending: false });

    if (error) throw error;

    return res.json(data || []);
  } catch (error) {
    return handleError(res, error, '获取订单失败');
  }
}
