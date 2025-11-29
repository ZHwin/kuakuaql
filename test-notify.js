/**
 * 通知测试脚本
 * 用于测试 sendNotify 是否正常工作
 * 
 * 使用方法：
 * node test-notify.js
 */

console.log('🔔 开始测试通知功能...\n');

// 测试 sendNotify 加载
let notify;
try {
    notify = require('./sendNotify');
    console.log('✅ sendNotify.js 加载成功');
} catch (e) {
    console.log('❌ sendNotify.js 加载失败:', e.message);
    console.log('💡 请确保 sendNotify.js 文件存在');
    process.exit(1);
}

// 测试通知发送
(async () => {
    try {
        console.log('\n📤 正在发送测试通知...');
        await notify.sendNotify(
            '通知测试',
            '这是一条测试消息\n\n如果你收到这条消息，说明通知配置成功！\n\n时间：' + new Date().toLocaleString()
        );
        console.log('✅ 通知发送成功！');
        console.log('\n💡 如果没有收到通知，请检查：');
        console.log('   1. 青龙面板用户：检查环境变量中的推送配置（如 PUSH_KEY）');
        console.log('   2. 本地用户：检查 sendNotify.js 中的 push_config 配置');
        console.log('   3. 确认推送渠道的密钥是否正确');
    } catch (error) {
        console.log('❌ 通知发送失败:', error.message);
        console.log('\n🔍 错误分析：');
        
        if (error.message.includes('got')) {
            console.log('   - 缺少 got 或 axios 库');
            console.log('   - 解决方案：npm install axios');
        } else if (error.message.includes('通知功能不可用')) {
            console.log('   - sendNotify 模块未正确初始化');
            console.log('   - 解决方案：检查 sendNotify.js 文件');
        } else {
            console.log('   - 未知错误，请查看详细错误信息');
            console.log('   - 错误详情:', error.stack);
        }
        
        console.log('\n💡 提示：');
        console.log('   - 如果不需要通知，可以在脚本中设置 Notify = 0');
        console.log('   - 或者在配置中设置 CONFIG.NOTIFY = 0');
    }
})();
