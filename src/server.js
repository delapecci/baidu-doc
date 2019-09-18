#!/usr/bin/env node

/**
 * 百度文库另类抓取法websocket server
 * 
 * Chris Li
 * 
 */
import * as ws from 'ws';
import chalk from 'chalk';
import { EventEmitter } from 'events';

import 'dotenv/config';

import DocCapture from './doc_capture';
import { bundle_pdf } from './image_helper';

class BaiduWenkuCaptureServer extends EventEmitter {
  constructor(opts) {
    super();
    this.opts = {
      port: 8888 // default wss port
    };
    Object.assign(this.opts, {}, opts);
  }

  run() {
    this.wss = new ws.Server({ port: this.opts.port });

    this.wss.on('connection', function connection(ws) {
      
      const docCapture = new DocCapture();
      docCapture.on('capture_complete', async (workDir, captureId, docTitle, docType) => {
        if (docType !== 'txt') {
          // Generate PDF file from screenshots by default
          await bundle_pdf(captureId, docTitle, workDir);
        }
        ws.send('抓取完毕');
      });
      docCapture.on('CAPTURE_PAGE', (n) => {
        ws.send(`抓取第${n}屏`);
      })

      ws.on('message', async function incoming(message) {
        console.log('received: %s', message);
        
        await docCapture.process(
          // 'https://wenku.baidu.com/view/72e9233b4b7302768e9951e79b89680203d86b05.html',
          // 'https://wenku.baidu.com/view/877802720a4e767f5acfa1c7aa00b52acfc79cc8.html',
          message,
          process.env.BDWKC_OUTPUT_DIR
        );
      });
    
      ws.send('已连接，请给出要抓取的百度文库文档URL');
    });

    console.log(chalk.blueBright(`Server is listening at ${this.opts.port}`));
  }

}

(() => {
  const websocketd = new BaiduWenkuCaptureServer({ port: 8888 });
  websocketd.run();
})();