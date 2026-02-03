---
title: Linux服务器维修
publishDate: 2024-07-27 08:00:00
description: Linux服务器维修、Nginx配置、跨域、Docker打补丁
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

## Docker


