import EventEmitter from 'events';
import path from 'path';
import fs from 'fs';
import util from 'util';
import puppeteer from 'puppeteer';
import chalk from 'chalk';

// import { append_all } from './image_helper';

/**
 * 文档抓取功能类，基于EventEmitter，允许事件外部监听
 * 
 */
export default class DocCapture extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * API: 执行抓取
   * @param {string} docUrl 
   * @param {string} workDir 
   */
  async process(docUrl, workDir) {
    this.docUrl = docUrl;
    this.captureId = `ZW_${Date.now()}`;
    this.workDir = workDir || '.';

    this.on('CAPTURE_PAGE', (viewNo) => {
      console.log(chalk.green('[保存第' + viewNo + '屏]'));
    });

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_EXEC_PATH, 
      ignoreHTTPSErrors: true,
      args: ["--ignore-certificate-errors"] 
    });
  
    try {
      this.page = await browser.newPage();
      await this.page.setViewport(this._defaultViewport());

      await this._loadDoc();
      console.log(chalk.green('[打开文档' + this.docTitle + ']'));
      console.log(chalk.green('[展开所有页]'));
      await this._trimDoc();
      console.log(chalk.green('[分屏抓取]'));
      await this._capture();
      console.log(chalk.green('[文档抓取完毕]'));
    } catch (e) {
      console.log(chalk.green('[Error] ' + e.message));
    } finally {
      await browser.close();
    }
  }

  /**
   * 私有: 加载文档
   */
  async _loadDoc() {
    await this.page.goto(
      this.docUrl,
      {
        timeout: 0, 
        waitUntil: 'networkidle2'
      }
    );
    const docTitle = await this.page.evaluate('document.title') + '';
    this.docTitle = docTitle.replace(/\s|\-|百度文库/g, '');
  } 

  /**
   * 修剪文档页面
   */
  async _trimDoc() {
    // 点击继续阅读
    await this.page.click('.moreBtn');
    await this.page.waitForFunction(function() {
      return document.getElementById('doc_bottom_wrap').style.display !== 'none'
    }, { polling: 1000 });
    await this.page.evaluate(function() {
      $('.wk-other-new-cntent').remove();
      $('.fix-searchbar-wrap').remove();
      $('.reader-tools-bar-wrap').remove();
      $('#hd').remove();

      // FIXME: 可能还会有其他浮动广告
      $('.lastcell-dialog').remove();
      $('#docBubble').remove();
      $('#vip-cms-doc-list').remove();
      $('#fc-left').remove();
      $('#shareWrap-1').remove();
      $('.ys-ads-mask').remove();
      $('form').remove();
      $('#html-reader-go-more').remove();

      $('.dialog-container-iframe').remove();
      $('#WkDialogDownDoc').remove();
      $('#BAIDU_DUP_fp_wrapper').remove();
      // $('.tangram-suggestion-main').remove();

      $('#reader-qrcode-tip').remove();
      $('#reader-translate-tip').remove();
      $('#reader-baike-tip').remove();
      $('#tip-gc').remove();
      $('#activity-tg').remove();
      $('#reader-helper-el').remove();
      $('#reader-copy-success-tip').remove();
      $('#reader-wkvideo-card').remove();
      $('#ZeroClipboardMovie_1').parent().remove();
      
      $('#sampling-area').remove();

      $('#ft').remove();
      $('.ft').remove();
      $('.crubms-wrap').remove();
      $('#doc-header-test').remove();
      $('.doc-tag-wrap').remove();
      $('.banner-ad').remove();
      $('#doc_bottom_wrap').remove();
      $('#next_doc_box').remove();
      $('.aside').remove();
      // window.__SCREEN_TOP__ = false;

      // $('html, body').animate({ 'scrollTop': 10 }, 1000, function() {
      //   window.__SCREEN_TOP__ = true;
      // });

    });
    
    // await this.page.waitForFunction(function() {
    //   return window.__SCREEN_TOP__ === true
    // }, { polling: 1000 });

  }

  /**
   * 私有: 滚屏抓取
   */
  async _capture() {

    // 滚动文档加载页面，并截图
    let viewNo = 1;
    const totalPage = await this.page.evaluate('$(".reader-page").length');
    while (viewNo <= totalPage) {

      // const session = await this.page.target().createCDPSession();
      // await session.send('Emulation.setPageScaleFactor', {
      //   pageScaleFactor: 0.5, // 50%
      // });

      // await this.page.evaluate(function(w) {
      //   if (window.reader && window.reader.reader && window.reader.reader.setZoom) {
      //     window.reader.reader.setZoom(w);
      //   }
      // }, this._defaultViewport().width * 0.92);

      // 滚屏并等待需要加载的内容
      await this.page.evaluate(function(n) {
        window.__SCREEN_SCROLLED__ = false;
        // $('html, body').animate({ 'scrollTop': (distance + 15) * n }, 3000, function() {
        if ($('#pageNo-' + n).length === 1) {
          $('html, body').animate({ 'scrollTop': $('#pageNo-' + n).offset().top }, 2000, function() {
            window.__SCREEN_SCROLLED__ = true;
            if (document.body.offsetHeight - (window.innerHeight + window.pageYOffset) <= 2) {
              window.__SCREEN_BOTTOM__ = true;
            }
          });
        } else {
          window.__SCREEN_BOTTOM__ = true;
        }
      }, viewNo);

      await this.page.waitForFunction(function(n) {

        if (window.__SCREEN_BOTTOM__ === true) return true;
        // 检查页：滚动停止且内容加载完成
        var _new_page_selector = '#pageNo-' + n;
        var _new_page_loaded_selector = '#pageNo-' + n + ' .reader-txt-layer .reader-word-layer';
        
        return (window.__SCREEN_SCROLLED__ === true 
          && ($(_new_page_selector).length > 0 && $(_new_page_selector).data('render') === 1 
          && $(_new_page_loaded_selector).length > 3 && $(_new_page_loaded_selector).get(0).innerText != ''));
      }, { polling: 1000 }, viewNo);
      
      await this.page.waitFor(1000);
      
      await this.page.screenshot({
        type: 'jpeg',
        path: path.join(this.workDir, `${this.captureId}_${viewNo}.jpeg`)
      });
      
      // const docPageHandle = await this.page.$('#pageNo-' + viewNo);
      // const boundingBox = await docPageHandle.boundingBox();
      // const newViewport = {
      //     width: Math.max(this._defaultViewport().width, Math.ceil(boundingBox.width)),
      //     height: Math.max(this._defaultViewport().height, Math.ceil(boundingBox.height)),
      // };
      // await this.page.setViewport(Object.assign({}, this._defaultViewport(), newViewport));
        
      // FIXME: 抓取出现空白，一般在最后一页或两页
      // let clipBuff = await this._screenshotDOMElement({
      //   selector: '#pageNo-' + viewNo
      //   // ,
      //   // path: path.join(this.workDir, `${this.captureId}_${viewNo}.jpeg`)
      // });
      // const asyncWriteFile = util.promisify(fs.writeFile);
      // await asyncWriteFile(
      //   path.join(this.workDir, `${this.captureId}_${viewNo}.jpeg`),
      //   clipBuff,
      //   'binary');

      this.emit('CAPTURE_PAGE', viewNo);

      // // FIXME: 检查是否已经滚动到底
      // const scroll_bottom = await this.page.evaluate('window.__SCREEN_BOTTOM__');
      // if (scroll_bottom == true) {
      //   break;
      // }
      
      viewNo++;

    }

    // 合并图片
    // const output = await append_all(this.captureId, this.docTitle, path.resolve(this.workDir));

    this.emit('capture_complete', path.resolve(this.workDir), this.captureId, this.docTitle);

    // return output;
  }

  /**
   * 私有: 截取DOM Element
   * FIXME: 存在clip抓取空白bug
   * @param {object} opts 
   */
  async _screenshotDOMElement(opts = {}) {
    const padding = 'padding' in opts ? opts.padding : 0;
    const path = 'path' in opts ? opts.path : null;
    const selector = opts.selector;

    if (!selector)
        throw Error('Please provide a selector.');

    const rect = await this.page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (!element)
            return null;
        const {x, y, width, height} = element.getBoundingClientRect();

        return {
          left: Math.ceil(x), 
          top: Math.ceil($(element).offset().top), 
          width: Math.ceil(width), 
          height: Math.ceil(height), 
          id: element.id
        };
    }, selector);

    if (!rect)
        throw Error(`Could not find element that matches selector: ${selector}.`);
    console.log(chalk.red(JSON.stringify(rect)));

    return await this.page.screenshot({
      type: 'jpeg',
      // path,
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      }
    });
  }

  /**
   * 默认浏览器viewport
   */
  _defaultViewport() {
    return {
      // height: 803,
      width: 734,
      height: 1039,
      // width: 954,
      // height: 1349,
      deviceScaleFactor: 1
    };
  }

}