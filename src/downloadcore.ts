import * as fs from "fs-extra";
import * as https from "https";
import * as http from "http";
import * as path from "path";
import { URL } from "url";

async function download(url, dest, options) {
  const uri = new URL(url);
  let filename = path.basename(url);
  const pkg = url.toLowerCase().startsWith("https:") ? https : http;
  return await new Promise((resolve, reject) => {
    pkg.get(uri.href, options).on("response", (res) => {
      //console.log("res", res.statusCode, res.headers);
      const len = parseInt(res.headers["content-length"], 10);
      fs.ensureDirSync(dest);
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

export default async (url, dest, options) => {
  try {
    const filePath = await download(url, dest, options);
    console.log(filePath, "filePath");
    return filePath;
  } catch (e) {
    console.log(e);
    return '';
  }
};
