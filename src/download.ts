import * as fs from 'fs'
import * as path from 'path'
import downloadCore from "./downloadcore.js";
import {getImages} from './getImages'
//var downThread = 1;
var localFolder = ''; 
var fileArr = [];

// 伪装成浏览器
const headers = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36" };
const options = { strictSSL: false, headers };
// 同步下载方法封装

export async function download(  file: string,folder: string) // ,thread:number
{
    let fileObj = getImages(file);
    fileArr = fileObj.net;
    localFolder = folder;
    //downThread = thread;
    // 对网络图片去重，不必每次下载
    let set = new Set(); 
    fileArr.forEach((item)=> set.add(item)); 
    let downArr = Array.from(set); 
    for(let file of downArr)
    {
        let newfile = await downloadCore(file, localFolder, options);
        console.log('main',newfile);
        if( newfile !='' )
        {
            // 尽可能转换为相对路径
        }
    }
    
}
