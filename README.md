
<div align="center" style="display: flex; flex-direction: column; align-items: center;">
<img style="width: 156px; height: 156px; border-radius: 12px;" src="./assets/app-icon.png" alt="App Icon"/></a>
<br>
<br>
<i>Alive：支持私有化部署 AI 的 3D 桌宠软件。</i>
<br>
<br>
<a href="https://github.com/TopSea/Alive/stargazers"><img src="https://img.shields.io/github/stars/TopSea/Alive" alt="Stars Badge"/></a>
<a href="https://github.com/TopSea/Alive/releases"><img src="https://img.shields.io/github/downloads/TopSea/Alive/total" alt="Download Badge"/></a>
</div>

## [Englisg Doc](./docs/en/README.md)

## 开发进度
Alive [v1.0.0-pre] 已经发布，快来领取你的芙芙吧！   
关注我（[GoAHi](https://space.bilibili.com/307219768)），更快获得发布信息。    
**软件现在很多细节没有完善，使用可能会遇到问题，不爱折腾的话谨慎下载。**

## 安装使用
Live2d 最后的支持版本是：[Alive v0.0.3](https://github.com/TopSea/Alive/releases/tag/v0.0.3)    
**只有 Alive v1.0.0 及之后的版本有 AI 功能。**

## 功能实现计划
### 已实现的功能

- [x] 鼠标点击穿透
- [x] 保存窗口的位置和大小
- [x] 自动检查更新
- [x] 缩放成图标
- [x] 语音唤醒功能
- [x] 语音聊天功能（*需要自行部署 [AliveAi] 服务，用别人的也不是不行* :smile: ）
- [x] AI 聊天功能（*需要部署 [AliveAi] 服务*）
- [x] 对话时模型口型同步

### 1.1.0 计划实现的功能
- [ ] 模型点击交互
- [ ] 对话时模型播放响应的动作
- [ ] 脱离软件主体对 faster-whisper 的依赖
- [ ] 更多的细节优化（AI 服务连接状态，切换模型就切换唤醒词......）

### 卫星
- [ ] Android 适配
- [ ] 定制系统：角色专属的图标、颜色、背景等
- [ ] 好感系统


## 适配计划
Windows：目前只有 Windows 11 经过了测试。Windows 10 及之前的版本不保证能否运行。  

## 使用须知
软件中的模型不属于本软件，具体信息可在对应的模型设置中查看。  
用户可以自行更换展示的模型，本软件不对模型的展示效果和内容负责。    
用户可以连接自行部署的AI服务器，用户自行部署的 AI 服务器的稳定性和安全性由用户自行负责。    
用户自行部署的 AI 服务器与本软件之间的连接和交互应符合本软件的接口规范和要求。因用户自行部署的 AI 服务器不符合规范而导致的本软件无法正常使用或其他问题，由用户自行解决。    
软件中的文本及语音信息内容由 AI 生成，无法确保真实准确，仅供参考。     
   

## 关于项目
*最开始是用 Tauri 和 React 写的（[Live2d-Tauri]），但是写的不是很好。就打算用 vue 再再造个轮子顺便也让我在原神中的老婆们能展示展示，所以 Alive 就诞生了。*    

*因为一些原因，项目代码不再开源，已开源的代码不再维护。*



[app-icon]: ./assets/app-icon.png
[v1.0.0-pre]: https://github.com/TopSea/Alive/releases/tag/v1.0.0-pre
[AliveAi]: https://github.com/TopSea/AliveAi
[Live2d-Tauri]: https://github.com/TopSea/Live2d-Tauri
