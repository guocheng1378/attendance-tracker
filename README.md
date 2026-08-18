# 考勤系统

双语员工考勤表单系统（中文 + ພາສາລາວ）

## 功能

- 手机友好，响应式设计
- 中老双语一键切换
- 实时时钟，自动判断迟到早退
- 点选姓名快速签到
- 管理后台查看统计，导出CSV
- 支持Supabase云端存储或本地localStorage

## 快速开始

### 本地模式（无需配置）
直接打开index.html即可使用。

### 云端模式（推荐）
1. 注册 supabase.com（免费）
2. 创建attendance表
3. 编辑config.js填入Supabase URL和key
4. 启用GitHub Pages

## 文件结构

- index.html 签到页
- admin.html 管理后台
- style.css 样式
- config.js 配置
- app.js 签到逻辑
- admin.js 后台逻辑

## 配置

编辑config.js：EMPLOYEES数组修改员工名单，WORK_START/WORK_END修改上下班时间。