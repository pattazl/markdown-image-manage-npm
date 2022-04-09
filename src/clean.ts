import * as fs from 'fs'
import * as path from 'path'
import {getImages,logger} from './common'

const removeFolder = 'md-img-remove'; // 文件名重命名前缀
const extArr = ['.png','.jpg','.bmp','.gif','.jpeg','.ico','.tga','.rle','.tif','.cur','.ani','.iff']; // 支持的图片格式

export function cleanMD(mdFile:string)
{
    try{
        var mdfileName = fs.realpathSync(mdFile);
        var obj = getImages(mdfileName);
        logger.info(`----local images total[${obj.local.length}]----`)
        console.log(`${obj.local.join('\n')}`)
        logger.info(`----net images total[${obj.net.length}]----`)
        console.log(`${obj.net.join('\n')}`)
        doFile( obj.local );
    }catch(e)
    {
        console.log(e.message);
    }
}
export function analyze(mdFile:string)
{
    try{
        var mdfileName = fs.realpathSync(mdFile);
        var obj = getImages(mdfileName);
        logger.info(`----local images total[${obj.local.length}]----`)
        console.log(`${obj.local.join('\n')}`)
        logger.info(`----net images total[${obj.net.length}]----`)
        console.log(`${obj.net.join('\n')}`)
    }catch(e)
    {
        console.log(e.message);
    }
}
function doFile(picArr)
{
    if(picArr.length == 0)return;
    // 必须要每个文件的文件夹一样，这样可以确定为是同一个文件夹
    var parentPath= '';
    var mdFile = [];
    for(var i=0;i<picArr.length;i++)
    {
        var currpath = path.dirname(picArr[i]);
        if(parentPath ==''){ parentPath = currpath;}
        if( parentPath != currpath )
        {
            logger.error('local image path is diff, must be the same!'); // 图片文件夹不一样！
            return;
        }
        mdFile.push(path.basename(picArr[i]))
    }
    // 循环走文件，如果是图片，但是不在 mdFile 中，则进行处理
    var removeArr = [];
    // 获取 prePath 目录下所有文件
    fs.readdirSync(parentPath).forEach(function (name) {
        var filePath = path.join(parentPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            var orifile = name.toLowerCase();
            var extName = path.extname(orifile);
            if( extArr.indexOf(extName) >-1 ) // 必须是图片
            {
                if (mdFile.indexOf( orifile ) == -1)
                {
                // 之前没有改名过
                    let removed = path.join(parentPath, removeFolder);
                    if(!fs.existsSync(removed))
                    {
                        fs.mkdirSync(removed)
                    }
                    // 移动目录
                    fs.renameSync(filePath, path.join(removed, name) );
                    removeArr.push( orifile );
                }
            }
        } else if (stat.isDirectory()) {
        }
    });
    logger.info(`----removed images total[${removeArr.length}] to [${removeFolder}]----\n${removeArr.join('\n')}`)
}
