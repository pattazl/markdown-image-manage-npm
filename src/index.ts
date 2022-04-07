#!/usr/bin/env node

import { setBracket } from './getImages'
import { cleanMD, analyse } from './clean'
import { download, dlCheck } from './download'
import { Command } from 'commander'
import * as fs from 'fs'

const program = new Command();

// program
//   .version('0.0.1')
//   .description('manage the images of markdown file')
//   .requiredOption('-f, --file <path>', 'the markdown file fullpath')
//   .option('-a, --analyse', 'analyse the images of markdown')
//   .option('-c, --clean', 'remove the images that not used in local folder')
//   .option('-d, --download', 'download all images to local folder')
//   //.option('-t, --thread <num>', 'the thread number of download/upload process,default 3','3') // .default(3)
//   .option('-l, --local <path>', 'the image will store in local folder,absolute path or relative of md file, default is [./markdown file name.assets]')
//   .option('-u, --upload', 'upload images by picgo')

// program.parse(process.argv);
function checkFile(file: string): boolean {
    // md文件路径
    if (!fs.existsSync(file)) {
        console.log(`file[${file}] is not exists!`);
        return false;
    }
    return true;
}
// 全局options
program
    .option('-b, --brackets', 'whether the image path include right brackets')
    .hook('preAction', (thisCommand, actionCommand) => {
        if (thisCommand.opts().brackets) {
            setBracket(true);  // 有图片路径中括号的话，匹配方式要用贪婪匹配
            //   console.log(`About to call action handler for subcommand: ${actionCommand.name()}`);
            //   console.log('arguments: %O', actionCommand.args);
            //   console.log('options: %o', actionCommand.opts());
        }
    });

// 不同命令行
program
    .command('a <file>', { isDefault: true })
    .description('analyse the images of markdown, default command')
    .action((file) => {
        if (!checkFile(file)) return;
        console.log(`Will analyse images in[${file}]`)
        analyse(file);
    });
program
    .command('c  <file>')
    .description('clean and remove the images that not used in local folder')
    .action((file) => {
        if (!checkFile(file)) return;
        console.log(`Will clean images in[${file}]`)
        cleanMD(file);
    });
program
    .command('d  <file>')
    .description('download the images that not used in local folder')
    .option('-l, --local <path>', 'the image will store in local folder,absolute path or relative of md file, default is [./markdown file name.assets]')
    .option('-n, --rename', 'whether rename the image file')
    .option('-r, --readonly', 'Only read the md file, if not set,it will update link and create a new file')
    .option('-o, --overwrite', 'overwrite original md file and not create a new')
    .action((file, options) => {
        if (!checkFile(file)) return;
        if (dlCheck(file, options)) {
            download();
        }
    });
program
    .command('u  <file>')
    .description('upload images by picgo,should global install picgo(npm i picgo -g) and set the config')
    .action((file, options) => {
        if (!checkFile(file)) return;
    });
program.parse();
/*
function main() {
    const options = program.opts();
    console.log(options)
    let file = options.file?.trim(); // md文件路径
    if (!fs.existsSync(file)) {
        console.log(`file[${file}] is not exists!`);
        return;
    }
    // let thread = parseInt( options.thread?.trim() , 10); // md文件路径
    // if( isNaN(thread) )
    // {
    //     console.log(`the thread num [${options.thread}] is invalid!`);
    //     return;
    // }
    // 运行模式 
    if (options.analyse) {
        console.log(`Will analyse images in[${file}]`)
        analyse(file);
    } else if (options.clean) {
        console.log(`Will clean images in[${file}]`)
        cleanMD(file);
    } else if (options.download) {
        if (dlCheck(file, options)) {
            download();
        }
    } else if (options.upload) {
        console.log(`Will upload images in[${file}]`)
        // 'upload'
    }
}
// main();

/*
let arr = process.argv;
let arr = arr.slice(2);  // 开头2个为 node 和  js ，跳过
console.log(arr)
let newArr= [];
let mode = '';
for( let v of arr)
{
    let input = v.trim().toLowerCase();
    if( input == '--clean'|| input == '--c')
    {
        mode = 'clean';
    }else if( input == '--download'|| input == '--d') 
    {
        mode = 'download';
    }else if( input == '--upload'|| input == '--u') 
    {
        mode = 'upload';
    }else{
        newArr.push(v)
    }
}
file = newArr.pop()
*/
