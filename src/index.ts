#!/usr/bin/env node

import { setBracket,logger,mdCheck } from './common'
import { cleanMD, analyze } from './clean'
import { download, dlCheck } from './download'
import { upload, upCheck,linkPicgo } from './upload'
import { move, mvCheck } from './move'
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
// 全局options
program
    .version('0.0.4')
    .description('manage the images of markdown file')
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
    .description('analyze the images of markdown, default command')
    .action((file) => {
        if (!mdCheck(file)) return;
        logger.info(`Will analyze images in[${file}]`)
        analyze(file);
    });
program
    .command('c  <file>')
    .description('clean and remove the images(png,jpg,gif,ico...) that not used in local folder')
    .action((file) => {
        if (!mdCheck(file)) return;
        logger.info(`Will clean images in[${file}]`)
        cleanMD(file);
    });
program
    .command('d  <file>')
    .description('download the images that not used in local folder,<filename> is md file\'name ')
    .option('-l, --local <path>', `local folder which the images will save,support absolute or relative path.`,'<filename>.assets')
    .option('-n, --rename', 'whether rename the image file')
    .option('-r, --readonly', 'Only read the md file, if not set,it will update link and create backup file')
    .option('-o, --overwrite', 'overwrite original md file and not create backup file')
    .action((file, options) => {
        if (dlCheck(file, options)) {
            download();
        }
    });
program
    .command('u  <file>')
    .description('upload images by picgo,should global install picgo(npm i picgo -g) and set the config,<filename> is md file\'name ')
    .option('-n, --rename', 'whether rename the image file')
    .option('-r, --readonly', 'Only read the md file, if not set,it will update link and create backup file')
    .option('-o, --overwrite', 'overwrite original md file and not create backup file')
    //.option('-d, --direct', 'direct upload image file, not add the mdfile name in path')
    // path be added at begin, default is md file's name (default: "")
    .option('-p, --remotepath <path>', `which be added at beginning of PicBed path.
It is used for separate the images.`,'<filename>')
    .action((file, options) => {
        if(upCheck(file, options)){
            upload();
        };
    });
program
    .command('m  <file>')
    .description('move local images to another folder')
    .requiredOption('-l, --local <path>', 'local folder which the images will move to,support absolute or relative path.')
    .option('-n, --rename', 'whether rename the image file')
    .option('-o, --overwrite', 'overwrite original md file and not create backup file')
    .action((file, options) => {
        if(mvCheck(file, options)){
            move();
        };
    });
// 可以用 package.josn 的 script 中增加 "postinstall":"npm link picgo" 实现，但是用户体验不好
program
    .command('l')
    .description('link the global picgo')
    .action((file, options) => {
        linkPicgo();
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
