# markdown-image-manage

[TOC]

 "markdown-image-manage" is a tool for manage the images of markdown file .

Most of the images in the markdown file (MD file)  are linked as resource. This tool is used to manage these resources, excluding the image used in Base 64 .
Manage the image resource in the file by command line , you can clean up, move, download and upload the images in the MD file, and modify the MD file's image links at the same time


## Feature

Functions as following :


1. Analysis: analyze the resource images in the MD file, list the network and local , and alarm if the local does not exist

2. Clean up: Check all the images in the directory where the MD file's local images are located . If they are not linked in the MD file, they will be moved to the "md-img-remove" directory

3. Download: Download all network images in the MD file to the defined directory

4. Upload: Automatically upload all local images in the MD file to the PicBed through picgo tool

5. Move: move all local images in the MD file to the defined directory

## Requirements

1. need global install picgo tool when upload image
2. command usage base on commander.js 

## Install

Should be installed with node.js >= 12.

As a tool, suggest global install

`npm i markdown-image-manage -g` 

You should global install picgo tool if you want upload pictures to PicBed or FTP Server

## Usage

show help

`md-img -h` 

You should add parameter -b if the image links include the right bracket

It will show as below if the local image not exist

```shell
 ----error message total[3]----
d:\image1.png | not exist
d:\image2.png| not exist
d:\image3.png | not exist
```

Maybe the image link include right bracket, suggest you add -b and try again，  `md-img -b a mdFilePath`

This tool have some command and functions as below

### Analyze

#### CLI

`md-img a markdownFilePath`

List the network images , local images, invalid local images in the MD file

#### Example

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

### Clean

#### CLI

`md-img c markdownFilePath `

Check all pictures in the local picture folder of MD file and remove the pictures that do not belong to this MD file

support local picture files suffix include  '.png','.jpg','.bmp','.gif','.jpeg','.ico','.tga','.rle','.tif','.cur','.ani','.iff'

1. All local pictures in markdown should to be in the same directory, because this directory will be cleaned up
2. Move the pictures not referenced in the MD file to the sub-directory( named md-img-remove ) in the picture directory
3. The same as  **analyze**  command , it will list the pictures and the cleaned files
4. If the local pictures are in different directory, it is recommended to use the  **move** command of this tool to clean them up

#### Example

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

The test1.png  and test2.png pictures will be moved to folder e:\doc\aaaa\md-img-remove

### Download

#### CLI

 `md-img d markdownFilePath `

 show help  `md-img d -h` 

Download the network image in MD file, it will only download once when the image's URL is the same.

If the download filename is the same, it will be named with **(number)** suffix, the max of number is 999 , the backup file is named with **_dlBK** suffix

```shell
  -l, --local <path>  local folder which the images will save,support absolute or relative path.
                      default is [./markdown file name.assets]
  -n, --rename        whether rename the image file
  -r, --readonly      Only read the md file, if not set,it will update link and create backup file
  -o, --overwrite     overwrite original md file and not create backup file
```

#### Example

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

Download all network pictures into the folder named test.assets，it will show  download error  when can't download.

Update the link in test.md , create the backup file named test_dlBK.md

### Upload

#### Requirement

Global install picgo cli tool first

`npm install picgo -g`

Picgo's introduction in  https://picgo.github.io/PicGo-Core-Doc/  and  https://github.com/PicGo/PicGo-Core 

After install Picgo , you should set the PicBed's account, and could use cli `picgo u /x/xxx.png` for test upload images

Picgo support several PicBed and  FTP server by plugin.

#### Link

This tool haven't packed the picgo library for small size, and should link the global Picgo tool, the step as below:

1. Make sure you can use the **picgo** in cli ,and can upload images sucessfully
2. exec `md-img l` in cli ,  make the link to Picgo

It will show as below if successful link 

```shell
check picgo installation...
linking picgo...
 link picgo succ
```

#### CLI

 `md-img u markdownFilePath `

show help `md-img u -h` 

The backup file is named with **_upBK** suffix

```shell
Options:
  -n, --rename             whether rename the image file
  -r, --readonly           Only read the md file, if not set,it will update link and create backup file
  -o, --overwrite          overwrite original md file and not create backup file
  -p, --remotepath <path>  which be added at beginning of PicBed path, default is empty.
                           When empty, it will add with md file name.
                           When '/' or \ it will not add anymore.
                           It is used for separate the images by md file name. (default: "")
```

#### Example

It show as below when upload images ,and it will create the backup file named test_upBK.md

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

If can not upload , it will show as below

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

### Move

#### CLI

 `md-img m markdownFilePath `

show help `md-img m -h` 

Move the local pictures in MD file to another local folder which you want

If the moved filename is the same, it will be named with **(number)** suffix, the max of number is 999 , the backup file is named with **_mvBK** suffix

```shell
  -l, --local <path>  local folder which the images will move to,support absolute or relative path.
  -n, --rename        whether rename the image file
  -o, --overwrite     overwrite original md file and not create backup file
```

#### Example

```shell
md-img m e:\doc\test.md -l newfolder
Will Move images to localFolder[e:\doc\newfolder]
 [e:\doc\test\l1qlkj5h.png] move to [e:\doc\newfolder\l1qlkj5h.png], 1/3
 [e:\doc\test\l1qlkj5j.png] move to [e:\doc\newfolder\l1qlkj5j.png], 2/3
 [e:\doc\test\l1qlkj5l.png] move to [e:\doc\newfolder\l1qlkj5l.png], 3/3
 The image links[3] in [e:\doc\test.md] has been updated
```

It will create the backup file named  test_mvBK.md 


## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial trial release of markdown-image-manage tool

### 0.0.2

### 0.0.3

Modify documents

## Repository

https://github.com/pattazl/markdown-image-manage-npm

https://gitee.com/pattazl/markdown-image-manage-npm

**Enjoy!**
