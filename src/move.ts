import * as fs from 'fs'
import * as path from 'path'
import { getImages,escapeStringRegexp,logger,
    localCheck,mdFile,localFolder,rename,
    newName ,getAutoPath,saveFile,getValidFileName} from './common'
// 主要内部变量
// let mdFile = ''; // 需要处理的文件
// let localFolder = ''; // 新的文件夹
// let overwriteFile = false; // 是否覆盖原先的md文件
// let rename = false; // 是否对所有的图片重新命名
export function mvCheck(file: string, options: any)
{
    // 将会地址传递给 mdFile等变量
    if(localCheck(file,options) )
    {
        console.log(`Will Move images to localFolder[${localFolder}]`)
        return true;
    };
    return false;
}
export async function move() // ,thread:number
{
    let ofile = path.parse(mdFile);
    let fileObj = getImages(mdFile);
    let fileArr = fileObj.local; // 本地文件上传
    let fileMapping = fileObj.mapping; // 本地原始信息
    let content = fileObj.content;
    //downThread = thread;
    // 对网络图片去重，不必每次下载
    let set = new Set(); 
    fileArr.forEach((item)=> set.add(item)); 
    let uniArr:string[] = Array.from(set) as string[];
    let count=0,len = uniArr.length;
    let successCount = 0;
    for(let file of uniArr)
    {
        count++;
        let newFileName = '';
        // 转移到目标路径 
        let imageFile = path.parse(file);
        if(rename)
        {
            //文件重命名
            newFileName = newName()+ imageFile.ext;
        }else{
            // 仅仅更换目录
            newFileName = imageFile.base;
        }
        let newFile = getValidFileName(localFolder,newFileName);
        if( newFile == ''){
            logger.error(`get new image file name[${newFile}] fail!`);
            return;
        }
        logger.info(`[${file}] move to [${newFile}], ${count}/${len}`);
        try{
            fs.renameSync(file,newFile);
            var reg = new RegExp( '!\\[([^\\]]*)\\]\\('+ escapeStringRegexp(fileMapping[file]) +'\\)','ig');
            content =  content.replace(reg,'![$1]('+ getAutoPath(ofile.dir, newFile) +')'); // 内容替换
            successCount++;
        }catch(e)
        {
            logger.error('move error:');
            console.log(e);
        }
    }
    // 需要写入md文件
    saveFile(content,'_mvBK',successCount);
}

