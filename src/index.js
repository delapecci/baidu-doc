#!/usr/bin/env node

/**
 * 百度文库另类抓取法
 * 
 * 讨厌xxx券下载方式
 * 
 * Chris Li
 * 
 */
import 'dotenv/config'
import DocCapture from './doc_capture';
import { bundle_pdf } from './image_helper';

const docUrl = process.argv[2];     // 百度文库文档URL
const outputDir = process.argv[3];  // 输出文档图片路径

// console.log(docUrl);
// console.log(outputDir);

(async () => {
  const docCapture = new DocCapture();
  // Example: 监听抓取完成事件，利用imagemagick生成pdf
  docCapture.on('capture_complete', async (workDir, captureId, docTitle, docType) => {
    if (docType !== 'txt')
      await bundle_pdf(captureId, docTitle, workDir);
  });
  await docCapture.process(
    // 'https://wenku.baidu.com/view/72e9233b4b7302768e9951e79b89680203d86b05.html',
    // 'https://wenku.baidu.com/view/877802720a4e767f5acfa1c7aa00b52acfc79cc8.html',
    docUrl,
    // '/Users/lichong/Temp/baidu_doc'
    outputDir
  );
  // process.exit(0);
})();