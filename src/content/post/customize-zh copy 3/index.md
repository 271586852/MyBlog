---
title: 个人定制化指南
publishDate: 2024-07-27 08:00:00
description: 'astro-theme-pure 个人定制化指南'
tags:
  - Waline
  - Vercel
  - Supabase
coverImage: { src: './thumbnail.jpg', color: '#64574D' }
language: '中文'
---

## 起因
隔壁组要调用我们组的数据服务，调用中遇到了跨域问题。

跨域是因为浏览器的同源协议：要求同协议同IP同端口。

要解决跨域，三种方式：

- 后端修改服务配置
- 前端使用jsonp请求
- 代理转发

作为后端的我们，修改Nginx配置是最方便的。

在Nginx配置文件中添加

> [!NOTE]
>  add_header 'Access-Control-Allow-Origin' '*';
>  add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
>  add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';


吭哧吭哧修改完远程服务器的Nginx配置后，便准备重启服务器的Nginx服务来应用配置。

这时候便需要找到Nginx的入口文件。

按理说在windows下直接点击nginx.exe就跨域启动了，而linux环境则需要找到nginx文件，而Nginx文件目录中却没有找到Nginx二进制文件，我的好友一通操作，通过捕捉Linux的Nginx进程，也并没有找到这个入口文件。

此时我突然想到，机器应该有部署Nginx的开机自启，只要我重启机器，应该就可以自动重新启动Nginx！

当我敲下rebot命令后，不曾想却让事情更更更麻烦了。。。

## 还是得去机房

按下重启命令后，我不断尝试远程SSH连接服务器，却一直无法连接，我心想这下坏了，别给我整坏了吧。。

无奈下只能第二天去机房实地查看服务器状况，联系老师、联系信息中心、老师再联系资产负责人后终于能进机房了

服务器重启系统遇到了问题，直接按F1进入系统，没接触过Linux系统的我当场现学命令行指令，重启SSH远程后回工位继续操作，临走时还被告知需要给系统打上Redis补丁，否则就禁IP。。

问了当时配置这服务器的工程师后，得知这Nginx环境是用Docker部署的，便没有入口文件

于是就变成了启动Docker--启动Nginx，



## 站点配置

[astro-theme-pure](https://github.com/cworld1/astro-theme-pure)

客制化本主题需要调整较多的源代码。

我们已经尽力将配置项集中在 `src/site.config.ts` 文件中，以方便用户进行修改，并集成了较多常见的社交媒体/工具 icon，如果你想要添加新的 icon，你需要自行修改源代码。

你可以在全局搜索如下关键字来找到需要替换的文本：

- `Lorem ipsum`
- `astro-theme-pure`
- `cworld`

接下来我们逐一展开介绍。

### 主配置文件 `src/site.config.ts`

请根据现有 `src/site.config.ts` 模板修改对应配置。

一些特殊配置项的说明如下：

#### Waline 评论系统

> [!NOTE]
>
> 对应 `src/site.config.ts` 中的 `siteConfig.walineServerUrl` 配置项。

主题的评论、阅读统计、点赞等功能均由 [Waline](https://waline.js.org/) 提供。

你可以参照其文档进行配置，推荐使用 [Vercel](https://vercel.com/) + [Supabase](https://supabase.com/) 的组合。

本主题只需要在 `src/site.config.ts` 中的 `siteConfig.walineServerUrl` 提供最终的后端域名即可。

#### Footer

> [!NOTE]
>
> 对应 `src/site.config.ts` 中的 `socialLinks` 配置项。

目前支持的社交媒体包括：

- `coolapk`
- `telegram`
- `github`
- `bilibili`
- `twitter`
- `zhihu`
- `steam`
- `netease_music`

如果你想要添加新的社交媒体，你需要修改如下文件：

- `src/types.ts`：添加新的 `SocialLink.name` 枚举值以及 `SocialMediaIconId` 的 icon 映射关系
- `public/icons/social.svg`：遵循现有格式，以 symbol 方式添加新的 icon

  推荐在如下网站寻找社交媒体的 icon，以保持一致性：

  - [remixicon](https://remixicon.com/)
  - [mingcute](https://www.mingcute.com/)

### 其他需要替换的文件

- `public/favicon`：网站的 favicon，你可以在 [favicon.io](https://favicon.io/favicon-converter/) 生成 favicon
- `public/images/social-card.png`：网站的社交卡片
- `src/assets/`：此目录下包含客户端渲染的头像、赞助二维码等图片，请替换为你自己的图片

## 其他页面

### About

目前支持的 icon 可在 `src/icons` 目录下找到。

如果你想要添加新的 Tools 图标，你需要在 `src/icons` 目录下添加新的 icon。

推荐在如下网站寻找新的 icon，以保持一致性：

- [iconify](https://icon-sets.iconify.design/)
- [icones](https://icones.js.org/)

## 部署模式

> [!NOTE]
>
> 对应 `astro.config.ts` 中的 `export default defineConfig` 配置项。

如果你采用 Vercel 部署，你无需修改。

如果你采用 Node.js 本地部署，你需要依照 `astro.config.ts` 中的注释，修改

```ts
import vercel from '@astrojs/vercel/serverless'
...
export default defineConfig({
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  ...
})
```

为

```ts
import node from '@astrojs/node'
...
export default defineConfig({
  adapter: node({
    mode: 'standalone'
  }),
  ...
})
```


1、代理问题
调用openai出现代理问题。
![alt text](72017d9a4f3af7956d615e182309c6b.png)

![alt text](image.png)

2、连接超时问题