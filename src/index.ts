#!/usr/bin/env node

import {cleanMD , analyse} from './clean'
import {download} from './download'
import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'

const program = new Command();

program
  .version('0.0.1')
  .description('manage the images of markdown file')
  .requiredOption('-f, --file <path>', 'the markdown file fullpath')
  .option('-a, --analyse', 'analyse the images of markdown')
  .option('-c, --clean', 'remove the images that not used in local folder')
  .option('-d, --download', 'download all images to local folder')
  //.option('-t, --thread <num>', 'the thread number of download/upload process,default 3','3') // .default(3)
  .option('-l, --local <path>', 'the image will store in local folder,absolute path or relative of md file, default is [./markdown file name.assets]')
  .option('-u, --upload', 'upload images by picgo')
  
program.parse(process.argv);
/*
function mySum(value, total) {
    return total + parseInt(value);
  }
program
  .command('a <file>')
  .description('analyse the images of markdown')
  .action((file) => {
    console.log(`analyse ${file}`);
  });
program
  .command('c  <file>')
  .description('remove the images that not used in local folder')
  .action((file) => {
    console.log(`clean is ${file}`);
  });
program
  .command('d  <file>')
  .description('download the images that not used in local folder')
  .option('-l, --local <path>', 'the image will store in local folder')
  .action((file,options) => {
    console.log(options)
    console.log(`download is ${file}`);
  });  
program
  .command('sum')
  .argument('<value...>', 'values to be summed', mySum, 0)
  .action((total) => {
    console.log(`sum is ${total}`);
  });

program.parse();
*/
function main()
{
    const options = program.opts();
    console.log(options)
    let file = options.file?.trim(); // md文件路径
    if(!fs.existsSync(file))
    {
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
    if (options.analyse) 
    {
        console.log(`Will analyse images in[${file}]`)
        analyse(file);
    }else if (options.clean) 
    {
        console.log(`Will clean images in[${file}]`)
        cleanMD(file);
    }else if (options.download) 
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
                return;
            }
        }
        console.log(`Will download images of [${file}]\nto localFolder[${targetFolder}]`)
        download(file,targetFolder);
    }else if (options.upload) 
    {
        console.log(`Will upload images in[${file}]`)
        // 'upload'
    }
}
main();

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
