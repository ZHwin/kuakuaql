// 青龙脚本 - 星妈会自动任务
// 使用方法：在青龙面板中添加环境变量 XMH_COOKIE，多账号换行
// 环境变量格式：cuk值（可选备注）
// 示例：
// wSWQiOiIxIiwic2l25tKNA7BQuLVgf36dv7fheE5mEQi744fpzBiP7573mUX6yHvXhEMfqyuLoa7YymNuEzAHHh8rQSV5gpnXCcaXQfdXUCwd8dmwgyWXWMU6svEybBVBc4bLChq6PFQGNpoBatKdQQk
// wSWQiOiIxIiwic2l25tKNA7BQuLVgXfu6A5zs1CqL11PPghn23mgGmCbV7LmLFZsGf4fxZex68XaC3adKe5vssytNrfb7QPcMeNudgbQLvg8xoMSK3mnncdqrCSK6KNbmdrrHeq2S9gmjdfAAsUbH8Jg # 我的账号1
// wSWQiOiIxIiwic2l25tKNA7BQuLVgXCbJsU79CeJUS8inM6PyM7eGX8xL2kcy99Naz41C2qycwEhu1EK7imYASNPsEFsXGK8bcpHpYA3wYnPEJZ8rRXok5CxdLfdKvWU1u6mJpw1Kz3AMxWh6gh31d1E # 老婆的账号

const $ = init();
// 优先使用青龙面板自带的 sendNotify
const notify = $.isNode() ? (() => {
  try {
    return require('./sendNotify');
  } catch (e) {
    console.log('⚠️ sendNotify 加载失败，通知功能将不可用');
    return null;
  }
})() : '';
const API_HOST = "https://momclub.feihe.com";

// 初始化函数
function init() {
    return {
        isNode: () => typeof process !== 'undefined' && process.version,
        http: require('axios'),
        wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        log: console.log
    };
}

// 任务类型映射
const TASK_TYPES = {
    CHECKIN: "checkIn", // 签到
    BROWSE_PAGE: "receive", // 浏览任务
    COMPLETE: "complete" // 完成类任务
};

let allAccounts = [];
let totalCredits = 0;
let currentAccount = 1;

class XingMaHui {
    constructor(cuk, index, remark = '') {
        this.cuk = cuk;
        this.index = index;
        this.remark = remark;
        this.accountName = remark ? `账号${index}(${remark})` : `账号${index}`;
        this.creditsEarned = 0;
        this.taskResults = [];
        this.userInfo = null;
        this.initialPoints = 0; // 初始积分
        this.finalPoints = 0;   // 最终积分
    }

    // 生成请求头
    getHeaders() {
        return {
            'Host': 'momclub.feihe.com',
            'cuk': this.cuk,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf2541022) XWEB/16467',
            'xweb_xhr': '1',
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://servicewechat.com/wxc83b55d61c7fc51d/41/page-frame.html',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Priority': 'u=1, i'
        };
    }

    // 生成时间戳
    getMockTime() {
        return Date.now();
    }

    // 发送请求
    async request(url, method = 'GET', data = null) {
        const headers = this.getHeaders();
        
        try {
            let response;
            const config = {
                headers: headers,
                timeout: 10000
            };

            if (method === 'GET') {
                response = await $.http.get(url, config);
            } else {
                response = await $.http.post(url, data, config);
            }
            
            if (response.status === 200) {
                return response.data;
            } else {
                console.log(`❌ 请求失败: ${response.status}`);
                return null;
            }
        } catch (error) {
            console.log(`❌ 请求异常: ${error.message}`);
            return null;
        }
    }

    // 获取用户信息
    async getUserInfo() {
        const url = `${API_HOST}/pmall/c/user/memberInfo`;
        const result = await this.request(url);
        
        if (result && result.code === "000000" && result.data) {
            this.userInfo = result.data;
            return this.userInfo;
        } else {
            console.log(`❌ 获取用户信息失败: ${result ? result.message : '网络错误'}`);
            return null;
        }
    }

    // 查询单个任务结果
    async querySingleTaskResult(taskName) {
        const url = `${API_HOST}/pmall/c/activity/todo/queryTodoResult`;
        const result = await this.request(url);
        
        if (result && result.code === "000000" && result.data) {
            // 查找特定任务的结果
            const taskResult = result.data.find(task => task.taskName === taskName);
            if (taskResult) {
                const credits = taskResult.actualCredits || 0;
                console.log(`🎉 任务【${taskName}】获得积分: ${credits}`);
                this.taskResults.push(`✅ ${taskName} +${credits}积分`);
                this.creditsEarned += credits;
                return credits;
            }
        }
        return 0;
    }

    // 查询所有任务结果
    async queryAllTaskResults() {
        const url = `${API_HOST}/pmall/c/activity/todo/queryTodoResult`;
        const result = await this.request(url);
        
        if (result && result.code === "000000" && result.data) {
            let total = 0;
            result.data.forEach(task => {
                const credits = task.actualCredits || 0;
                total += credits;
                console.log(`📊 ${task.taskName}: +${credits}积分`);
            });
            console.log(`🎉 今日已获得积分: ${total}`);
            return total;
        } else {
            console.log(`❌ 查询任务结果失败: ${result ? result.message : '未知错误'}`);
            return 0;
        }
    }

    // 获取任务列表
    async getTaskList() {
        const url = `${API_HOST}/pmall/c/activity/todo/list?mockTime=${this.getMockTime()}`;
        const result = await this.request(url);
        
        if (result && result.code === "000000") {
            return result.data;
        } else {
            console.log(`❌ 获取任务列表失败: ${result ? result.message : '网络错误'}`);
            return null;
        }
    }

    // 执行签到
    async doCheckIn(activityId, taskName) {
        const url = `${API_HOST}/pmall/c/activity/todo/checkIn`;
        const data = {
            "activityId": activityId,
            "mockTime": this.getMockTime()
        };
        
        const result = await this.request(url, 'POST', data);
        if (result && result.code === "000000") {
            console.log(`✅ ${taskName} 完成`);
            // 查询签到结果
            await $.wait(1000);
            await this.querySingleTaskResult(taskName);
            return true;
        } else {
            console.log(`❌ ${taskName} 失败: ${result ? result.message : '未知错误'}`);
            return false;
        }
    }

    // 执行浏览任务
    async doBrowseTask(activityId, taskName) {
        const url = `${API_HOST}/pmall/c/activity/todo/receive`;
        const data = {
            "activityId": activityId,
            "mockTime": this.getMockTime()
        };
        
        const result = await this.request(url, 'POST', data);
        if (result && result.code === "000000") {
            console.log(`✅ ${taskName} 完成`);
            // 查询任务结果
            await $.wait(1000);
            await this.querySingleTaskResult(taskName);
            return true;
        } else {
            console.log(`❌ ${taskName} 失败: ${result ? result.message : '未知错误'}`);
            return false;
        }
    }

    // 执行完成类任务
    async doCompleteTask(activityId, taskName) {
        const url = `${API_HOST}/pmall/c/activity/todo/complete`;
        const data = {
            "activityId": activityId,
            "mockTime": this.getMockTime()
        };
        
        const result = await this.request(url, 'POST', data);
        if (result && result.code === "000000") {
            console.log(`✅ ${taskName} 完成`);
            // 查询任务结果
            await $.wait(1000);
            await this.querySingleTaskResult(taskName);
            return true;
        } else {
            console.log(`❌ ${taskName} 失败: ${result ? result.message : '未知错误'}`);
            return false;
        }
    }

    // 执行所有任务
    async doAllTasks() {
        console.log(`\n🚀 开始执行 ${this.accountName} 任务...`);
        
        // 首先获取用户信息（初始积分）
        console.log('📡 获取初始用户信息...');
        await this.getUserInfo();
        if (this.userInfo) {
            this.initialPoints = this.userInfo.points;
            console.log(`📊 初始积分: ${this.initialPoints}`);
        }
        
        // 获取任务列表
        const taskData = await this.getTaskList();
        if (!taskData) {
            console.log('❌ 获取任务列表失败，跳过该账号');
            return;
        }

        // 执行签到任务
        if (taskData.checkInTodo) {
            const checkInId = taskData.checkInTodo.id;
            const taskName = taskData.checkInTodo.name;
            await this.doCheckIn(checkInId, taskName);
            await $.wait(2000);
        }

        // 执行其他任务
        if (taskData.taskTodo && taskData.taskTodo.length > 0) {
            for (const task of taskData.taskTodo) {
                const taskId = task.id;
                const taskName = task.name;
                const taskType = task.taskTodoExtra?.type;
                
                console.log(`\n🚀 处理任务: ${taskName}`);
                
                // 根据任务类型执行不同的操作
                switch (taskType) {
                    case 'BROWSE_PAGE':
                        await this.doBrowseTask(taskId, taskName);
                        break;
                    case 'AddQw':
                    case 'FirstOrder':
                        // 这些任务需要手动完成，跳过
                        console.log(`⏭️  跳过需要手动完成的任务: ${taskName}`);
                        break;
                    default:
                        await this.doCompleteTask(taskId, taskName);
                        break;
                }
                
                // 短暂延迟，避免请求过快
                await $.wait(2000);
            }
        }

        // 查询所有任务结果汇总
        console.log(`\n📋 任务完成汇总:`);
        await this.queryAllTaskResults();
        
        // 重新获取用户信息以获取最终积分
        console.log('\n📡 获取最终用户信息...');
        await this.getUserInfo();
        if (this.userInfo) {
            this.finalPoints = this.userInfo.points;
            console.log(`📊 最终积分: ${this.finalPoints}`);
            const actualIncrease = this.finalPoints - this.initialPoints;
            console.log(`🎊 实际积分增加: ${actualIncrease}`);
        }
        
        console.log(`🎊 ${this.accountName} 任务执行完成`);
    }

    // 获取任务结果
    getResults() {
        return {
            accountName: this.accountName,
            credits: this.creditsEarned,
            tasks: this.taskResults,
            userInfo: this.userInfo,
            initialPoints: this.initialPoints,
            finalPoints: this.finalPoints
        };
    }
}

// 解析环境变量（支持备注）
function parseCookies(cookieStr) {
    const cookies = [];
    const lines = cookieStr.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
        const parts = line.split('#');
        const cuk = parts[0].trim();
        const remark = parts[1] ? parts[1].trim() : '';
        
        if (cuk) {
            cookies.push({
                cuk: cuk,
                index: index + 1,
                remark: remark
            });
        }
    });
    
    return cookies;
}

// 主函数
async function main() {
    console.log("🚀 星妈会自动任务开始执行...\n");
    
    // 读取环境变量
    const cookieStr = process.env.XMH_COOKIE || '';
    
    if (!cookieStr) {
        console.log("❌ 未找到有效的cuk配置，请检查环境变量 XMH_COOKIE");
        return;
    }

    // 解析cookies
    const cookieList = parseCookies(cookieStr);
    
    if (cookieList.length === 0) {
        console.log("❌ 未找到有效的cuk配置，请检查环境变量 XMH_COOKIE");
        return;
    }

    console.log(`📝 找到 ${cookieList.length} 个账号\n`);

    // 显示账号信息
    cookieList.forEach(cookie => {
        console.log(`   ${cookie.index}. ${cookie.remark || '未备注'}`);
    });
    console.log('');

    // 初始化账号实例
    for (const cookie of cookieList) {
        allAccounts.push(new XingMaHui(cookie.cuk, cookie.index, cookie.remark));
    }

    // 依次执行每个账号的任务
    for (const account of allAccounts) {
        currentAccount = account.index;
        await account.doAllTasks();
        totalCredits += account.creditsEarned;
        
        // 账号间延迟
        if (account.index < allAccounts.length) {
            console.log("\n⏳ 等待5秒后处理下一个账号...\n");
            await $.wait(5000);
        }
    }

    // 汇总结果
    await showSummary();
}

// 显示汇总结果
async function showSummary() {
    console.log("\n" + "=".repeat(70));
    console.log("🎉 星妈会任务执行汇总");
    console.log("=".repeat(70));
    
    let summaryMessage = `星妈会任务完成情况：\n\n`;
    let consoleMessage = ``;
    
    for (const account of allAccounts) {
        const results = account.getResults();
        
        // 显示用户基本信息
        if (results.userInfo) {
            summaryMessage += `📱 ${results.accountName}：\n`;
            summaryMessage += `   手机号：${results.userInfo.mobile}\n`;
            summaryMessage += `   会员等级：${results.userInfo.gradeName}\n`;
            summaryMessage += `   初始积分：${results.initialPoints}\n`;
            summaryMessage += `   最终积分：${results.finalPoints}\n`;
            summaryMessage += `   实际增加：${results.finalPoints - results.initialPoints}积分\n`;
            
            consoleMessage += `📱 ${results.accountName}：\n`;
            consoleMessage += `   📞 手机号：${results.userInfo.mobile}\n`;
            consoleMessage += `   ⭐ 会员等级：${results.userInfo.gradeName}\n`;
            consoleMessage += `   📥 初始积分：${results.initialPoints}\n`;
            consoleMessage += `   📤 最终积分：${results.finalPoints}\n`;
            consoleMessage += `   📈 实际增加：${results.finalPoints - results.initialPoints}积分\n`;
        } else {
            summaryMessage += `📱 ${results.accountName}：\n`;
            summaryMessage += `   ❌ 用户信息获取失败\n`;
            
            consoleMessage += `📱 ${results.accountName}：\n`;
            consoleMessage += `   ❌ 用户信息获取失败\n`;
        }
        
        // 显示任务完成情况
        summaryMessage += `   今日获得：${results.credits}积分\n`;
        consoleMessage += `   🎉 今日获得：${results.credits}积分\n`;
        
        if (results.tasks.length > 0) {
            summaryMessage += `   完成任务：\n`;
            consoleMessage += `   ✅ 完成任务：\n`;
            results.tasks.forEach(task => {
                summaryMessage += `     ${task}\n`;
                consoleMessage += `     ${task}\n`;
            });
        }
        summaryMessage += `\n`;
        consoleMessage += `\n`;
    }
    
    summaryMessage += `📊 总计：${allAccounts.length} 个账号，今日共获得 ${totalCredits} 积分`;
    consoleMessage += `📊 总计：${allAccounts.length} 个账号，今日共获得 ${totalCredits} 积分`;
    
    console.log(consoleMessage);
    
    // 发送通知
    if ($.isNode() && notify) {
        await notify.sendNotify("星妈会任务完成", summaryMessage);
    }
}

// 运行脚本
main().catch(error => {
    console.log(`❌ 脚本执行出错: ${error}`);
    if ($.isNode() && notify) {
        notify.sendNotify("星妈会任务异常", `执行过程中出现错误: ${error}`);
    }
});