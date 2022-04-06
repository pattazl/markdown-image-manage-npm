import * as fs from 'fs'
import * as path from 'path'

export function getImages(mdFile: string) :{local:string[],net:string[],warn:string[],content:string} {
    var picArrLocal=[];
    var picArrWarn=[];
    var picArrNet=[];
    try {
        var mdfileName = fs.realpathSync(mdFile);
        var mdfilePath = path.dirname(mdFile) //arr.join('/'); // 获取文件路径
        var str = '';
        str = fs.readFileSync(mdfileName).toString();
        // 正则格式
        var reg = /!\[[^\]]*\]\((.*\.png|.*\.jpg|.*\.gif|.*\.jpeg)\)/ig;
        while (reg.exec(str) != null) {
            let filepath: string = RegExp.$1;
            // 首先要判断文件路径，对于http https 路径忽略，对于没有写盘符的路径，加上 targetFile 的路径
            filepath = filepath.trim();
            // 首先要判断文件路径，对于http https 路径忽略，对于没有写盘符的路径，加上 targetFile 的路径
            if (/^http:|https:/.test(filepath)) {
                picArrNet.push(filepath);
            } else {
                var tmpFilePath; //全路径
                tmpFilePath = path.resolve(mdfilePath, filepath); // 支持相对目录和绝对路径
                if (fs.existsSync(tmpFilePath)) {
                    picArrLocal.push(tmpFilePath);
                } else {
                    picArrWarn.push(filepath + ' | not exist');
                }
            }
        }
    } catch (e) {
        console.log(e.message);
    }
    return {local : picArrLocal ,net:picArrNet, warn: picArrWarn,content:str };
}
