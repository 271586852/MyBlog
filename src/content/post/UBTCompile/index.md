---
title: UBT编译流程
publishDate: 2024-07-27 08:00:00
description: 'astro-theme-pure 个人定制化指南'
tags:
  - Waline
  - Vercel
  - Supabase
coverImage: { src: './thumbnail.jpg', color: '#64574D' }
language: '中文'
---

## 前言

项目中需要用到UBT和UHT工具进行UE的工程编译，有必要对这两个工具作解构，故此写下本文。

要探究UBT与UHT的运行流程，从UBT工程调试着手，打开UE源码，将UBT工程设为启动项，设置命令行参数参考命令
`newUBTTest Win64 Development -Project="D:\dev\UBTTest\newUBTTest\newUBTTest.uproject" -Modules=Engine -WaitMutex -FromMsBuild`

> [!NOTE]
>
> 此处`newUBTTest.uproject`为使用UE编辑器创建的模板工程。

## 入口
开始调试，入口函数`UnrealBuildTool.cs::Main`,进入入口函数后，进行了多个任务的创建

### 解决方案工程的生成

我们点击右键UE4工程，选择 **Generate Visual Studio project**，将会生成用于 Visual Studio 调试的工程文件 `MyProject.sln`。这一过程的原理如下：

### Generate Visual Studio Project 的实质

点击右键并选择生成 Visual Studio 文件，实际上是执行了 `UnrealBuildTool.exe` 的带参命令，例如：

```bash
"C:/Program Files/Epic Games/UE_4.15/Engine/Binaries/DotNET/UnrealBuildTool.exe" -projectfiles -project="C:/UnrealEngine4Project/GJM_Flying/GJM_Flying.uproject" -game -rocket -progress
```

如果你的 UE4 是从其他电脑复制过来的，右键 UE4 工程可能没有生成 Visual Studio 的选项。这种情况下，可以手动运行上述命令生成 `.sln` 工程文件。

### 调用 UnrealBuildTool 做了什么？

UnrealBuildTool (UBT) 扫描了解决方案目录中的模块、插件和源文件，更新项目文件和解决方案，同时生成 Intellisense 数据（如光标悬停时显示类定义和注释）。

在这个过程中，UBT 会创建两个重要的目录：`.vs` 文件夹和 `Intermediate` 文件夹。

- **`.vs` 文件夹**  
  存储当前用户在解决方案中的工作配置，例如窗口布局、最后打开的选项卡、调试断点等。这些信息用于在重新打开解决方案时恢复工作状态。

- **`Intermediate` 文件夹**  
  初始化一些空文件夹，并在 `/Build/BuildRules` 文件夹下生成模块扫描地址（`.txt`）、动态库（`.dll`）、调试信息文件（`.pdb`）等。此外，还会在 `ProjectFiles` 文件夹中生成 UE4 和项目的工程配置文件。

### 涉及的文件说明

- **`.sln`**: 解决方案配置文件，管理方案中的多个 `vcxproj` 工程。
- **`.vcxproj`**: 工程配置文件，管理工程中的细节（如包含的文件、引用的库等）。
- **`.vcxproj.filters`**: 筛选器文件，保存解决方案中的筛选器信息。
- **`.vcxproj.user`**: 本地化用户配置文件，允许用户自定义项目的开发环境。
- **`.suo`**: 解决方案用户选项文件，记录与解决方案关联的用户设置。
- **`.pdb`**: 程序数据库文件，存储调试信息。

### 开始调试

生成工程文件后，可以在 Visual Studio 中编译项目。编译过程的主要步骤如下：

1. **配置信息**  
   编译器需要知道系统环境（如标准库路径、安装位置等）。这些信息通过编译参数指定，存储在 `.sln` 文件中。

2. **确定依赖关系**  
   编译器通过 `makefile` 文件确定源码文件的编译顺序和依赖关系。例如：
   - A 文件依赖于 B 文件时，B 文件必须先编译。
   - 当 B 文件发生变化时，A 文件会被重新编译。

3. **调用批处理文件**  
   Visual Studio 调用批处理文件（如 `build.bat`）执行编译任务。批处理文件最终调用 UBT 完成构建。

---

## UBT - 引擎构建工具

### UBT 的主要职责

- 扫描解决方案目录中的模块和插件。
- 确定需要重新构建的模块。
- 调用 UHT 解析 C++ 头文件。
- 从 `.Build.cs` 和 `.Target.cs` 文件生成编译器和链接器选项。
- 执行特定平台的编译器（如 Visual Studio 或 LLVM）。

### UBT 的工作流程

1. **收集信息与参数解析**  
   UBT 收集模块、插件和源文件信息，并解析命令行参数。

2. **生成 Makefile**  
   UBT 生成 `makefile` 文件，确定模块的依赖关系。

3. **调用 UHT**  
   UBT 调用 Unreal Header Tool (UHT) 解析 C++ 头文件，生成反射代码。

---

## UHT - 预编译预处理工具

### UHT 的主要职责

- 初始化日志系统和文件系统。
- 解析 C++ 头文件，生成反射代码。

### UHT 的工作流程

1. **解析 `.uhtmanifest` 文件**  
   UHT 读取 `.uhtmanifest` 文件，获取模块编译路径、C++ 路径和预编译头路径。

2. **解析头文件**  
   UHT 解析头文件中的宏（如 `UENUM()`、`UCLASS()`、`USTRUCT()` 等），生成 `.generated.h` 和 `.gen.cpp` 文件。

3. **生成反射代码**  
   - `.generated.cpp`: 为每个支持反射的类生成反射信息代码。
   - `.generated.h`: 为每个支持反射的头文件生成对应的宏代码。

---

## 编译与链接

UHT 生成反射代码后，Visual Studio 调用编译器完成编译和链接：

1. **编译**  
   将源代码翻译为目标文件（`.obj`）。

2. **链接**  
   将目标文件与库文件链接，生成可执行程序或动态库。

---

## 总结

- UBT 负责收集信息、解析参数、生成 `makefile`，并调用 UHT。
- UHT 负责解析头文件，生成反射代码。
- Visual Studio 完成最终的编译和链接。

通过以上流程，UE4 的工程编译得以完成。


## 流程图

[UBT流程图](https://www.processon.com/view/link/675187900f72a11ed59004f8?cid=6743e629cdf561480627f70e)

## 其他页面

- [编译器的工作过程](http://www.ruanyifeng.com/blog/2014/11/compiler.html)

- [虚幻4反射](https://www.cnblogs.com/ghl_carmack/p/5698438.html)

- [UE4反射宏展开](https://zhuanlan.zhihu.com/p/46836554)

- [调用UHT时机](https://zhuanlan.zhihu.com/p/561178256)

- [探讨UE4中的UBT和UHT](https://www.cnblogs.com/shadow-lr/p/UBT-UHT-InUE4.html#uht)
