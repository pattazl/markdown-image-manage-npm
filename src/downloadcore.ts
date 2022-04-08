import * as fs from "fs-extra";
import * as https from "https";
import * as http from "http";
import * as path from "path";
import { URL } from "url";
import { logger,newName} from './common'
// 伪装成浏览器
const headers = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36" };
const options = { strictSSL: false, headers };
// 同步下载方法封装
let rename = false;
async function download(url, dest, options) {
  const uri = new URL(url);
  let filename = path.basename(url); // 获取基本的文件名
  const pkg = url.toLowerCase().startsWith("https:") ? https : http;
  return await new Promise((resolve, reject) => {
    pkg.get(uri.href, options).on("response", (res) => {
      //console.log("res", res.statusCode, res.headers);
      const len = parseInt(res.headers["content-length"], 10);
      fs.ensureDirSync(dest);
      if(rename)
      {
        filename =  newName()+path.extname(filename); // 36 进制
      }
      let filePath = path.join(dest, filename);      
      while (fs.existsSync(filePath)) // 同名文件数量最多1000
      {
        // 如果存在，则需要改名,格式为 文件名(数字递增).后缀 返回最新的文件名
        let f = path.parse(filePath);
        var re = /\((\d+)\)$/;
        if (re.test(f.name)) {
          let num = parseInt(RegExp.$1, 10);
          if (num > 999) {
            reject(`file num[${num}] >999`);
            return;
          }
          let newName = f.name.replace(re, '(' + (++num) + ')') + f.ext;
          filePath = path.join(dest, newName);
        } else {
          let newName = f.name + '(1)' + f.ext; // 重复时初始化的文件
          filePath = path.join(dest, newName);
        }
      }
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(filePath);
        let num = 0;
        res
          .on("data", (chunk) => {
            num = chunk.length + num;
            //console.log(chunk.length, num, chunk);
          })
          .on("end", () => {
            resolve(filePath);
          })
          .on("error", (err) => {
            reject(err);
          })
          .pipe(file);
      } else if (res.statusCode === 302 || res.statusCode === 301) {
        // Recursively follow redirects, only a 200 will resolve.
        download(res.headers.location, dest, options).then((val) =>
          resolve(val)
        );
      } else {
        reject({
          code: res.statusCode,
          message: res.statusMessage,
        });
      }
    });
  });
}

export default async (url, dest,re) => {
  try {
    rename = re;
    const filePath = await download(url, dest, options);
    logger.success(filePath, "is downloaded");
    return filePath;
  } catch (e) {
    logger.error('download error:');
    console.log(e);
    return '';
  }
};
