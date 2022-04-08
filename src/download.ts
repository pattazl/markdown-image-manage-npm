import * as fs from 'fs'
import * as path from 'path'
import downloadCore from "./downloadcore.js";
import {getImages,escapeStringRegexp,logger,
    localCheck,
    mdFile,localFolder,readonly,rename,
    getAutoPath,saveFile} from './common'
// 主要内部变量
//var downThread = 1;

export async function dlCheck(file: string,options:any) 
{
    let folderName = './'+path.parse(file).name+'.assets';
    // 将会地址传递给 mdFile等变量
    if(localCheck(file,options,folderName) )
    {
        console.log(`Will download images of [${mdFile}]\nto localFolder[${localFolder}]`);
        return true;
    };
    return false;
}
export async function download() // ,thread:number
{
    let fileObj = getImages(mdFile);
    let ofile = path.parse(mdFile);
    let fileArr = fileObj.net;
    let content = fileObj.content;
    //downThread = thread;
    // 对网络图片去重，不必每次下载
    let set = new Set(); 
    fileArr.forEach((item)=> set.add(item)); 
    let downArr:string[] = Array.from(set) as string[];
    let count = 0,len = downArr.length;
    for(let file of downArr)
    {
        count++;
        logger.info(`downloading [${file}], ${count}/${len}`);
        let resfile = await downloadCore(file, localFolder,rename);
        let newfile = getAutoPath(ofile.dir,resfile as string);
        // 适配图片的格式
        var reg = new RegExp( '!\\[([^\\]]*)\\]\\('+ escapeStringRegexp(file) +'\\)','ig');
        content =  content.replace(reg,'![$1]('+ newfile +')'); // 内容替换
    }
    if(!readonly) // 需要写入md文件
    {
        saveFile(content,'_localBK');
    }
}