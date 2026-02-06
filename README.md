# Exa Chat

一个基于 [Exa API](https://exa.ai) 的 AI 搜索引擎，支持网页搜索、AI 问答和深度研究三种模式。



## ✨ 功能特性

- 🔍 **智能搜索** - 使用 Exa API 进行 AI 驱动的网页搜索，支持关键词高亮
- 💬 **AI 问答** - 直接获取 AI 生成的答案，附带引用来源
- 📚 **深度研究** - 使用 Exa Research API 进行深度主题研究，生成详细报告
- ⚡ **极速部署** - 一键部署到 Vercel


## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **UI 组件**: HeroUI
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion
- **搜索 API**: Exa
- **部署**: Vercel
- **语言**: TypeScript

## 🚀 快速开始

### 一键部署到 Vercel

点击下方按钮，一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ZezeChen/exa-chat)


部署时需要添加环境变量

| 变量名 | 描述 | 必填 | 默认值 |
|--------|------|------|--------|
| `EXA_API_KEY` | Exa API 密钥 | ✅ | - |
| `EXA_API_BASE` | Exa API 基础 URL | ❌ | `https://api.exa.ai` |




### 本地开发

#### 前置要求

- Node.js 20+
- pnpm (推荐)
- Exa API Key ([获取地址](https://exa.ai))

#### 安装步骤

1. 克隆项目

```bash
git clone https://github.com/ZezeChen/exa-chat.git
cd exa-chat
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置环境变量：

```env
EXA_API_KEY=your_exa_api_key_here
EXA_API_BASE=https://api.exa.ai
```

4. 启动开发服务器

```bash
pnpm dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
exa-chat/
├── app/
│   ├── api/
│   │   ├── search/route.ts    # 搜索 API
│   │   ├── answer/route.ts    # 问答 API
│   │   ├── research/route.ts  # 深度研究 API
│   │   └── contents/route.ts  # 内容详情 API
│   ├── page.tsx               # 主页面
│   ├── layout.tsx             # 布局
│   └── globals.css            # 全局样式
├── components/
│   ├── AnswerCard.tsx         # AI 回答卡片
│   ├── SearchResultCard.tsx   # 搜索结果卡片
│   └── PromptInput.tsx        # 输入框组件
└── lib/
    ├── exa-client.ts          # Exa API 客户端
    └── types.ts               # 类型定义
```


## 📝 使用说明

### 搜索模式 🔍
输入关键词，获取相关网页搜索结果，支持卡片式展示和详情弹窗。

### 问答模式 ⚡
输入问题，获取 AI 生成的答案及引用来源，支持 Markdown 渲染。

### 研究模式 📚
输入研究主题，获取深度研究报告，包含详细分析和引用来源。

## 📄 License

MIT License

## 🙏 致谢

- [Exa](https://exa.ai) - AI 搜索 API
- [HeroUI](https://heroui.com) - UI 组件库
- [Next.js](https://nextjs.org) - React 框架
- [Vercel](https://vercel.com) - 部署平台
