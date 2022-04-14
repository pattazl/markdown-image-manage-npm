import * as fs from 'fs'
import * as path from 'path'
import * as dayjs from 'dayjs';
// import * as chalk from 'chalk' 可以不必用chalk 库

let imagePathBracket = false; // 文件名中包含括号
export function setBracket(b: boolean) {
    imagePathBracket = b;
}
export function getImages(mdFile: string): { local: string[], net: string[], mapping: {}, content: string } {
    var picArrLocal = [];
    var oriMapping = {};
    var picArrWarn = [];
    var picArrNet = [];
    try {
        var mdfileName = fs.realpathSync(mdFile);
        var mdfilePath = path.dirname(mdFile) //arr.join('/'); // 获取文件路径
        var str = '';
        str = fs.readFileSync(mdfileName).toString();
        // 正则格式
        // var reg = /!\[[^\]]*\]\((.*\.png|.*\.jpg|.*\.gif|.*\.jpeg)\)/ig;
        var reg;
        if (imagePathBracket) {
            reg = /!\[[^\]]*\]\((.*)\)/g; // 适配所有格式的图片,贪婪匹配可能多个连续的图片被包含
        } else {
            reg = /!\[[^\]]*\]\((.*?)\)/g; // 图片路径中没括号，非贪婪匹配
        }
        //const pattern = /!\[(.*?)\]\((.*?)\)/gm // 匹配图片正则
        // const imgList = str.match(pattern) || [] // ![img](http://hello.com/image.png)
        while (reg.exec(str) != null) {
            let oriFlepath: string = RegExp.$1;
            // 首先要判断文件路径，对于http https 路径忽略，对于没有写盘符的路径，加上 targetFile 的路径
            let filepath = oriFlepath.trim();
            // 首先要判断文件路径，对于http https 路径忽略，对于没有写盘符的路径，加上 targetFile 的路径
            if (/^http:|https:/.test(filepath)) {
                picArrNet.push(filepath);
            } else {
                var tmpFilePath; //全路径
                tmpFilePath = path.resolve(mdfilePath, filepath); // 支持相对目录和绝对路径
                if (fs.existsSync(tmpFilePath)) {
                    picArrLocal.push(tmpFilePath);
                    oriMapping[tmpFilePath] = oriFlepath; // 原始的本地路径地址
                } else {
                    picArrWarn.push(filepath + ' | not exist');
                }
            }
        }
    } catch (e) {
        console.log(e.message);
    }
    if(picArrWarn.length>0)
    {
        logger.error(`----error message total[${picArrWarn.length}]----`)
        console.log(`${picArrWarn.join('\n')}`)
    }
    return { local: picArrLocal, net: picArrNet, mapping: oriMapping, content: str };
}
export function escapeStringRegexp(string) {
    if (typeof string !== 'string') {
        throw new TypeError('Expected a string');
    }
    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
    return string
        .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        .replace(/-/g, '\\x2d');
}
// 常用控制台颜色清单
const colorDict =
{
    'reset': '\x1B[0m', // 复位
    'bright': '\x1B[1m', // 亮色
    'grey': '\x1B[2m', // 灰色
    'italic': '\x1B[3m', // 斜体
    'underline': '\x1B[4m', // 下划线
    'reverse': '\x1B[7m', // 反向
    'hidden': '\x1B[8m', // 隐藏
    'black': '\x1B[30m', // 黑色
    'red': '\x1B[31m', // 红色
    'green': '\x1B[32m', // 绿色
    'yellow': '\x1B[33m', // 黄色
    'blue': '\x1B[34m', // 蓝色
    'magenta': '\x1B[35m', // 品红 // purple
    'cyan': '\x1B[36m', // 青色
    'white': '\x1B[37m', // 白色
    'blackBG': '\x1B[40m', // 背景色为黑色
    'redBG': '\x1B[41m', // 背景色为红色
    'greenBG': '\x1B[42m', // 背景色为绿色
    'yellowBG': '\x1B[43m', // 背景色为黄色
    'blueBG': '\x1B[44m', // 背景色为蓝色
    'magentaBG': '\x1B[45m', // 背景色为品红
    'cyanBG': '\x1B[46m', // 背景色为青色
    'whiteBG': '\x1B[47m' // 背景色为白色
}
export let logger = {
    warn: function (...msg) {
        //console.log( chalk.yellow(...msg))
        console.log(colorDict.yellow, ...msg, colorDict.reset)
    },
    success: function (...msg) {
        //console.log( chalk.green(...msg))
        console.log(colorDict.green, ...msg, colorDict.reset)
    },
    error: function (...msg) {
        //console.log( chalk.red(...msg))
        console.log(colorDict.red, ...msg, colorDict.reset)
    },
    info: function (...msg) {
        //console.log( chalk.blue(...msg))
        console.log(colorDict.cyan, ...msg, colorDict.reset)
    },
};

// 本地文件的通用检查 , 检查后导出相关变量
export let mdFile = ''; // 需要处理的文件
export let localFolder = ''; // 目标文件夹
export let readonly = false; // 是否只读，默认会写入新文件
export let overwriteFile = false; // 是否覆盖原先的md文件
export let rename = false; // 是否下载的图片重新命名

export function mdCheck(file: string): boolean {
    // md文件路径
    if (!fs.existsSync(file)) {
        logger.error(`file[${file}] is not exists!`);
        return false;
    }else{
        var stat = fs.statSync(file);
        if (!stat.isFile()) {
            logger.error(`[${file}] is not file!!!`)
            return false;
        }
    }
    mdFile = file ; // 内部对象赋值，多个模块共用
    return true;
}
// 有本地lcoal路径的检查程序
export function localCheck(file: string, options: any) {
    if(!mdCheck(file))return false;
    let parentPath = path.dirname(file);
    // 目标保存
    let targetFolder = path.resolve(parentPath, convertPath(options.local?.trim()||''));

    if (!fs.existsSync(targetFolder)) {
        logger.info(`local Folder[${targetFolder}] is not exists, will create`)
        try {
            fs.mkdirSync(targetFolder)
        } catch (e) {
            logger.error(`create [${targetFolder}] fail!!!`)

            return false;
        }
    } else {
        var stat = fs.statSync(targetFolder);
        if (!stat.isDirectory()) {
            logger.error(`[${targetFolder}] is not directory!!!`)
            return false;
        }
    }
    // 模块内部变量结构赋值
    ({ readonly, overwriteFile, rename } = getOpt(options));
    localFolder = targetFolder;
    return true;
}
// 简单参数option的统一赋值
export function getOpt(options) {
    let readonly = (options.readonly!=null);
    let overwriteFile = (options.overwriteFile!=null);
    let rename = (options.rename!=null);
    return { readonly, overwriteFile, rename }; // 返回
}
// 重新命名新文件名
export function newName() {
    let num = Math.random().toString().slice(2,4);// 增加2位随机数防止时间冲突
    return new Date().getTime().toString(36) + num;
}
// 转换为相对路径,第一个参数为相对路径，第二个为新的文件全路径
export function getAutoPath(dir: string, newfile: string) {
    let relativeFile = path.relative(dir, newfile)
    if (relativeFile.indexOf('..\\') == -1) {
        newfile = relativeFile;
    }
    return newfile;
}
// 备份
export function saveFile(content:string,suffix:string,count:number) {
    if(count==0)
    {
        logger.info(`There are no link changed in [${mdFile}],skip save !`);
        return;
    }
    let ofile = path.parse(mdFile);
    if (!overwriteFile) {
        let newFilename = path.join(ofile.dir, ofile.name + suffix + ofile.ext);
        fs.copyFileSync(mdFile, newFilename); // 原文件备份
    }
    fs.writeFileSync(mdFile, content);
    logger.success(`The image links[${count}] in [${mdFile}] has been updated`);
}
// 输入需要写入的文件名，如果发现重复，增加(序号) ，序号最大999 ，如果成功返回真实路径，否则返回空字符串
export function getAntiSameFileName(dest: string, filename: string): string {
    let filePath = path.join(dest, filename);
    while (fs.existsSync(filePath)) // 同名文件数量最多1000
    {
        // 如果存在，则需要改名,格式为 文件名(数字递增).后缀 返回最新的文件名
        let f = path.parse(filePath);
        var re = /\((\d+)\)$/;
        if (re.test(f.name)) {
            let num = parseInt(RegExp.$1, 10);
            if (num > 999) {
                logger.error(`file num[${num}] >999`);
                return '';
            }
            let newName = f.name.replace(re, '(' + (++num) + ')') + f.ext;
            filePath = path.join(dest, newName);
        } else {
            let newName = f.name + '(1)' + f.ext; // 重复时初始化的文件
            filePath = path.join(dest, newName);
        }
    }
    return filePath;
}
// 识别 <filename> 路径
export function convertPath(p:string):string
{
    if(mdFile == '')
    {
        return '';
    }
    let oMdFile = path.parse(mdFile);
    // return  p.replace(/<filename>/ig,oMdFile.name);
    let date = dayjs(new Date());
    return p.replace(/<filename>/ig, oMdFile.name)
    .replace(/<(.+?)>/ig,function(a,b)  // 支持各种日期格式字符串
    {
        return ( date.format(b));
    });
}