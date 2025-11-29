# 自动签到脚本合集

本仓库包含多个自动签到和任务脚本，适用于青龙面板等自动化工具。

## 📋 脚本列表

### 1. 吉利银河 (jlyh.js)
- **功能**: 吉利银河 APP 自动签到和任务
- **定时**: `08 15 * * *`
- **环境变量**: `jlyh`
- **变量格式**: `refreshToken值&deviceSN值`
- **获取方法**: 
  - 抓包 `https://galaxy-user-api.geely.com/api/v1/login/refresh?refreshToken=` 后面的值
  - 或抓短信登录包 `https://galaxy-user-api.geely.com/api/v1/login/mobileCodeLogin` 返回体中的 refreshToken
  - 同时需要请求头 headers 中的 deviceSN 值
  - 两个值用 `&` 连接

### 2. 霖久智服 (ljzf.js)
- **功能**: 霖久智服小程序自动任务（看广告、浏览公众号等）
- **环境变量**: `G_ljzfhd`
- **变量格式**: 手机号，多账号用 `&` 或换行分隔
- **获取方法**: 小程序登录后直接填写手机号即可，无需抓包
- **配置项**:
  - `NOTIFY`: 通知开关 (0=关闭, 1=打开)
  - `DEBUG`: 调试模式 (0=关闭, 1=打开)
  - `DELAY_MS`: 看广告间隔时间(毫秒，默认30秒)
  - `AD_COUNT`: 看广告次数(默认9次)
  - `READ_COUNT`: 公众号浏览次数(默认10次)

### 3. 星妈会 (xmh.js)
- **功能**: 飞鹤星妈会自动签到和任务
- **环境变量**: `XMH_COOKIE`
- **变量格式**: `cuk值`，多账号换行分隔
- **支持备注**: 可在 cuk 值后添加 `# 备注` 来标识账号
- **示例**:
  ```
  wSWQiOiIxIiwic2l25tKNA7BQuLVg... # 我的账号
  wSWQiOiIxIiwic2l25tKNA7BQuLVg... # 老婆的账号
  ```

### 4. 星妈优选 (xmyx.js)
- **功能**: 飞鹤北纬47度好物（原星妈优选）小程序自动签到和任务
- **定时**: `30 0 * * *`
- **环境变量**: 待补充
- **获取方法**: 抓包 `https://www.feihevip.com/api/starMember/getMemberInfo` 获取 token
- **任务内容**: 签到、浏览商品、看视频、抽奖等

## 🔔 通知功能

所有脚本均使用 `sendNotify.js` 统一推送通知，支持 20+ 种通知方式：
- Server酱、Bark、PushPlus、WxPusher
- 企业微信、钉钉机器人、飞书机器人
- Telegram Bot、邮件推送、自定义 Webhook 等

### 配置通知

#### 青龙面板用户（推荐）

直接在青龙面板 → 环境变量中添加：
```
PUSH_KEY=你的Server酱Key
BARK_PUSH=https://api.day.app/你的设备码/
TG_BOT_TOKEN=你的Telegram_Bot_Token
TG_USER_ID=你的Telegram_User_ID
```

**说明**：
- ✅ 青龙自带 sendNotify.js，功能完善
- ✅ 无需上传本仓库的 sendNotify.js
- ✅ 环境变量配置，所有脚本共享

#### 本地运行用户

直接编辑 `sendNotify.js` 文件，在 `push_config` 中填入配置：
```javascript
const push_config = {
  PUSH_KEY: '你的Server酱Key',
  BARK_PUSH: 'https://api.day.app/你的设备码/',
  // ... 其他配置
};
```

或使用环境变量：
```bash
export PUSH_KEY="你的Server酱Key"
node jlyh.js
```

## 📦 依赖安装

```bash
# 方式一：使用 package.json 一键安装（推荐）
npm install

# 方式二：手动安装各个依赖
npm install axios got@11 request tough-cookie crypto-js
```

**注意**: 
- `got` 库请使用 v11 版本，v12+ 为 ESM 模块，不兼容当前脚本
- 如果遇到 `got is not a function` 错误，请确保已正确安装依赖

## 🚀 使用方法

### 青龙面板（推荐）
**📖 详细教程请查看：[青龙面板使用说明.md](./青龙面板使用说明.md)**

快速步骤：
1. 安装依赖：`axios request tough-cookie crypto-js`（不要装 got）
2. 上传脚本文件：`jlyh.js ljzf.js xmh.js xmyx.js`
3. **不要上传 sendNotify.js**（青龙自带，功能更完善）
4. 添加对应的环境变量
5. 设置定时任务或手动运行

**重要**: 
- 青龙 2.14+ 不兼容 got 库，本脚本已自动使用 axios 替代
- 青龙自带 sendNotify.js，无需上传本仓库的版本

### 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置通知（可选）
# 编辑 sendNotify.js 中的 push_config 填入你的通知配置

# 3. 运行脚本
node jlyh.js
node ljzf.js
node xmh.js
node xmyx.js
```

## ⚙️ 工具文件

- **sendNotify.js**: 统一通知推送模块
  - 🔔 青龙面板用户：使用青龙自带的，无需上传此文件
  - 💻 本地运行用户：使用本仓库的版本
  - 🔧 已修复高版本 Node.js 的 got 库兼容性问题
- **utils.js**: 通用工具函数库

## ⚠️ 免责声明

1. 本脚本仅用于学习研究，不保证其合法性、准确性、有效性
2. 使用者需自行判断并承担风险
3. 请勿将脚本用于任何商业或非法目的
4. 下载后请在 24 小时内删除
5. 使用本脚本即表示接受此免责声明

## 📝 注意事项

- 请合理设置任务执行频率，避免频繁请求
- 定期检查脚本是否正常运行
- Cookie 等敏感信息注意保密
- 如遇到问题，可开启 DEBUG 模式查看详细日志

## ❓ 常见问题

### 1. 报错：`TypeError: this.got is not a function` 或 `got.get is not a function`
**原因**: 
- 高版本青龙面板（Node.js 18+）与 got 库不兼容
- got v12+ 改为 ESM 模块，不支持 `require()` 方式

**解决方案（已自动兼容）**:
- ✅ 脚本已自动使用 `axios` 替代 `got`，无需手动处理
- 只需确保安装了 `axios`：
```bash
npm install axios
```

**青龙面板用户**:
- 在青龙面板的「依赖管理」→「NodeJs」中添加：`axios`
- 无需安装 `got`，脚本会自动降级使用 axios

**本地用户**:
```bash
# 方式一：安装所有依赖（推荐）
npm install

# 方式二：仅安装必需依赖
npm install axios request tough-cookie crypto-js
```

### 3. 报错：`userName is not defined`
**原因**: 脚本已修复此问题，请更新到最新版本

### 4. 通知发送失败或没有收到通知
**原因**: 
- 未配置推送渠道
- 脚本中 `Notify = 0`（通知被关闭）
- 青龙面板：未在环境变量中配置
- 本地运行：未在 sendNotify.js 中配置

**排查步骤**:
```bash
# 1. 测试通知功能
node test-notify.js

# 2. 检查脚本中的 Notify 变量
# 确保 Notify = 1 或 CONFIG.NOTIFY = 1
```

**解决方案**:
- 检查脚本中 `Notify` 或 `CONFIG.NOTIFY` 是否为 1
- 青龙用户：在环境变量中添加推送配置（如 PUSH_KEY）
- 本地用户：编辑 sendNotify.js 中的 push_config
- 如不需要通知：将 `Notify` 设置为 0

### 5. 青龙面板中运行失败
**原因**: 青龙面板可能缺少依赖

**解决方案**:
1. 进入青龙面板 → 依赖管理 → NodeJs
2. 添加以下依赖（一行一个）：
   ```
   axios
   request
   tough-cookie
   crypto-js
   ```
3. 点击安装，等待安装完成
4. **不要安装 got**，脚本已自动兼容

**注意**: 
- 青龙面板 2.14+ 版本使用 Node.js 18+，不兼容 got 库
- 本脚本已自动使用 axios 替代，无需担心兼容性问题

## 🔄 更新日志

- 2024-11-29: 修复 userName 未定义问题，添加 got 库初始化
- 初始版本发布

---

**如有问题或建议，欢迎提 Issue**
