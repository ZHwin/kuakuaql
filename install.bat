@echo off
chcp 65001 >nul
echo ================================
echo   自动签到脚本 - 依赖安装工具
echo ================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node -v
echo ✅ npm 已安装
npm -v
echo.

REM 检查 package.json 是否存在
if not exist "package.json" (
    echo ❌ 未找到 package.json 文件
    pause
    exit /b 1
)

echo 📦 开始安装依赖...
echo.

REM 安装依赖
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ================================
    echo ✅ 依赖安装成功！
    echo ================================
    echo.
    echo 📝 已安装的依赖:
    call npm list --depth=0
    echo.
    echo 🚀 现在可以运行脚本了:
    echo    node jlyh.js
    echo    node ljzf.js
    echo    node xmh.js
    echo    node xmyx.js
) else (
    echo.
    echo ❌ 依赖安装失败，请检查网络连接或手动安装
    echo    手动安装命令: npm install got@11 axios request tough-cookie crypto-js
)

echo.
pause
