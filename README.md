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

所有脚本均使用 `sendNotify.js` 统一推送通知，支持多种通知方式：
- Server酱
- Bark
- 企业微信
- 钉钉机器人
- 飞书机器人
- Telegram Bot
- PushPlus
- 等多种推送渠道

### 配置通知
1. 在 `sendNotify.js` 中配置你的推送渠道
2. 或在青龙面板中配置对应的环境变量
3. 部分脚本可通过 `NOTIFY` 变量控制是否推送

## 📦 依赖安装

```bash
# 安装必要依赖
npm install axios
npm install got
npm install request
```

## 🚀 使用方法

### 青龙面板
1. 将脚本文件上传到青龙面板
2. 添加对应的环境变量
3. 设置定时任务或手动运行

### 本地运行
```bash
# 设置环境变量后直接运行
node jlyh.js
node ljzf.js
node xmh.js
node xmyx.js
```

## ⚙️ 工具文件

- **sendNotify.js**: 统一通知推送模块
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

## 🔄 更新日志

- 初始版本发布

---

**如有问题或建议，欢迎提 Issue**
