# 快速启动指南

## 问题已修复 ✅

1. ✅ 已添加 `npm start` 脚本到 `server/package.json`
2. ✅ 已创建 `server/.env` 配置文件模板

## 启动步骤

### 第一步：配置 Supabase（必须）

1. 访问 https://supabase.com 并登录
2. 创建新项目（或使用已有项目）
3. 进入项目后，点击左侧菜单 "SQL Editor"
4. 点击 "New query"，复制并执行以下 SQL：

```sql
-- 复制 server/database/schema.sql 的全部内容
-- 或者直接复制下面的简化版本：

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('快递代取', '外卖代取', '其他跑腿')),
  pickup_location VARCHAR(255) NOT NULL,
  delivery_location VARCHAR(255) NOT NULL,
  task_description TEXT NOT NULL,
  reward_amount DECIMAL(10, 2) NOT NULL,
  publisher_contact VARCHAR(100) NOT NULL,
  expected_time TIMESTAMP,
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT '待接单' CHECK (status IN ('待接单', '已接单', '进行中', '已完成', '已取消')),
  publisher_id VARCHAR(100),
  acceptor_id VARCHAR(100),
  acceptor_contact VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_expires_at ON orders(expires_at);
```

5. 执行成功后，点击左侧菜单 "Settings" → "API"
6. 复制以下两个值：
   - **Project URL** (类似: https://xxxxx.supabase.co)
   - **anon public** key (一长串字符串)

### 第二步：配置环境变量

编辑 `server/.env` 文件，填入真实的 Supabase 配置：

```env
# Supabase配置（替换为你的真实值）
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# 服务器配置
PORT=3000

# 管理员密钥（自定义一个密码）
ADMIN_SECRET_KEY=admin123456
```

### 第三步：启动后端服务

```bash
cd server
npm start
```

看到 "服务器运行在端口 3000" 表示启动成功！

### 第四步：启动前端服务（新终端窗口）

```bash
cd client
npm run dev
```

访问 http://localhost:5173

## 测试功能

### 1. 测试发布任务
- 访问 http://localhost:5173
- 点击 "发布代取"
- 填写表单并提交
- 应该能看到 "发布成功" 提示

### 2. 测试接单
- 点击 "接取代取"
- 查看订单列表
- 点击订单查看详情
- 点击 "接单" 并填写联系方式

### 3. 测试管理员后台
- 访问 http://localhost:5173/admin
- 输入管理员密钥（默认: admin123456）
- 查看订单统计和列表

## 常见问题

### Q: 发布失败，提示"发布失败，请稍后重试"
**A:** 检查以下几点：
1. 后端服务是否已启动（看到 "服务器运行在端口 3000"）
2. Supabase 配置是否正确（URL 和 Key）
3. 数据库表是否已创建
4. 打开浏览器开发者工具（F12）查看 Network 标签，看具体错误信息

### Q: 后端启动报错 "Missing script: start"
**A:** 已修复！请重新运行 `npm start`

### Q: 数据库连接失败
**A:**
1. 确认 Supabase 项目已创建
2. 确认 SQL 表已创建
3. 确认 .env 文件中的 URL 和 Key 正确
4. 检查网络连接

### Q: 跨域错误
**A:** 后端已配置 CORS，应该不会有跨域问题。如果仍有问题，检查前端 API 地址是否正确。

## 开发模式

如果需要修改代码并实时看到效果：

```bash
# 后端（需要手动重启）
cd server
npm start

# 前端（自动热重载）
cd client
npm run dev
```

## 生产部署

### 后端部署
推荐使用：
- Railway (https://railway.app)
- Render (https://render.com)
- Vercel (https://vercel.com)

### 前端部署
推荐使用：
- Vercel
- Netlify
- GitHub Pages

记得修改前端的 API 地址为生产环境地址！

## 需要帮助？

如果遇到其他问题，请提供：
1. 错误截图
2. 浏览器控制台错误信息（F12 → Console）
3. 后端终端错误信息
