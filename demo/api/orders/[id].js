import { getSupabase } from '../_lib/supabase.js';
import { setCorsHeaders, handleOptions, handleError } from '../_lib/middleware.js';

/**
 * 订单详情接口
 * GET /api/orders/:id - 获取订单详情
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
    const { id } = req.query;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 如果订单已被接单，隐藏发布者联系方式（除非是接单者）
    if (data.status !== '待接单') {
      data.publisher_contact = '***';
    }

    return res.json(data);
  } catch (error) {
    return handleError(res, error, '获取订单详情失败');
  }
}
