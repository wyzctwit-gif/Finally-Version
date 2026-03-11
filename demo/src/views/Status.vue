<template>
  <div class="status-page">
    <div class="header">
      <router-link to="/" class="back-btn">← 返回</router-link>
      <h2>系统状态</h2>
    </div>

    <div class="status-card">
      <h3>配置状态检查</h3>

      <div class="status-item">
        <span class="label">前端服务:</span>
        <span class="status online">✓ 运行中</span>
      </div>

      <div class="status-item">
        <span class="label">后端服务:</span>
        <span :class="['status', backendStatus]">{{ backendMessage }}</span>
      </div>

      <div class="status-item">
        <span class="label">数据库配置:</span>
        <span :class="['status', dbStatus]">{{ dbMessage }}</span>
      </div>
    </div>

    <div v-if="!isConfigured" class="config-guide">
      <h3>📋 配置步骤</h3>

      <div class="step">
        <h4>步骤 1: 创建 Supabase 项目</h4>
        <p>访问 <a href="https://supabase.com" target="_blank">https://supabase.com</a> 并创建新项目</p>
      </div>

      <div class="step">
        <h4>步骤 2: 创建数据表</h4>
        <p>在 Supabase SQL Editor 中执行以下 SQL：</p>
        <button @click="showSQL = !showSQL" class="btn secondary">
          {{ showSQL ? '隐藏 SQL' : '显示 SQL' }}
        </button>
        <div v-if="showSQL" class="sql-code">
          <pre>{{ sqlCode }}</pre>
          <button @click="copySQL" class="btn primary">复制 SQL</button>
        </div>
      </div>

      <div class="step">
        <h4>步骤 3: 获取配置信息</h4>
        <p>在 Supabase 项目设置中找到：</p>
        <ul>
          <li>Project URL (类似: https://xxxxx.supabase.co)</li>
          <li>anon public key (一长串字符串)</li>
        </ul>
      </div>

      <div class="step">
        <h4>步骤 4: 配置环境变量</h4>
        <p>编辑 <code>server/.env</code> 文件：</p>
        <div class="code-block">
          <pre>SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here</pre>
        </div>
      </div>

      <div class="step">
        <h4>步骤 5: 重启服务</h4>
        <p>配置完成后，重启后端服务：</p>
        <div class="code-block">
          <pre>cd server
npm start</pre>
        </div>
      </div>
    </div>

    <div v-else class="success-message">
      <h3>✓ 系统配置完成</h3>
      <p>所有服务运行正常，可以开始使用系统了！</p>
      <router-link to="/" class="btn primary">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const backendStatus = ref('checking');
const backendMessage = ref('检查中...');
const dbStatus = ref('checking');
const dbMessage = ref('检查中...');
const isConfigured = ref(false);
const showSQL = ref(false);

const sqlCode = `CREATE TABLE orders (
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
CREATE INDEX idx_orders_expires_at ON orders(expires_at);`;

const checkStatus = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/orders');
    backendStatus.value = 'online';
    backendMessage.value = '✓ 运行中';
    dbStatus.value = 'online';
    dbMessage.value = '✓ 已配置';
    isConfigured.value = true;
  } catch (error) {
    backendStatus.value = 'online';
    backendMessage.value = '✓ 运行中';

    if (error.response?.status === 503) {
      dbStatus.value = 'offline';
      dbMessage.value = '✗ 未配置';
    } else if (error.response?.status === 404) {
      dbStatus.value = 'offline';
      dbMessage.value = '✗ 数据表未创建';
    } else {
      dbStatus.value = 'offline';
      dbMessage.value = '✗ 连接失败';
    }
  }
};

const copySQL = () => {
  navigator.clipboard.writeText(sqlCode);
  alert('SQL 已复制到剪贴板！');
};

onMounted(() => {
  checkStatus();
});
</script>

<style scoped>
.status-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  color: #667eea;
  text-decoration: none;
  margin-right: 15px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
}

.status-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.status-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
}

.status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.status.online {
  background: #d4edda;
  color: #155724;
}

.status.offline {
  background: #f8d7da;
  color: #721c24;
}

.status.checking {
  background: #fff3cd;
  color: #856404;
}

.config-guide {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-guide h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.step {
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #f0f0f0;
}

.step:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.step h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.step p {
  margin: 0 0 10px 0;
  color: #666;
  line-height: 1.6;
}

.step ul {
  margin: 10px 0;
  padding-left: 20px;
  color: #666;
}

.step li {
  margin-bottom: 5px;
}

.code-block {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
}

.code-block pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #333;
}

.sql-code {
  margin-top: 15px;
}

.sql-code pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin-top: 10px;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.success-message {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.success-message h3 {
  margin: 0 0 10px 0;
  color: #155724;
}

.success-message p {
  margin: 0 0 20px 0;
  color: #155724;
}

a {
  color: #667eea;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}
</style>
