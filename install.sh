#!/bin/bash

echo "================================"
echo "  自动签到脚本 - 依赖安装工具"
echo "================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"
echo ""

# 检查 package.json 是否存在
if [ ! -f "package.json" ]; then
    echo "❌ 未找到 package.json 文件"
    exit 1
fi

echo "📦 开始安装依赖..."
echo ""

# 安装依赖
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "================================"
    echo "✅ 依赖安装成功！"
    echo "================================"
    echo ""
    echo "📝 已安装的依赖:"
    npm list --depth=0
    echo ""
    echo "🚀 现在可以运行脚本了:"
    echo "   node jlyh.js"
    echo "   node ljzf.js"
    echo "   node xmh.js"
    echo "   node xmyx.js"
else
    echo ""
    echo "❌ 依赖安装失败，请检查网络连接或手动安装"
    echo "   手动安装命令: npm install got@11 axios request tough-cookie crypto-js"
    exit 1
fi
