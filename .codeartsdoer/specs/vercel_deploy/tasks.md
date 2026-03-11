# Vercel 部署适配 - 任务规划

## 任务概览

本文档将 Vercel 部署适配工作分解为可执行的开发任务，按照依赖关系和优先级排序。

---

## 阶段一：项目结构重组

### Task 1.1：创建目标目录结构

**任务描述**：在项目根目录创建 Vercel 部署所需的目录结构

**操作步骤**：
1. 在 `g:\demo_1\demo\` 下创建 `api/` 目录
2. 创建 `api/_lib/` 子目录（存放公共模块）
3. 创建 `api/orders/` 子目录
4. 创建 `api/orders/[id]/` 子目录
5. 创建 `api/orders/my/` 子目录
6. 创建 `api/admin/` 子目录

**验收标准**：
- 目录结构符合 design.md 中定义的目标架构
- 所有目录创建成功，无报错

**依赖**：无

---

### Task 1.2：创建公共模块

**任务描述**：创建 Supabase 客户端封装和公共中间件

**操作步骤**：
1. 创建 `api/_lib/supabase.js` - Supabase 客户端初始化
2. 创建 `api/_lib/middleware.js` - CORS 处理、管理员认证中间件

**文件清单**：
- `api/_lib/supabase.js`
- `api/_lib/middleware.js`

**验收标准**：
- Supabase 客户端正确初始化，从环境变量读取配置
- CORS 中间件正确设置响应头
- 管理员认证中间件正确验证 x-admin-key

**依赖**：Task 1.1

---

## 阶段二：API 路由转换

### Task 2.1：转换订单列表接口

**任务描述**：将 Express 的订单列表路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/orders/index.js`
2. 实现 GET 方法：获取待接订单列表（支持筛选和排序）
3. 实现 POST 方法：发布新任务
4. 添加 CORS 头处理
5. 添加 OPTIONS 预检请求处理

**文件清单**：
- `api/orders/index.js`

**验收标准**：
- GET /api/orders 返回待接订单列表
- POST /api/orders 成功创建订单
- CORS 头正确设置

**依赖**：Task 1.2

---

### Task 2.2：转换订单详情接口

**任务描述**：将订单详情路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/orders/[id].js`
2. 实现 GET 方法：获取订单详情
3. 处理动态路由参数 `id`
4. 添加敏感信息隐藏逻辑（已接单时隐藏发布者联系方式）

**文件清单**：
- `api/orders/[id].js`

**验收标准**：
- GET /api/orders/:id 返回订单详情
- 已接单订单的 publisher_contact 显示为 `***`

**依赖**：Task 1.2

---

### Task 2.3：转换接单接口

**任务描述**：将接单路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/orders/[id]/accept.js`
2. 实现 POST 方法：接单逻辑
3. 添加并发控制（确保订单状态仍为待接单）
4. 返回发布者联系方式

**文件清单**：
- `api/orders/[id]/accept.js`

**验收标准**：
- POST /api/orders/:id/accept 成功接单
- 并发接单时只有一个请求成功
- 返回发布者联系方式

**依赖**：Task 1.2

---

### Task 2.4：转换订单状态更新接口

**任务描述**：将订单状态更新路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/orders/[id]/status.js`
2. 实现 PATCH 方法：更新订单状态
3. 添加状态流转验证（已接单→进行中→已完成）
4. 记录完成时间

**文件清单**：
- `api/orders/[id]/status.js`

**验收标准**：
- PATCH /api/orders/:id/status 成功更新状态
- 非法状态流转返回 400 错误
- 完成时记录 completed_at

**依赖**：Task 1.2

---

### Task 2.5：转换取消订单接口

**任务描述**：将取消订单路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/orders/[id]/cancel.js`
2. 实现 POST 方法：取消订单逻辑
3. 支持发布者取消和接单者取消两种类型
4. 更新订单状态

**文件清单**：
- `api/orders/[id]/cancel.js`

**验收标准**：
- POST /api/orders/:id/cancel 成功取消
- 发布者取消：订单变为已取消
- 接单者取消：订单恢复为待接单

**依赖**：Task 1.2

---

### Task 2.6：转换我的发布接口

**任务描述**：将获取我的发布路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/orders/my/published.js`
2. 实现 GET 方法：根据 publisher_id 查询订单
3. 按创建时间倒序排列

**文件清单**：
- `api/orders/my/published.js`

**验收标准**：
- GET /api/orders/my/published?publisher_id=xxx 返回订单列表
- 缺少 publisher_id 返回 400 错误

**依赖**：Task 1.2

---

### Task 2.7：转换我的接单接口

**任务描述**：将获取我的接单路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/orders/my/accepted.js`
2. 实现 GET 方法：根据 acceptor_id 查询订单
3. 按接单时间倒序排列

**文件清单**：
- `api/orders/my/accepted.js`

**验收标准**：
- GET /api/orders/my/accepted?acceptor_id=xxx 返回订单列表
- 缺少 acceptor_id 返回 400 错误

**依赖**：Task 1.2

---

### Task 2.8：转换管理员订单接口

**任务描述**：将管理员获取订单路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/admin/orders.js`
2. 实现 GET 方法：分页获取所有订单
3. 添加管理员认证中间件
4. 支持状态筛选

**文件清单**：
- `api/admin/orders.js`

**验收标准**：
- GET /api/admin/orders 返回分页订单列表
- 缺少或错误的 x-admin-key 返回 401 错误
- 支持分页和状态筛选

**依赖**：Task 1.2

---

### Task 2.9：转换管理员统计接口

**任务描述**：将管理员统计路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/admin/stats.js`
2. 实现 GET 方法：获取各状态订单数量统计
3. 添加今日订单数统计
4. 添加管理员认证中间件

**文件清单**：
- `api/admin/stats.js`

**验收标准**：
- GET /api/admin/stats 返回统计数据
- 统计数据包含 total、pending、accepted、inProgress、completed、cancelled、today

**依赖**：Task 1.2

---

### Task 2.10：转换过期订单清理接口

**任务描述**：将过期订单清理路由转换为 Serverless Function

**操作步骤**：
1. 创建 `api/admin/expire-orders.js`
2. 实现 POST 方法：调用 Supabase RPC 清理过期订单
3. 添加管理员认证中间件

**文件清单**：
- `api/admin/expire-orders.js`

**验收标准**：
- POST /api/admin/expire-orders 成功清理过期订单
- 缺少或错误的 x-admin-key 返回 401 错误

**依赖**：Task 1.2

---

## 阶段三：前端配置优化

### Task 3.1：更新 vite.config.js

**任务描述**：优化 Vite 配置以支持 Vercel 部署

**操作步骤**：
1. 添加 build.outDir 配置为 `dist`
2. 添加 build.assetsDir 配置为 `assets`
3. 添加开发服务器代理配置（/api 代理到 localhost:3000）
4. 禁用生产环境 sourcemap

**文件清单**：
- `vite.config.js`（从 client/ 移动到根目录）

**验收标准**：
- npm run build 输出到 dist/ 目录
- 开发环境 /api 请求代理到 localhost:3000

**依赖**：无

---

### Task 3.2：更新前端 API 配置

**任务描述**：确保前端 API 地址使用环境变量

**操作步骤**：
1. 检查 `src/api/index.js` 中的 API_BASE_URL 配置
2. 确认使用 `import.meta.env.VITE_API_BASE_URL` 环境变量
3. 确认默认值为 `/api`（相对路径，适用于 Vercel 部署）

**文件清单**：
- `src/api/index.js`

**验收标准**：
- API 地址从环境变量读取
- 默认值为 `/api`
- 无硬编码的生产环境 URL

**依赖**：无

---

### Task 3.3：移动前端源码到根目录

**任务描述**：将 client/ 目录下的源码移动到项目根目录

**操作步骤**：
1. 将 `client/src/` 移动到根目录 `src/`
2. 将 `client/public/` 移动到根目录 `public/`
3. 将 `client/index.html` 移动到根目录
4. 更新 index.html 中的脚本引用路径

**文件清单**：
- `src/`（从 client/src 移动）
- `public/`（从 client/public 移动）
- `index.html`（从 client/ 移动）

**验收标准**：
- 源码目录结构符合 Vercel 部署规范
- index.html 正确引用 main.js

**依赖**：Task 3.1

---

## 阶段四：配置文件创建

### Task 4.1：创建 vercel.json

**任务描述**：创建 Vercel 部署配置文件

**操作步骤**：
1. 创建 `vercel.json` 文件
2. 配置构建命令和输出目录
3. 配置 Serverless Functions 运行时和超时时间
4. 配置 SPA 路由重写规则
5. 配置 CORS 响应头
6. 配置静态资源缓存策略

**文件清单**：
- `vercel.json`

**验收标准**：
- Vercel 构建时正确读取配置
- SPA 路由正常工作（访问 /publish 返回 index.html）
- API 路由正常工作
- 静态资源启用长期缓存

**依赖**：Task 2.10, Task 3.3

---

### Task 4.2：合并 package.json

**任务描述**：合并前后端依赖到根目录 package.json

**操作步骤**：
1. 创建根目录 `package.json`
2. 合并 client/package.json 和 server/package.json 的依赖
3. 配置 scripts：dev、build、preview
4. 设置 type 为 "module"
5. 配置 Node.js 引擎版本要求

**文件清单**：
- `package.json`（根目录）

**验收标准**：
- npm install 成功安装所有依赖
- npm run build 成功构建前端
- 无依赖版本冲突

**依赖**：Task 3.3

---

### Task 4.3：创建环境变量示例文件

**任务描述**：创建 .env.example 文件供参考

**操作步骤**：
1. 创建 `.env.example` 文件
2. 列出所有需要配置的环境变量
3. 添加注释说明每个变量的用途

**文件清单**：
- `.env.example`

**验收标准**：
- 包含所有必需的环境变量
- 每个变量有清晰的说明

**依赖**：无

---

## 阶段五：清理与验证

### Task 5.1：删除旧目录

**任务描述**：删除不再需要的旧目录结构

**操作步骤**：
1. 删除 `client/` 目录（源码已移动到根目录）
2. 删除 `server/` 目录（API 已转换为 Serverless Functions）
3. 保留 `docs/` 目录（文档）

**验收标准**：
- 旧目录已删除
- 项目结构符合 Vercel 部署规范

**依赖**：Task 4.2

---

### Task 5.2：本地构建验证

**任务描述**：在本地验证构建是否成功

**操作步骤**：
1. 执行 `npm install` 安装依赖
2. 执行 `npm run build` 构建前端
3. 检查 `dist/` 目录是否正确生成
4. 检查 `api/` 目录结构是否完整

**验收标准**：
- 构建无报错
- dist/ 目录包含 index.html 和静态资源
- api/ 目录包含所有 Serverless Function 文件

**依赖**：Task 5.1

---

### Task 5.3：更新项目文档

**任务描述**：更新 README.md 和部署文档

**操作步骤**：
1. 更新 README.md 中的项目结构说明
2. 更新 DEPLOYMENT.md 中的 Vercel 部署步骤
3. 添加环境变量配置说明
4. 删除过时的文档内容

**文件清单**：
- `README.md`
- `DEPLOYMENT.md`

**验收标准**：
- 文档内容与实际项目结构一致
- 部署步骤清晰可执行

**依赖**：Task 5.2

---

## 任务依赖关系图

```
阶段一：项目结构重组
├── Task 1.1 (创建目录结构)
│   └── Task 1.2 (创建公共模块)
│
阶段二：API 路由转换 (依赖 Task 1.2)
├── Task 2.1 (订单列表)
├── Task 2.2 (订单详情)
├── Task 2.3 (接单)
├── Task 2.4 (状态更新)
├── Task 2.5 (取消订单)
├── Task 2.6 (我的发布)
├── Task 2.7 (我的接单)
├── Task 2.8 (管理员订单)
├── Task 2.9 (管理员统计)
└── Task 2.10 (过期订单清理)
│
阶段三：前端配置优化
├── Task 3.1 (vite.config.js)
├── Task 3.2 (API 配置)
└── Task 3.3 (移动源码) ← 依赖 Task 3.1
│
阶段四：配置文件创建
├── Task 4.1 (vercel.json) ← 依赖 Task 2.10, Task 3.3
├── Task 4.2 (package.json) ← 依赖 Task 3.3
└── Task 4.3 (.env.example)
│
阶段五：清理与验证
├── Task 5.1 (删除旧目录) ← 依赖 Task 4.2
├── Task 5.2 (本地验证) ← 依赖 Task 5.1
└── Task 5.3 (更新文档) ← 依赖 Task 5.2
```

---

## 任务统计

| 阶段 | 任务数量 | 说明 |
|------|----------|------|
| 阶段一 | 2 | 项目结构重组 |
| 阶段二 | 10 | API 路由转换 |
| 阶段三 | 3 | 前端配置优化 |
| 阶段四 | 3 | 配置文件创建 |
| 阶段五 | 3 | 清理与验证 |
| **总计** | **21** | - |
