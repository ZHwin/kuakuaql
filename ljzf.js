/*
小程序:霖久智服
变量:G_ljzfhd多号&或换行
不需要抓包小程序登录后写入手机号即可
*/
// 禁用 punycode 弃用警告
process.removeAllListeners('warning');
process.on('warning', (warning) => {
    if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
        return;
    }
    console.warn(warning.name, warning.message);
});

const $ = new Env('霖久智服');
const axios = require('axios');
let request = require("request");
request = request.defaults({
    jar: true
});

// ============================================配置管理============================================
const CONFIG = {
    NOTIFY: 1,              // 通知开关: 0=关闭通知, 1=打开通知
    DEBUG: 0,               // 调试模式: 0=关闭调试, 1=打开调试(会输出详细日志)
    MAX_RETRY: 3,           // 最大重试次数: 请求失败后的重试次数
    DELAY_MS: 30000,        // 延迟时间: 看广告间隔时间(毫秒), 默认30秒
    AD_COUNT: 9,            // 看广告次数: 每个账号看广告的次数
    READ_COUNT: 10,         // 公众号浏览次数: 每个账号浏览公众号的次数
    REQUEST_TIMEOUT: 10000  // 请求超时: HTTP请求超时时间(毫秒)
};

// 配置说明:
// 1. NOTIFY: 控制是否发送通知到手机/邮箱等
//    - 需要配置 sendNotify.js 和安装 got 库: npm install got
//    - 如不需要通知，设置为 0 即可
// 2. DEBUG: 开启后会输出详细的请求和响应数据，用于排查问题
// 3. DELAY_MS: 建议设置30秒以上，避免请求过快被限制
// 4. AD_COUNT: 根据实际情况调整，过多可能无效
// 5. READ_COUNT: 公众号浏览次数，默认10次

// 日志管理类
class Logger {
    constructor(debug = false) {
        this.debugMode = debug;
        this.logs = [];
    }

    info(msg, showTime = true) {
        const timeStr = showTime ? `[${new Date().toLocaleString()}] ` : '';
        const logMsg = `${timeStr}ℹ️ ${msg}`;
        console.log(logMsg);
        this.logs.push(logMsg);
    }

    success(msg, showTime = true) {
        const timeStr = showTime ? `[${new Date().toLocaleString()}] ` : '';
        const logMsg = `${timeStr}✅ ${msg}`;
        console.log(logMsg);
        this.logs.push(logMsg);
    }

    error(msg, showTime = true) {
        const timeStr = showTime ? `[${new Date().toLocaleString()}] ` : '';
        const logMsg = `${timeStr}❌ ${msg}`;
        console.log(logMsg);
        this.logs.push(logMsg);
    }

    warn(msg, showTime = true) {
        const timeStr = showTime ? `[${new Date().toLocaleString()}] ` : '';
        const logMsg = `${timeStr}⚠️ ${msg}`;
        console.log(logMsg);
        this.logs.push(logMsg);
    }

    debug(msg, showTime = true) {
        if (!this.debugMode) return;
        const timeStr = showTime ? `[${new Date().toLocaleString()}] ` : '';
        const logMsg = `${timeStr}🔍 [DEBUG] ${msg}`;
        console.log(logMsg);
        this.logs.push(logMsg);
    }

    getLogs() {
        return this.logs.join('\n');
    }
}

const logger = new Logger(CONFIG.DEBUG);
const { log } = console;
const Notify = CONFIG.NOTIFY;
const debug = CONFIG.DEBUG;
let G_ljzfhd = ($.isNode() ? process.env.G_ljzfhd : $.getdata("G_ljzfhd")) || ""
let G_ljzfhdArr = [];
let data = '';
let msg = '';
let ckid = ''; // 全局变量存储用户ID

// 统计信息
let stats = {
    totalAccounts: 0,
    successAccounts: 0,
    failedAccounts: 0,
    totalPoints: 0,
    earnedPoints: 0, // 本次获得的积分
    signInSuccess: 0,
    signInFailed: 0,
    adSuccess: 0,
    adFailed: 0,
    taskSuccess: 0,
    taskFailed: 0,
    errors: [],
    warnings: [], // 警告信息
    accountDetails: [] // 存储每个账号的详细信息
};
var hours = new Date().getMonth();
var timestamp = Math.round(new Date().getTime()).toString();

// HTTP请求封装函数
async function makeRequest(options, retryCount = 0) {
    try {
        logger.debug(`发起请求: ${options.method} ${options.url}`);
        logger.debug(`请求参数: ${JSON.stringify(options, null, 2)}`);

        const response = await axios.request({
            ...options,
            timeout: CONFIG.REQUEST_TIMEOUT
        });

        logger.debug(`响应数据: ${JSON.stringify(response.data, null, 2)}`);
        return response;
    } catch (error) {
        logger.error(`请求失败: ${error.message}`);

        if (retryCount < CONFIG.MAX_RETRY) {
            logger.warn(`第 ${retryCount + 1} 次重试...`);
            await $.wait(2000); // 等待2秒后重试
            return makeRequest(options, retryCount + 1);
        }

        throw error;
    }
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
!(async () => {
    if (typeof $request !== "undefined") {
        await GetRewrite();
    } else {
        if (!(await Envs()))
            return;
        else {

            const beijingTime = new Date(
                new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
                8 * 60 * 60 * 1000).toLocaleString();

            logger.info('='.repeat(50));
            logger.info(`🚀 霖久智服脚本开始执行`);
            logger.info(`⏰ 北京时间: ${beijingTime}`);
            logger.info('='.repeat(50));

            addNotifyStr(`🚀 霖久智服 - ${beijingTime}`, true);

            stats.totalAccounts = G_ljzfhdArr.length;
            logger.info(`共找到 ${G_ljzfhdArr.length} 个账号`);
            logger.debug(`账号数组: ${JSON.stringify(G_ljzfhdArr)}`);
            for (let index = 0; index < G_ljzfhdArr.length; index++) {

                let num = index + 1
                logger.info(`\n${'='.repeat(20)} 第 ${num} 个账号 ${'='.repeat(20)}`);
                addNotifyStr(`\n==== 开始【第 ${num} 个账号】====\n`, true)

                G_ljzfhd = G_ljzfhdArr[index];

                try {
                    logger.info(`📱 开始处理账号: ${G_ljzfhd}`);
                    const accountStartTime = Date.now();
                    await checkin0(); // 获取token
                    const accountEndTime = Date.now();
                    const accountDuration = ((accountEndTime - accountStartTime) / 1000).toFixed(2);
                    stats.successAccounts++;
                    logger.success(`✨ 账号 ${G_ljzfhd} 所有任务执行完成 (耗时: ${accountDuration}秒)`);
                    addNotifyStr(`✅ 账号执行成功 (耗时: ${accountDuration}秒)`, false);
                } catch (error) {
                    stats.failedAccounts++;
                    const errorMsg = `账号 ${G_ljzfhd}: ${error.message || error}`;
                    stats.errors.push(errorMsg);
                    logger.error(`❌ 账号 ${G_ljzfhd} 执行失败: ${error.message || error}`);
                    logger.error(`错误堆栈: ${error.stack || '无堆栈信息'}`);
                    addNotifyStr(`❌ 账号执行失败: ${error.message || error}`, false);
                }
            }

            // 生成执行报告
            await generateReport();
            await SendMsg(msg);
        }
    }
})()
    .catch((e) => {
        logger.error(`脚本执行异常: ${e.message}`);
        log(e);
    })
    .finally(() => $.done())

// 生成执行报告
async function generateReport() {
    logger.info('\n' + '='.repeat(50));
    logger.info('📊 执行报告统计');
    logger.info('='.repeat(50));

    const successRate = stats.totalAccounts > 0 ? ((stats.successAccounts / stats.totalAccounts) * 100).toFixed(2) : 0;
    const report = [
        `📈 总账号数: ${stats.totalAccounts}`,
        `✅ 成功账号: ${stats.successAccounts} | ❌ 失败账号: ${stats.failedAccounts}`,
        `📊 成功率: ${successRate}%`,
        ``,
        `🎆 签到: 成功 ${stats.signInSuccess} 次 | 失败 ${stats.signInFailed} 次`,
        `📺 看广告: 成功 ${stats.adSuccess} 次 | 失败 ${stats.adFailed} 次`,
        `🎯 任务: 成功 ${stats.taskSuccess} 次 | 失败 ${stats.taskFailed} 次`,
        ``,
        `💰 本次获得积分: ${stats.earnedPoints}`,
        `💎 账户总积分: ${stats.totalPoints}`
    ];

    report.forEach(line => {
        logger.info(line);
        addNotifyStr(line, false);
    });

    // 显示错误详情
    if (stats.errors.length > 0) {
        logger.error('\n❌ 错误详情:');
        addNotifyStr('\n❌ 错误详情:', false);
        stats.errors.forEach((error, index) => {
            logger.error(`  ${index + 1}. ${error}`);
            addNotifyStr(`  ${index + 1}. ${error}`, false);
        });
    }

    // 添加账号详情
    if (stats.accountDetails.length > 0) {
        logger.info('\n📱 账号详情:');
        addNotifyStr('\n📱 账号详情:', false);
        stats.accountDetails.forEach((account, index) => {
            const earnedInfo = account.earned ? ` (+${account.earned})` : '';
            const statusIcon = account.status === 'success' ? '✅' : '❌';
            const detail = `  ${statusIcon} ${index + 1}. ${account.phone} - ${account.points}积分${earnedInfo}`;
            logger.info(detail);
            addNotifyStr(detail, false);
        });
    }

    logger.info('='.repeat(50));
    addNotifyStr('\n' + '='.repeat(30), false);
}
async function checkin0() {
    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: 'https://linjiucloud-api.ysservice.com.cn/mc/member/autoMember',
            headers: {
                Host: 'linjiucloud-api.ysservice.com.cn',
                xweb_xhr: '1',
                'X-Client-Id': '64',
                'X-Tenant-Id': '10111',
                Referer: 'https://servicewechat.com/wx0a9f159eddb2c5f8/105/page-frame.html',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0',
                Connection: 'keep-alive',
                'Content-Type': 'application/json'
            },
            data: `{"channel":"CHARGE_PLATFORM","tenantId":"10111","mobile":${G_ljzfhd}}`
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }


                if (!data.data) {
                    throw new Error('获取用户ID失败，请检查手机号是否正确');
                }
                ckid = data.data;
                logger.info(`✅ 成功获取用户ID: ${ckid}`);
                logger.debug(`用户ID详情: ${JSON.stringify(ckid)}`);

                // 执行签到
                logger.info('\n📝 开始执行签到任务...');
                await checkin();

                // 获取并执行任务
                logger.info('\n🎯 开始获取任务列表...');
                await checkin3();

                // 公众号浏览任务
                logger.info(`\n� 开始公众号浏览任务共 (共${CONFIG.READ_COUNT}次)...`);
                for (let i = 1; i <= CONFIG.READ_COUNT; i++) {
                    logger.info(`[${i}/${CONFIG.READ_COUNT}] 正在浏览公众号...`);
                    const readResult = await checkinRead(i);
                    
                    // 如果达到上限，停止继续浏览
                    if (readResult && readResult.reachedLimit) {
                        logger.info('ℹ️ 公众号浏览任务已达上限，停止继续执行');
                        break;
                    }
                    
                    if (i < CONFIG.READ_COUNT) {
                        logger.info(`⏳ 等待 ${CONFIG.DELAY_MS / 1000} 秒后继续...`);
                        await $.wait(CONFIG.DELAY_MS);
                    }
                }

                // 看广告任务
                logger.info(`\n📺 开始看广告任务 (共${CONFIG.AD_COUNT}次)...`);
                for (let i = 1; i <= CONFIG.AD_COUNT; i++) {
                    logger.info(`[${i}/${CONFIG.AD_COUNT}] 正在观看广告...`);
                    const adResult = await checkin1(i);
                    
                    // 如果达到上限，停止继续看广告
                    if (adResult && adResult.reachedLimit) {
                        logger.info('ℹ️ 广告任务已达上限，停止继续执行');
                        break;
                    }
                    
                    if (i < CONFIG.AD_COUNT) {
                        logger.info(`⏳ 等待 ${CONFIG.DELAY_MS / 1000} 秒后继续...`);
                        await $.wait(CONFIG.DELAY_MS);
                    }
                }

                // 查询最终积分
                logger.info('\n💰 查询账户积分...');
                await checkin2();

            } catch (e) {
                logger.error(`处理响应数据异常: ${e.message}`);
                logger.debug(`异常详情: ${e.stack}`);
                throw e;
            }
        }).catch(function (error) {
            logger.error(`请求失败: ${error.message}`);
            if (error.response) {
                logger.error(`响应状态码: ${error.response.status}`);
                logger.debug(`响应数据: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }).then(res => {
            resolve();
        });
    })

}
async function checkin() {
    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: 'https://linjiucloud-api.ysservice.com.cn/mt/web/action/add',
            headers: {
                Host: 'linjiucloud-api.ysservice.com.cn',
                'X-Auth-Token': '',
                'X-Project-id': '',
                xweb_xhr: '1',
                'X-Client-Id': '64',
                'X-Tenant-Id': '10111',
                Referer: 'https://servicewechat.com/wx0a9f159eddb2c5f8/105/page-frame.html',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0',
                Connection: 'keep-alive',
                'Content-Type': 'application/json'
            },
            data: `{"actionRecordCO":{"actionType":"SIGN_IN","actionUnit":"1","channel":"LJZF","createdBy":"${ckid}","unitCount":"1"},"tenantId":"10111"}`
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }

                if (data.code == 0) {
                    const points = data.data.pointCount || 0;
                    stats.signInSuccess++;
                    stats.earnedPoints += points;
                    logger.success(`✅ 签到成功，获得 ${points} 积分`);
                    addNotifyStr(`✅ 签到: +${points}积分`, false);
                } else {
                    stats.signInFailed++;
                    const msg = data.message || '未知错误';
                    logger.warn(`⚠️ 签到失败: ${msg}`);
                    addNotifyStr(`⚠️ 签到: ${msg}`, false);
                    // 只记录非正常的错误，已完成/达到上限不算警告
                    if (!msg.includes('已完成') && !msg.includes('达到上限') && !msg.includes('超上限')) {
                        stats.warnings.push(`签到失败: ${msg}`);
                    }
                }
            } catch (e) {
                stats.signInFailed++;
                logger.error(`签到处理异常: ${e.message}`);
                stats.warnings.push(`签到异常: ${e.message}`);
            }
        }).catch(function (error) {
            stats.signInFailed++;
            logger.error(`签到请求失败: ${error.message}`);
            stats.errors.push(`签到请求失败: ${error.message}`);
        }).then(res => {
            resolve();
        });
    })

}
async function checkinRead(readIndex = 0) {
    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: 'https://linjiucloud-api.ysservice.com.cn/mt/web/action/add',
            headers: {
                Host: 'linjiucloud-api.ysservice.com.cn',
                'X-Project-id': '',
                xweb_xhr: '1',
                'X-Client-Id': '64',
                'X-Tenant-Id': '10111',
                Referer: 'https://servicewechat.com/wx0a9f159eddb2c5f8/105/page-frame.html',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0',
                Connection: 'keep-alive',
                'Content-Type': 'application/json'
            },
            data: `{"actionRecordCO":{"actionType":"READ","actionUnit":"1","channel":"LJZF","createdBy":"${ckid}","unitCount":"1","week":""},"tenantId":"10111"}`
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }

                if (data.code == 0) {
                    const points = data.data.pointCount || 0;
                    stats.taskSuccess++;
                    stats.earnedPoints += points;
                    logger.success(`✅ 第${readIndex}次浏览公众号成功，获得 ${points} 积分`);
                    addNotifyStr(`  � 广浏览${readIndex}: +${points}积分`, false);
                    resolve({ success: true, reachedLimit: false });
                } else {
                    stats.taskFailed++;
                    const msg = data.message || '未知错误';
                    logger.warn(`⚠️ 第${readIndex}次浏览公众号失败: ${msg}`);
                    addNotifyStr(`  ⚠️ 浏览${readIndex}: ${msg}`, false);
                    
                    // 检测是否达到上限
                    const reachedLimit = msg.includes('达到上限') || msg.includes('超上限') || msg.includes('已完成') || msg.includes('已达上限');
                    if (reachedLimit) {
                        logger.info('💡 提示: 今日公众号浏览任务已达上限');
                    }
                    resolve({ success: false, reachedLimit: reachedLimit });
                }
            } catch (e) {
                stats.taskFailed++;
                logger.error(`公众号浏览处理异常: ${e.message}`);
                stats.errors.push(`浏览${readIndex}异常: ${e.message}`);
                resolve({ success: false, reachedLimit: false });
            }
        }).catch(function (error) {
            stats.taskFailed++;
            logger.error(`公众号浏览请求失败: ${error.message}`);
            stats.errors.push(`浏览${readIndex}请求失败: ${error.message}`);
            resolve({ success: false, reachedLimit: false });
        });
    })

}
async function checkin1(adIndex = 0) {
    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: 'https://linjiucloud-api.ysservice.com.cn/mt/web/action/add',
            headers: {
                Host: 'linjiucloud-api.ysservice.com.cn',
                'X-Project-id': '',
                xweb_xhr: '1',
                'X-Client-Id': '64',
                'X-Tenant-Id': '10111',
                Referer: 'https://servicewechat.com/wx0a9f159eddb2c5f8/105/page-frame.html',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0',
                Connection: 'keep-alive',
                'Content-Type': 'application/json'
            },
            data: `{"actionRecordCO":{"actionType":"AD","actionUnit":"1","channel":"LJZF","createdBy":"${ckid}","unitCount":"1","week":""},"tenantId":"10111"}`
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }

                if (data.code == 0) {
                    const points = data.data.pointCount || 0;
                    stats.adSuccess++;
                    stats.earnedPoints += points;
                    logger.success(`✅ 第${adIndex}次看广告成功，获得 ${points} 积分`);
                    addNotifyStr(`  📺 广告${adIndex}: +${points}积分`, false);
                    resolve({ success: true, reachedLimit: false });
                } else {
                    stats.adFailed++;
                    const msg = data.message || '未知错误';
                    logger.warn(`⚠️ 第${adIndex}次看广告失败: ${msg}`);
                    addNotifyStr(`  ⚠️ 广告${adIndex}: ${msg}`, false);
                    
                    // 检测是否达到上限
                    const reachedLimit = msg.includes('达到上限') || msg.includes('超上限') || msg.includes('已完成') || msg.includes('已达上限');
                    if (reachedLimit) {
                        logger.info('💡 提示: 今日广告任务已达上限');
                    }
                    resolve({ success: false, reachedLimit: reachedLimit });
                }
            } catch (e) {
                stats.adFailed++;
                logger.error(`广告处理异常: ${e.message}`);
                stats.errors.push(`广告${adIndex}异常: ${e.message}`);
                resolve({ success: false, reachedLimit: false });
            }
        }).catch(function (error) {
            stats.adFailed++;
            logger.error(`广告请求失败: ${error.message}`);
            stats.errors.push(`广告${adIndex}请求失败: ${error.message}`);
            resolve({ success: false, reachedLimit: false });
        });
    })

}
async function checkin2() {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: `https://linjiucloud-api.ysservice.com.cn/mc/member/memberPoint?mobile=${G_ljzfhd}&tenantId=10111`,
            headers: {
                Host: 'linjiucloud-api.ysservice.com.cn',
                'X-Project-id': '',
                xweb_xhr: '1',
                'X-Client-Id': '64',
                'X-Tenant-Id': '10111',
                Referer: 'https://servicewechat.com/wx0a9f159eddb2c5f8/105/page-frame.html',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0',
                Connection: 'keep-alive',
                'Content-Type': 'application/json'
            },
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }

                if (data.code !== 0) {
                    const errorMsg = `查询积分失败: ${data.message || '未知错误'}`;
                    logger.error(errorMsg);
                    stats.errors.push(errorMsg);
                    return;
                }

                const currentPoints = data.data.availablePoints || 0;
                stats.totalPoints += currentPoints;
                
                // 计算本次获得的积分（如果有上次记录）
                const lastAccount = stats.accountDetails.find(acc => acc.phone === G_ljzfhd);
                const earnedThisTime = lastAccount ? currentPoints - lastAccount.points : 0;
                
                const accountInfo = {
                    phone: G_ljzfhd,
                    points: currentPoints,
                    earned: earnedThisTime > 0 ? earnedThisTime : 0,
                    status: 'success',
                    timestamp: new Date().toLocaleString()
                };
                stats.accountDetails.push(accountInfo);

                logger.success(`💎 账号 ${G_ljzfhd} 当前总积分: ${currentPoints}`);
                if (earnedThisTime > 0) {
                    logger.info(`📈 本次获得: ${earnedThisTime} 积分`);
                }
                addNotifyStr(`\n💰 当前积分: ${currentPoints}`, false);


            } catch (e) {
                logger.error(`积分查询处理异常: ${e.message}`);
                stats.errors.push(`积分查询异常: ${e.message}`);
            }
        }).catch(function (error) {
            logger.error(`积分查询请求失败: ${error.message}`);
            stats.errors.push(`积分查询失败: ${error.message}`);
        }).then(res => {
            resolve();
        });
    })

}
async function checkin3() {
    let customers = []; // 用于存储customer_id的数组
    let taskDetails = []; // 保存任务详情到局部变量
    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: `https://linjiucloud-api.ysservice.com.cn/mt/mini/task/list`,
            headers: {
                Host: 'linjiucloud-api.ysservice.com.cn',
                'X-Project-id': '',
                xweb_xhr: '1',
                'X-Client-Id': '64',
                'X-Tenant-Id': '10111',
                Referer: 'https://servicewechat.com/wx0a9f159eddb2c5f8/105/page-frame.html',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0',
                Connection: 'keep-alive',
                'Content-Type': 'application/json'
            },
            data: `{"memberId":"${G_ljzfhd}","tenantId":"10111"}`
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }

                if (data.code !== 0) {
                    const errorMsg = `获取任务列表失败: ${data.message || '未知错误'}`;
                    logger.warn(`⚠️ ${errorMsg}`);
                    stats.errors.push(errorMsg);
                    return;
                }

                if (!data.data || data.data.length === 0) {
                    logger.info(`ℹ️ 暂无可执行的任务`);
                    addNotifyStr(`ℹ️ 暂无额外任务`, false);
                    return;
                }

                // 保存任务列表到局部变量，避免被后续请求覆盖
                taskDetails = [...data.data];
                
                logger.info(`📋 发现 ${taskDetails.length} 个任务`);
                addNotifyStr(`\n🎯 任务列表 (共${taskDetails.length}个):`, false);
                
                // 打印任务详情
                logger.info(`\n任务详情列表：`);
                taskDetails.forEach((task, idx) => {
                    const taskInfo = {
                        序号: idx + 1,
                        任务类型: task.tmplType || '未知',
                        任务名称: task.title || task.name || task.tmplType,
                        任务描述: task.description || task.desc || '-',
                        奖励积分: task.pointCount || task.points || '未知',
                        任务状态: task.status || task.state || '-'
                    };
                    logger.info(`  ${idx + 1}. [${taskInfo.任务类型}] ${taskInfo.任务名称}`);
                    logger.info(`     └─ 描述: ${taskInfo.任务描述}`);
                    logger.info(`     └─ 奖励: ${taskInfo.奖励积分}积分 | 状态: ${taskInfo.任务状态}`);
                    logger.debug(`     └─ 完整数据: ${JSON.stringify(task)}`);
                    customers.push(task.tmplType);
                });
                logger.info(``);

                // 执行任务（跳过READ和AD类型，这两个任务会单独循环执行）
                logger.info(`\n开始执行任务...`);
                for (let index = 0; index < customers.length; index++) {
                    const customer = customers[index];
                    const taskDetail = taskDetails[index] || {};
                    const taskName = taskDetail.title || taskDetail.name || customer;
                    
                    // 跳过READ和AD类型的任务，它们会在后面单独循环执行
                    if (customer === 'READ' || customer === 'AD') {
                        logger.info(`\n🎯 [${index + 1}/${customers.length}] 跳过: ${taskName} (将在后续循环中执行)`);
                        continue;
                    }
                    
                    logger.info(`\n🎯 [${index + 1}/${customers.length}] 执行: ${taskName}`);
                    await checkin4(customer, index + 1, taskName);
                    if (index < customers.length - 1) {
                        logger.debug(`等待2秒后执行下一个任务...`);
                        await $.wait(2000);
                    }
                }




            } catch (e) {
                logger.error(`任务列表处理异常: ${e.message}`);
                stats.errors.push(`任务列表异常: ${e.message}`);
            }
        }).catch(function (error) {
            logger.error(`任务列表请求失败: ${error.message}`);
            stats.errors.push(`任务列表失败: ${error.message}`);
        }).then(res => {
            resolve();
        });
    })

}
async function checkin4(customer, taskIndex = 0, taskName = '') {
    return new Promise((resolve) => {
        const displayName = taskName || customer;
        var options = {
            method: 'POST',
            url: 'https://linjiucloud-api.ysservice.com.cn/mt/web/action/add',
            headers: {
                Host: 'linjiucloud-api.ysservice.com.cn',
                'X-Project-id': '',
                xweb_xhr: '1',
                'X-Client-Id': '64',
                'X-Tenant-Id': '10111',
                Referer: 'https://servicewechat.com/wx0a9f159eddb2c5f8/105/page-frame.html',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0',
                Connection: 'keep-alive',
                'Content-Type': 'application/json'
            },
            data: `{"actionRecordCO":{"actionType":"${customer}","actionUnit":"1","channel":"LJZF","createdBy":"${ckid}","unitCount":"1","week":""},"tenantId":"10111"}`
        };
        
        if (debug) {
            logger.debug(`发送任务请求: ${displayName} (${customer})`);
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        
        axios.request(options).then(async function (response) {
            try {
                data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }

                if (data.code == 0) {
                    const points = data.data.pointCount || 0;
                    stats.taskSuccess++;
                    stats.earnedPoints += points;
                    logger.success(`   ✅ 完成! 获得 ${points} 积分 (累计: ${stats.earnedPoints})`);
                    addNotifyStr(`  ✅ 任务${taskIndex} [${displayName}]: +${points}积分`, false);
                } else {
                    stats.taskFailed++;
                    const msg = data.message || '未知错误';
                    logger.warn(`   ⚠️ 失败: ${msg}`);
                    addNotifyStr(`  ⚠️ 任务${taskIndex} [${displayName}]: ${msg}`, false);
                    // 只记录真正的错误，已完成/达到上限/配置问题不算警告
                    if (!msg.includes('已完成') && 
                        !msg.includes('达到上限') && 
                        !msg.includes('超上限') && 
                        !msg.includes('配置问题') && 
                        !msg.includes('已加过') &&
                        !msg.includes('任务异常')) {
                        stats.errors.push(`任务${taskIndex}[${displayName}]失败: ${msg}`);
                    }
                }
            } catch (e) {
                stats.taskFailed++;
                logger.error(`任务${taskIndex} [${displayName}] 处理异常: ${e.message}`);
                stats.errors.push(`任务${taskIndex}[${displayName}]异常: ${e.message}`);
            }
        }).catch(function (error) {
            stats.taskFailed++;
            logger.error(`任务${taskIndex} [${displayName}] 请求失败: ${error.message}`);
            stats.errors.push(`任务${taskIndex}[${displayName}]失败: ${error.message}`);
        }).then(res => {
            resolve();
        });
    })

}
async function Envs() {
    if (G_ljzfhd) {
        if (G_ljzfhd.indexOf("&") != -1) {
            G_ljzfhd.split("&").forEach((item) => {
                const trimmedItem = item.trim();
                if (trimmedItem) {
                    G_ljzfhdArr.push(trimmedItem);
                }
            });
        } else if (G_ljzfhd.indexOf("\n") != -1) {
            G_ljzfhd.split("\n").forEach((item) => {
                const trimmedItem = item.trim();
                if (trimmedItem) {
                    G_ljzfhdArr.push(trimmedItem);
                }
            });
        } else {
            const trimmedItem = G_ljzfhd.trim();
            if (trimmedItem) {
                G_ljzfhdArr.push(trimmedItem);
            }
        }

        if (G_ljzfhdArr.length === 0) {
            logger.error(`变量 G_ljzfhd 为空，请检查配置`);
            addNotifyStr(`❌ 变量 G_ljzfhd 为空，请检查配置`, false);
            return false;
        }

        logger.info(`✅ 成功加载 ${G_ljzfhdArr.length} 个账号`);
    } else {
        logger.error(`未填写变量 G_ljzfhd`);
        addNotifyStr(`❌ 未填写变量 G_ljzfhd，请先配置环境变量`, false);
        return false;
    }

    return true;
}
function addNotifyStr(str, is_log = true) {
    if (is_log) {
        log(`${str}\n`)
    }
    msg += `${str}\n`
}

// ============================================发送消息============================================ \\
async function SendMsg(message) {
    if (!message) {
        logger.warn('通知消息为空，跳过发送');
        return;
    }

    if (Notify > 0) {
        try {
            logger.info('📤 准备发送通知...');
            if ($.isNode()) {
                // 检查 sendNotify.js 是否存在
                const fs = require('fs');
                const path = require('path');
                const notifyPath = path.join(__dirname, 'sendNotify.js');
                
                if (fs.existsSync(notifyPath)) {
                    try {
                        const notify = require('./sendNotify');
                        await notify.sendNotify($.name, message);
                        logger.success('✅ 通知发送成功');
                    } catch (notifyError) {
                        // 如果是 got 相关错误，给出友好提示
                        if (notifyError.message.includes('got')) {
                            logger.warn('⚠️ 通知模块缺少依赖，请安装: npm install got');
                            logger.info('💡 或者将 CONFIG.NOTIFY 设置为 0 关闭通知功能');
                        } else {
                            logger.error(`❌ 通知发送失败: ${notifyError.message}`);
                        }
                        logger.debug(`错误详情: ${notifyError.stack}`);
                        // 通知失败不影响主流程，继续执行
                        logger.info('ℹ️ 通知发送失败，但脚本已正常执行完成');
                    }
                } else {
                    logger.warn('⚠️ 未找到 sendNotify.js 文件');
                    logger.info('💡 提示: 将 CONFIG.NOTIFY 设置为 0 可关闭通知功能');
                }
            } else {
                $.msg(message);
                logger.success('✅ 通知已推送');
            }
        } catch (error) {
            logger.error(`❌ 通知处理异常: ${error.message}`);
            logger.debug(`错误详情: ${error.stack}`);
            logger.info('ℹ️ 通知发送失败，但脚本已正常执行完成');
        }
    } else {
        logger.info('ℹ️ 通知功能已关闭');
        log(message);
    }
}
var MD5 = function (string) { function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); } function AddUnsigned(lX, lY) { var lX4, lY4, lX8, lY8, lResult; lX8 = (lX & 0x80000000); lY8 = (lY & 0x80000000); lX4 = (lX & 0x40000000); lY4 = (lY & 0x40000000); lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF); if (lX4 & lY4) { return (lResult ^ 0x80000000 ^ lX8 ^ lY8); } if (lX4 | lY4) { if (lResult & 0x40000000) { return (lResult ^ 0xC0000000 ^ lX8 ^ lY8); } else { return (lResult ^ 0x40000000 ^ lX8 ^ lY8); } } else { return (lResult ^ lX8 ^ lY8); } } function F(x, y, z) { return (x & y) | ((~x) & z); } function G(x, y, z) { return (x & z) | (y & (~z)); } function H(x, y, z) { return (x ^ y ^ z); } function I(x, y, z) { return (y ^ (x | (~z))); } function FF(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); } function GG(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); } function HH(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); } function II(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); } function ConvertToWordArray(string) { var lWordCount; var lMessageLength = string.length; var lNumberOfWords_temp1 = lMessageLength + 8; var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64; var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16; var lWordArray = Array(lNumberOfWords - 1); var lBytePosition = 0; var lByteCount = 0; while (lByteCount < lMessageLength) { lWordCount = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition)); lByteCount++; } lWordCount = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition); lWordArray[lNumberOfWords - 2] = lMessageLength << 3; lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29; return lWordArray; } function WordToHex(lValue) { var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount; for (lCount = 0; lCount <= 3; lCount++) { lByte = (lValue >>> (lCount * 8)) & 255; WordToHexValue_temp = "0" + lByte.toString(16); WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2); } return WordToHexValue; } function Utf8Encode(string) { string = string.replace(/\r\n/g, "\n"); var utftext = ""; for (var n = 0; n < string.length; n++) { var c = string.charCodeAt(n); if (c < 128) { utftext += String.fromCharCode(c); } else if ((c > 127) && (c < 2048)) { utftext += String.fromCharCode((c >> 6) | 192); utftext += String.fromCharCode((c & 63) | 128); } else { utftext += String.fromCharCode((c >> 12) | 224); utftext += String.fromCharCode(((c >> 6) & 63) | 128); utftext += String.fromCharCode((c & 63) | 128); } } return utftext; } var x = Array(); var k, AA, BB, CC, DD, a, b, c, d; var S11 = 7, S12 = 12, S13 = 17, S14 = 22; var S21 = 5, S22 = 9, S23 = 14, S24 = 20; var S31 = 4, S32 = 11, S33 = 16, S34 = 23; var S41 = 6, S42 = 10, S43 = 15, S44 = 21; string = Utf8Encode(string); x = ConvertToWordArray(string); a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476; for (k = 0; k < x.length; k += 16) { AA = a; BB = b; CC = c; DD = d; a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756); c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB); b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE); a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A); c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613); b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501); a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8); d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF); c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE); a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122); d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193); c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E); b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821); a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340); c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51); b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA); a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], S22, 0x2441453); c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8); a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6); c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED); a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8); c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A); a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681); c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C); a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9); c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70); a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6); d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA); c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05); a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5); c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665); a = II(a, b, c, d, x[k + 0], S41, 0xF4292244); d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97); c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039); a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3); d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92); c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1); a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0); c = II(c, d, a, b, x[k + 6], S43, 0xA3014314); b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1); a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82); d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235); c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391); a = AddUnsigned(a, AA); b = AddUnsigned(b, BB); c = AddUnsigned(c, CC); d = AddUnsigned(d, DD); } var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d); return temp.toLowerCase(); }
function randomString(m) {
    for (var e = m > 0 && void 0 !== m ? m : 21, t = ""; t.length < e;) t += Math.random().toString(36).slice(2);
    return t.slice(0, e)
}
function randomnum(e) {
    e = e || 32;
    var t = "1234567890",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}
function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {
                url: t
            } : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch { }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({
                    url: t
                }, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {
                        script_text: t,
                        mock_type: "cron",
                        timeout: r
                    },
                    headers: {
                        "X-Key": o,
                        Accept: "*/*"
                    }
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {}; {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if (!s && !i) return {}; {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i)
                if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => { })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => {
                const {
                    message: s,
                    response: i
                } = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => { })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            });
            else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const {
                    url: s,
                    ...i
                } = t;
                this.got.post(s, i).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {
                    "open-url": t
                } : this.isSurge() ? {
                    url: t
                } : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}   