## markdown图片管理工具
[TOC]
npm包名称 markdown-image-manage 
markdown文件(简称md文件)中的图片大部分是以资源方式展示，此工具用于对于这些图片资源进行管理，不包含用base64等方式展示的图片。
通过命令行管理文件中的资源图片，可以清理，移动，下载，上传md文件中的图片，可同时修改md对应图片链接

---
## 功能

可以实现如下功能:

1. 分析:分析md文件中的资源图片，列出网络图片和本地图片，如果本地图片不存在则报警
2. 清理:整理md文件中本地图片所在目录的全部图片，md文件中如果未引用则转移到md-img-remove目录中
3. 下载:将md文件中的所有网络图片下载到指定目录
4. 上传:将md文件中本地所有图片自动通过picgo上传到图床中
5. 移动:将md文件中本地所有图片移动到指定目录

## 依赖项

1. 如果需要实现自动上传，则需要命令行全局安装 picgo 工具 , 具体见对应模块使用说明
2. 命令行参数实现来自commander.js 

## 安装

首先需要确保已经安装了 node.js 12 以上版本

建议通过 `npm i markdown-image-manage -g` 方式全局安装本工具，安装后可使用 `md-img -h` 查看相关帮助。

如果需要上传图片，请安装并设置picgo命令行工具

## 使用方法

如果图片的链接中有右括号，建议增加参数 -b 以准确识别图片地址

当本地图片不存在时将给出如下类似的提示

```shell
 ----error message total[3]----
d:\image1.png | not exist
d:\image2.png| not exist
d:\image3.png | not exist
```

此时可能是图片链接中有)，建议增加 -b 参数重试，比如  `md-img -b a mdFilePath`

本工具包含多个功能，分别说明如下

### 分析

#### 命令

`md-img a markdown文件路径`
返回md文件中的图片链接清单，包含本地，网络，本地失效的图片链接

#### 举例

```shell
md-img a e:\doc\test.md
 Will analyze images in[e:\doc\test.md]
 ----error message total[3]----
d:\image1.png | not exist
d:\image2.png| not exist
d:\image3.png | not exist
 ----local images total[3]----
e:\doc\1.png
e:\doc\2.png
e:\doc\3.png
 ----net images total[2]----
https://github.com/static/1.png
http://github.com/favicon.ico
```
### 清理
#### 命令

`md-img c markdown文件 `

整理md的本地图片文件夹内的图片，移走不属于本md文件的图片。

本地文件夹中根据后缀识别图片，格式范围为 '.png','.jpg','.bmp','.gif','.jpeg','.ico','.tga','.rle','.tif','.cur','.ani','.iff'

1. markdown中的所有本地图片需要在同一个目录内，因为需要对这个目录进行清理
2. 将md文件中没有引用的图片移动到图片目录下的 md-img-remove 目录中
3. 参考**分析**命令，会列出图片图片清单，同时列出清理的文件
4. 如果本地图片不在一个目录建议使用本工具的**移动**命令清理

#### 举例

```shell
md-img c e:\doc\test.md
 Will clean images in[e:\doc\test.md]
 ----local images total[3]----
e:\doc\aaaa\l1qlkj5h.png
e:\doc\aaaa\l1qlkj5j.png
e:\doc\aaaa\l1qlkj5l.png
 ----net images total[2]----
https://github.com/static/1.png
http://github.com/favicon.ico
 ----removed images total[2] to [md-img-remove]----
test1.png
test2.png
```

此时 test1.png 和 test2.png将转移到 e:\doc\aaaa\md-img-remove 目录下

### 下载

#### 命令

 `md-img d markdown文件 `

可通过 `md-img d -h` 来查看具体指令

下载md文件中的网络图片，如果相同的网络图片出现多次，只会下载一次。

详细参数如下

  -l, --local <path> 图片要下载的目标路径，可设置绝对路径或相对路径，默认为<filename>.assets，如md文件为test.md ，则目录为 test.assets
  -n, --rename      下载后是否需要重命名图片名，如无此参数将默认用原文件名，如果文件重复，则文件名后将自动添加 **(数字)** ，数字最大为999
  -r, --readonly     仅下载网络图片，但是不修改md文件中对应的图片链接，如无此参数，修改md文件中的图片链接并进行写入。
  -o, --overwrite   修改md文件中的图片链接时不备份原文件，直接覆盖，如无参数则将备份原文件，原文件名以_dlBK结尾。

#### 举例

```shell
md-img d e:\doc\test.md
 local Folder[e:\doc\test.assets] is not exists, will create
Will download images of [e:\doc\test.md]
to localFolder[e:\doc\test.assets]
 downloading [https://aaa/test.png], 1/3
 download error:
{ code: 404, message: 'Not Found' }
 downloading [https://github.com/static/1.png], 2/3
 e:\doc\test.assets\1.png is downloaded
 downloading [http://github.com/favicon.ico], 3/3
 e:\doc\test.assets\favicon.ico is downloaded
 The image links[3] in [e:\doc\test.md] has been updated
```

所有网络图片下载到test.assets目录中，如果网络图片无法下载将报错  download error ，保存文件前会增加备份文件  test_dlBK.md 文件。

### 上传

#### 条件

需全局安装Picgo命令行版本 `npm install picgo -g`，使用方法见  https://picgo.github.io/PicGo-Core-Doc/ 相关的仓库为 https://github.com/PicGo/PicGo-Core 

安装后需要配置相关的图床帐号等信息，以便于顺利使用图床，建议用命令行 `picgo u /x/xxx.png` 测试是否可以成功上传。

picgo支持多种图床和各种插件，如果通过插件 picgo-plugin-ftp-uploader 实现上传到FTP服务器(被动模式)

#### 关联

为了减少大小，本工具并没有包含picgo库，所以需要关联全局picgo工具，方法如下

1. 确保可以命令行中可以使用 picgo 命令，并可以上传图片成功
2. 执行 `md-img l` 进行本工具和picgo工具的关联

成功执行后会提示如下

```shell
check picgo installation...
linking picgo...
 link picgo succ
```

#### 命令

 `md-img u markdown文件 `

可通过 `md-img u -h` 来查看具体指令

上传md文件中的本地图片，详细参数如下

  -n, --rename            上传时是否重命名图片文件
  -r, --readonly           上传后不修改md文件中对应的图片链接，如无此参数，修改md文件中的图片链接并进行写入。
  -o, --overwrite          修改md文件中的图片链接时不备份原文件，直接覆盖，如无参数则将备份原文件，原文件名以_upBK结尾。
  -p, --remotepath <path>  图床上需要添加的远程路径，默认为<filename>，表示以文件名命名的路径。 

比如图床上的设置的默认目录为 /images/ ，上传的文件为test.md，此参数为空，则图片将保存到  /images/test/ 目录下。


#### 举例

```shell
md-img u e:\doc\test.md
 uploading [e:\doc\aaaa\l1qlkj5h.png], 1/2
[PicGo INFO]: Before transform
[PicGo INFO]: Transforming... Current transformer is [path]
[PicGo INFO]: Before upload
[PicGo INFO]: beforeUploadPlugins: addpath running
[PicGo INFO]: ctx.log.info
[PicGo INFO]: Uploading... Current uploader is [ftp-uploader]
[PicGo SUCCESS]:
http://github.com/images//test/l1qlkj5h.png
 uploading [e:\doc\aaaa\l1qlkj5j.png], 2/2
[PicGo INFO]: Before transform
[PicGo INFO]: Transforming... Current transformer is [path]
[PicGo INFO]: Before upload
[PicGo INFO]: beforeUploadPlugins: addpath running
[PicGo INFO]: ctx.log.info
[PicGo INFO]: Uploading... Current uploader is [ftp-uploader]
[PicGo SUCCESS]:
http://github.com/images//test/l1qlkj5j.png
 The image links[2] in [e:\doc\test.md] has been updated
```

如果有多个图片上传会进行如上提示，此时会增加备份文件  test_upBK.md 文件

如果网络无法上传会报错，类似

```shell
[PicGo INFO]: Before transform
[PicGo INFO]: Transforming... Current transformer is [path]
[PicGo INFO]: Before upload
[PicGo INFO]: beforeUploadPlugins: addpath running
[PicGo INFO]: ctx.log.info
[PicGo INFO]: Uploading... Current uploader is [ftp-uploader]
[PicGo WARN]: failed
[PicGo ERROR]: Error: read ECONNRESET
    at TCP.onStreamRead (node:internal/stream_base_commons:217:20) {
  errno: -4077,
  code: 'ECONNRESET',
  syscall: 'read'
}
```



### 移动

#### 命令

 `md-img m markdown文件 `

可通过 `md-img m -h` 来查看具体指令

移动md文件中的本地图片到指定目录，详细参数如下

  -l, --local <path> 图片要移动的目标路径，可设置绝对路径或相对路径，必填
  -n, --rename      移动时是否需要重命名图片名，如无此参数将默认用原文件名，使用原文件名时，如果文件名重复，则文件名后将自动添加 **(数字)** ，数字最大为999
  -o, --overwrite   修改md文件中的图片链接时不备份原文件，直接覆盖，如无参数则将备份原文件，原文件名以_mvBK结尾。

#### 举例

```shell
md-img m e:\doc\test.md -l newfolder
Will Move images to localFolder[e:\doc\newfolder]
 [e:\doc\test\l1qlkj5h.png] move to [e:\doc\newfolder\l1qlkj5h.png], 1/3
 [e:\doc\test\l1qlkj5j.png] move to [e:\doc\newfolder\l1qlkj5j.png], 2/3
 [e:\doc\test\l1qlkj5l.png] move to [e:\doc\newfolder\l1qlkj5l.png], 3/3
 The image links[3] in [e:\doc\test.md] has been updated
```

默认会增加备份文件  test_mvBK.md 文件

## 变更记录


### 0.0.1

第一个具备分析，清理，下载，上传，移动图片的版本

### 0.0.2

### 0.0.3

添加相关说明文档

## 仓库地址

https://github.com/pattazl/markdown-image-manage-npm

https://gitee.com/pattazl/markdown-image-manage-npm

**使用愉快!**

