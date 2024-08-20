# 关于 .alive_mmd.json
**因为 mmd 没有现成可用的动作播放和循环逻辑，所以只能我自己写一个了。**

## .alive_mmd.json 样例
```
{
    "what_is_this_file": "A specification file for Alive to play mmd motions",
    "mmd_model": "芙卡洛斯.pmx",
    "default_bg": [],
    "alive_motions": [
        {
            "motion_name": "pose1",
            "motions": [
                "../motion/丘丘摇/丘丘摇.vmd",
                "../motion/丘丘摇/丘丘摇-相机.vmd"
            ],
            "bgm": "../motion/丘丘摇/丘丘摇.wav",
            "extra": {
                "e_model": "",
                "e_motions": []
            }
        }
    ],
    "pose_motions": [
        "pose1"
    ],
    "dance_motions": [
        "pose1"
    ],
    "interval": 500
}
```

## 属性解释
` mmd_model `：播放动作的 mmd 模型，一般就是你的人物模型，只支持 pmx 格式。**此属性必须存在且不能留空。**    

` default_bg `：可添加的背景模型，可以添加 0 个或多个背景模型，只支持 pmx 格式。**此属性必须存在，可以留空。**   

` alive_motions `：Alive mmd 的动作格式，可以添加 1 个或多个动作。**此属性必须存在且不能留空。**
- ` motion_name `：Alive mmd 动作的名称。**此属性必须存在且不能留空。**
- ` motions `：Alive mmd 动作的动作文件，可以包含姿态动作、脸部表情动作和相机动作，只支持 vmd 格式。**此属性必须存在且不能留空。请一定要包含相机动作，不然更换动作后，相机的展示位置会出问题。**
- ` bgm `：Alive mmd 动作的背景音乐，支持 mp3 和 wav 格式。**此属性必须存在且不应留空。如果没有背景音乐文件，动作的播放会卡、卡、卡、卡、卡...**    
- ` extra `：Alive mmd 动作的附加模型和附加模型的动作。**此属性必须存在且不能留空。**
    - ` e_model `：Alive mmd 动作的附加模型，只支持 pmx 格式。**此属性必须存在，可以留空。**    
    - ` e_motions `：Alive mmd 动作的附加模型的动作文件，只支持 vmd 格式。**此属性必须存在，如果 e_model 不为空，则此处也不应为空。**   
  
` pose_motions `：Alive mmd 动作的默认动作名称组，其中的值必须声明在 alive_motions 的 motion_name 中。**此属性必须存在且不能留空。**    

` dance_motions `：Alive mmd 动作的舞蹈动作名称组，其中的值必须声明在 alive_motions 的 motion_name 中。**此属性必须存在且不应留空。**    

` interval `：Alive mmd 动作播放结束后停留的时间。**此属性必须存在且不能留空。**    

## 附加说明
- Alive 只会播放名字存放在 ` pose_motions ` 和 ` dance_motions ` 中的动作。播放方式为随机。你可以把你喜欢的动作多添加几次，手动提高概率。    

- ` extra ` 中的动作不支持 ` 外亲骨骼 ` ，需要 k 出所有关键帧。

- 目前 Alive 没有包含对 .alive_mmd.json 的合法性检查，没有遵守上面的提示的话就可能啥也没有，也没有提示。    

- 除 ` mmd_model ` 外其他的文件都支持相对路径。只要你的文件还在应用的 ` /mmd/ ` 下，随便你放哪都行。    

- 除 ` interval ` 外，你要修改的值都应该是字符串类型的。