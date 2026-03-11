# 校园代取系统 V1.0

一个基于 Vue3 + Vercel Serverless Functions + Supabase 的校园代取系统，解决校园代取快递、外卖的需求。

## 功能特性

### 用户功能
- 发布代取任务（快递代取、外卖代取、其他跑腿）
- 浏览待接订单列表
- 筛选和排序订单（按类型、报酬、时间）
- 接单并获取发布者联系方式
- 更新订单状态（已取件、已送达）
- 取消订单（发布者取消待接单、接单者取消已接单）
- 查看我的发布和我的接单

### 管理员功能
- 查看所有订单
- 查看统计数据
- 清理过期订单

### 系统特性
- 订单自动过期（24小时）
- 并发控制（先到先得）
- 匿名发布和接单
- 移动端友好设计
- **支持 Vercel 一键部署**

## 技术栈

### 前端
- Vue 3
- Vue Router
- Axios
- Vite

### 后端
- Vercel Serverless Functions
- Supabase (PostgreSQL)

## 项目结构

```
demo/
├── api/                      # Vercel Serverless Functions
│   ├── _lib/                 # 公共模块
│   │   ├── supabase.js       # Supabase 客户端
│   │   └── middleware.js     # CORS、认证中间件
│   ├── orders/               # 订单 API
│   │   ├── index.js          # GET/POST /api/orders
│   │   ├── [id].js           # GET /api/orders/:id
│   │   ├── [id]/             # 订单操作
│   │   │   ├── accept.js     # POST /api/orders/:id/accept
│   │   │   ├── status.js     # PATCH /api/orders/:id/status
│   │   │   └── cancel.js     # POST /api/orders/:id/cancel
│   │   └── my/               # 我的订单
│   │       ├── published.js  # GET /api/orders/my/published
│   │       └── accepted.js   # GET /api/orders/my/accepted
│   └── admin/                # 管理员 API
│       ├── orders.js         # GET /api/admin/orders
│       ├── stats.js          # GET /api/admin/stats
│       └── expire-orders.js  # POST /api/admin/expire-orders
│
├── src/                      # Vue 3 前端源码
│   ├── api/                  # API 接口封装
│   ├── router/               # 路由配置
│   ├── views/                # 页面组件
│   ├── components/           # 公共组件
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
│
├── public/                   # 静态资源
├── index.html                # HTML 模板
├── vite.config.js            # Vite 配置
├── vercel.json               # Vercel 部署配置
├── package.json              # 依赖管理
└── .env.example              # 环境变量示例
```

## 快速开始

### 本地开发

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置 Supabase

1. 访问 [Supabase](https://supabase.com/) 创建项目
2. 在 SQL Editor 中执行以下 SQL 创建数据表：

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  task_type VARCHAR(50) NOT NULL,
  pickup_location VARCHAR(200) NOT NULL,
  delivery_location VARCHAR(200) NOT NULL,
  task_description TEXT NOT NULL,
  reward_amount DECIMAL(10,2) NOT NULL,
  publisher_contact VARCHAR(100) NOT NULL,
  publisher_id VARCHAR(100),
  acceptor_contact VARCHAR(100),
  acceptor_id VARCHAR(100),
  expected_time TIMESTAMP,
  notes TEXT,
  status VARCHAR(20) DEFAULT '待接单',
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

-- 创建过期订单清理函数
CREATE OR REPLACE FUNCTION expire_old_orders()
RETURNS void AS $$
BEGIN
  UPDATE orders
  SET status = '已取消', cancelled_at = NOW()
  WHERE status = '待接单' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

3. 复制项目的 URL 和 anon key

#### 3. 配置环境变量

创建 `.env.local` 文件：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 管理员密钥
ADMIN_SECRET_KEY=your_admin_secret_key

# 前端 API 地址（本地开发）
VITE_API_BASE_URL=http://localhost:3000/api
```

#### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### Vercel 部署

#### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/campus-delivery.git
git push -u origin main
```

#### 2. 在 Vercel 导入项目

1. 访问 [Vercel](https://vercel.com/)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. Vercel 会自动检测 Vite 框架

#### 3. 配置环境变量

在 Vercel 项目设置 > Environment Variables 中添加：

| 变量名 | 值 |
|--------|-----|
| `SUPABASE_URL` | 你的 Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | 你的 Supabase anon key |
| `ADMIN_SECRET_KEY` | 管理员认证密钥 |

#### 4. 部署

点击 "Deploy"，Vercel 会自动完成构建和部署。

## API 文档

### 订单相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/orders | 发布任务 |
| GET | /api/orders | 获取待接订单列表 |
| GET | /api/orders/:id | 获取订单详情 |
| POST | /api/orders/:id/accept | 接单 |
| PATCH | /api/orders/:id/status | 更新订单状态 |
| POST | /api/orders/:id/cancel | 取消订单 |
| GET | /api/orders/my/published | 获取我的发布 |
| GET | /api/orders/my/accepted | 获取我的接单 |

### 管理员相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/orders | 获取所有订单 |
| GET | /api/admin/stats | 获取统计数据 |
| POST | /api/admin/expire-orders | 清理过期订单 |

> 管理员接口需要在请求头中携带 `x-admin-key`

## 订单状态流转

```
待接单 → 已接单 → 进行中 → 已完成
  ↓        ↓
已取消   待接单 (接单者取消)
```

## 注意事项

1. **匿名系统**: 当前版本为匿名发布和接单，使用 localStorage 存储用户 ID
2. **风险提示**: 系统仅提供信息发布平台，交易双方需自行承担风险
3. **并发控制**: 接单时使用数据库状态检查实现先到先得
4. **自动过期**: 订单发布24小时后自动标记为已取消

## 许可证

MIT
