#!/usr/bin/env node

/**
 * 百度文库另类抓取法websocket server
 * 
 * Chris Li
 * 
 */
import DocCapture from './doc_capture';
import { bundle_pdf } from './image_helper';

process.stdin.setEncoding('utf8');

process.stdin.on('readable', async () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    const docCapture = new DocCapture();
    // Example: 监听抓取完成事件，利用imagemagick生成pdf
    docCapture.on('capture_complete', async (workDir, captureId, docTitle, docType) => {
      if (docType !== 'txt')
        // Generate PDF file from screenshots by default
        await bundle_pdf(captureId, docTitle, workDir);
    });
    await docCapture.process(
      // 'https://wenku.baidu.com/view/72e9233b4b7302768e9951e79b89680203d86b05.html',
      // 'https://wenku.baidu.com/view/877802720a4e767f5acfa1c7aa00b52acfc79cc8.html',
      chunk,
      process.env.BDWKC_OUTPUT_DIR
    );
    // process.stdout.write('data: ' + chunk);
  }
});
