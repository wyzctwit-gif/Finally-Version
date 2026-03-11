import { getSupabase } from '../_lib/supabase.js';
import { setCorsHeaders, handleOptions, handleError, adminAuth } from '../_lib/middleware.js';

/**
 * 清理过期订单
 * POST /api/admin/expire-orders
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

  // 只支持 POST 方法
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '不支持的请求方法' });
  }

  try {
    const { error } = await supabase.rpc('expire_old_orders');

    if (error) throw error;

    return res.json({ message: '过期订单已清理' });
  } catch (error) {
    return handleError(res, error, '清理失败');
  }
}
