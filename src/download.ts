import * as fs from 'fs'
import * as path from 'path'
import downloadCore from "./downloadcore.js";
import {getImages} from './getImages'
// 主要内部变量
//var downThread = 1;
let mdFile = ''; // 需要处理的文件
let localFolder = ''; // 目标文件夹
let readonly = false ; // 是否只读，默认会写入新文件
let overwriteFile = false; // 是否覆盖原先的md文件
let rename = false; // 是否下载的图片重新命名

export async function dlCheck(  file: string,options:any) 
{
    let folderName = './'+path.parse(file).name+'.assets';
    let parentPath = path.dirname(file);
    let targetFolder = ''; // 目标保存
    if(options.local==null)
    {
        // 判断是否存在
        targetFolder = path.resolve(parentPath,folderName);
    }else{
        targetFolder = path.resolve(parentPath,options.local.trim());
    }
    if(!fs.existsSync( targetFolder ))
    {
        console.log(`local Folder[${targetFolder}] is not exists, will create`)
        try{
            fs.mkdirSync(targetFolder)
        }catch(e){
            console.log(`create [${targetFolder}] fail!!!`)
            return false;
        }
    }
    console.log(`Will download images of [${file}]\nto localFolder[${targetFolder}]`)
    // 模块内部变量赋值
    if(options.readonly)
    {
        readonly = true;
    }
    if(options.overwrite)
    {
        overwriteFile = true;
    }
    if(options.rename)
    {
        rename = true;
    }
    localFolder = targetFolder;
    mdFile = file;
    return true;
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
    for(let file of downArr)
    {
        let resfile = await downloadCore(file, localFolder,rename);
        let newfile =  resfile as string;
        // 如果无需到上级目录，则转换为相对路径
        let relativeFile = path.relative(ofile.dir,newfile)
        if( relativeFile.indexOf('..\\') == -1 )
        {
            newfile = relativeFile;
        }
        // 适配图片的格式
        var reg = new RegExp( '!\\[([^\\]]*)\\]\\('+ escapeStringRegexp(file) +'\\)','ig');
        content =  content.replace(reg,'![$1]('+ newfile +')'); // 内容替换
    }
    if(!readonly) // 需要写入md文件
    {
        let filename = mdFile;
        if(!overwriteFile)
        {
            filename = path.join(ofile.dir,ofile.name+'_localImage'+ofile.ext);
        }
        fs.writeFileSync(filename,content);
        console.log(`The image link in [${filename}] has updated`);
    }
}

 function escapeStringRegexp(string) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}
	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	return string
		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
		.replace(/-/g, '\\x2d');
}