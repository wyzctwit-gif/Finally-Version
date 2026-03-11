import { getSupabase } from '../../_lib/supabase.js';
import { setCorsHeaders, handleOptions, handleError } from '../../_lib/middleware.js';

/**
 * 获取我的发布订单
 * GET /api/orders/my/published
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
    const { publisher_id } = req.query;

    if (!publisher_id) {
      return res.status(400).json({ error: '缺少发布者ID' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('publisher_id', publisher_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data || []);
  } catch (error) {
    return handleError(res, error, '获取订单失败');
  }
}
