@echo off
chcp 65001 >nul
echo ========================================
echo   知识库 打包脚本
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查依赖安装...
call pnpm install

echo.
echo [2/3] 开始打包 (Tauri Build)...
call pnpm tauri:build

echo.
echo [3/3] 打包完成！
echo.

:: 查找生成的安装包
set OUTPUT_DIR=src-tauri\target\release\bundle\nsis
if exist "%OUTPUT_DIR%\*.exe" (
    echo 安装包位置:
    dir /b "%OUTPUT_DIR%\*.exe"
    echo.
    echo 正在复制到桌面...
    copy "%OUTPUT_DIR%\*.exe" "%USERPROFILE%\Desktop\"
    echo ✅ 已复制到桌面！
) else (
    echo ⚠️ 未找到安装包，请检查构建是否成功
)

echo.
pause
