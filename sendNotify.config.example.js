// 通知配置示例文件
// 使用方法：
// 1. 复制此文件为 sendNotify.config.js
// 2. 在 sendNotify.config.js 中填入你的配置
// 3. sendNotify.config.js 不会被 git 追踪，可以安全保存你的密钥

module.exports = {
  HITOKOTO: true, // 启用一言（随机句子）

  // ============ Server酱 ============
  // 官网：https://sct.ftqq.com/
  PUSH_KEY: '', // Server酱的 PUSH_KEY

  // ============ Bark ============
  // iOS 推送工具
  BARK_PUSH: '', // 例：https://api.day.app/你的设备码/
  BARK_ARCHIVE: '', // 是否存档
  BARK_GROUP: '', // 推送分组
  BARK_SOUND: '', // 推送声音
  BARK_ICON: '', // 推送图标
  BARK_LEVEL: '', // 推送时效性
  BARK_URL: '', // 推送跳转URL

  // ============ 钉钉机器人 ============
  DD_BOT_SECRET: '', // 钉钉机器人的 Secret
  DD_BOT_TOKEN: '', // 钉钉机器人的 Token

  // ============ 飞书机器人 ============
  FSKEY: '', // 飞书机器人的 Key

  // ============ PushPlus ============
  // 官网：https://www.pushplus.plus/
  PUSH_PLUS_TOKEN: '', // pushplus 推送的用户令牌
  PUSH_PLUS_USER: '', // pushplus 推送的群组编码
  PUSH_PLUS_TEMPLATE: 'html', // 发送模板：html,txt,json,markdown
  PUSH_PLUS_CHANNEL: 'wechat', // 发送渠道：wechat,webhook,cp,mail,sms
  PUSH_PLUS_WEBHOOK: '', // webhook编码
  PUSH_PLUS_CALLBACKURL: '', // 发送结果回调地址
  PUSH_PLUS_TO: '', // 好友令牌

  // ============ 企业微信 ============
  QYWX_ORIGIN: 'https://qyapi.weixin.qq.com', // 企业微信代理地址
  QYWX_AM: '', // 企业微信应用消息
  QYWX_KEY: '', // 企业微信机器人的 webhook

  // ============ Telegram Bot ============
  TG_BOT_TOKEN: '', // tg 机器人的 Token
  TG_USER_ID: '', // tg 机器人的 User ID
  TG_API_HOST: 'https://api.telegram.org', // tg 代理 api
  TG_PROXY_AUTH: '', // tg 代理认证参数
  TG_PROXY_HOST: '', // tg 代理主机
  TG_PROXY_PORT: '', // tg 代理端口

  // ============ WxPusher ============
  // 官网：https://wxpusher.zjiecode.com/
  WXPUSHER_APP_TOKEN: '', // wxpusher 的 appToken
  WXPUSHER_TOPIC_IDS: '', // wxpusher 的 主题ID，多个用;分隔
  WXPUSHER_UIDS: '', // wxpusher 的 用户ID，多个用;分隔

  // ============ 其他推送方式 ============
  IGOT_PUSH_KEY: '', // iGot 聚合推送
  DEER_KEY: '', // PushDeer 的 Key
  DEER_URL: '', // PushDeer 的 URL
  GOTIFY_URL: '', // Gotify 地址
  GOTIFY_TOKEN: '', // Gotify Token
  GOTIFY_PRIORITY: 0, // Gotify 优先级
  QMSG_KEY: '', // qmsg 酱的 Key
  QMSG_TYPE: '', // qmsg 酱的 Type
  PUSHME_KEY: '', // PushMe 酱的 Key
  
  // ============ 邮件推送 ============
  SMTP_SERVICE: '', // 邮箱服务名称，如：126、163、Gmail、QQ
  SMTP_EMAIL: '', // SMTP 收发件邮箱
  SMTP_PASSWORD: '', // SMTP 登录密码
  SMTP_NAME: '', // SMTP 收发件人姓名

  // ============ 自定义 Webhook ============
  WEBHOOK_URL: '', // 自定义通知 请求地址
  WEBHOOK_BODY: '', // 自定义通知 请求体
  WEBHOOK_HEADERS: '', // 自定义通知 请求头
  WEBHOOK_METHOD: '', // 自定义通知 请求方法
  WEBHOOK_CONTENT_TYPE: '', // 自定义通知 content-type
};
