#!/usr/bin/env node

/**
 * 百度文库另类抓取法
 * 
 * 讨厌xxx券下载方式
 * 
 * Chris Li
 * 
 */
import 'dotenv/config';
import { prompt } from 'inquirer';
import chalk from 'chalk';
import DocCapture from './doc_capture';
import { bundle_pdf } from './image_helper';

const prompts = [
  {
    type : 'input',
    name : 'docUrl',
    message : '📍\t想抓哪个...'
  },
  {
    type : 'input',
    name : 'outputDir',
    message : '🗂\t想保存在哪儿...'
  },
  {
    type : 'confirm',
    name : 'convertPdf',
    message : '📑\t要不要合成PDF(txt类型文档无法合成)...',
    default: false
  }
];

prompt(prompts)
  .then(async (answers) => {
    const docCapture = new DocCapture();
    // Example: 监听抓取完成事件，利用imagemagick生成pdf
    docCapture.on('capture_complete', async (workDir, captureId, docTitle, docType) => {
      if (docType !== 'txt' && answers.convertPdf === true) {
        await bundle_pdf(captureId, docTitle, workDir);
        console.log('🎉\t' + chalk.green('[PDF文档合成完毕]'));
      }
    });
    await docCapture.process(
      // 'https://wenku.baidu.com/view/72e9233b4b7302768e9951e79b89680203d86b05.html',
      // 'https://wenku.baidu.com/view/877802720a4e767f5acfa1c7aa00b52acfc79cc8.html',
      answers.docUrl,
      // '/Users/lichong/Temp/baidu_doc'
      answers.outputDir
    );
  });
