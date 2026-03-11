/**
 * 设置 CORS 响应头
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 */
export function setCorsHeaders(req, res) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * 处理 OPTIONS 预检请求
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {boolean} 是否为预检请求
 */
export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * 管理员认证中间件
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {boolean} 认证是否通过
 */
export function adminAuth(req, res) {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    res.status(401).json({ error: '无权访问' });
    return false;
  }

  return true;
}

/**
 * 统一错误处理
 * @param {object} res - 响应对象
 * @param {Error} error - 错误对象
 * @param {string} message - 用户友好的错误消息
 */
export function handleError(res, error, message = '操作失败，请稍后重试') {
  console.error('API 错误:', error);
  res.status(500).json({ error: message });
}
