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

    const captureId = `ZW_${Date.now()}`;
    const outputDir = workDir || '.';

    this.on('CAPTURE_PAGE', (viewNo) => {
      console.log('📥\t' + chalk.green('[保存第' + viewNo + '屏]'));
    });
  
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: ["--ignore-certificate-errors", "--no-sandbox"] 
      });
    }
    const page = await this.browser.newPage();
    try {
      await page.setViewport(this._defaultViewport());

      const docTitle = await this._loadDoc(page, docUrl);
      console.log('🔎\t' + chalk.green('[打开文档' + docTitle + ']'));
      console.log('🔪\t' + chalk.green('[展开所有页]'));
      await this._trimDoc(page);
      console.log('✂️\t' + chalk.green('[分屏抓取]'));
      await this._capture(page, captureId, docTitle, outputDir);
      console.log('🎉\t' + chalk.green('[文档抓取完毕]'));
    } catch (e) {
      console.log('💣\t' + chalk.red('[Error] ' + e.message));
    } finally {
      await page.close();
    }
  }

  async stop() {
    await this.browser.close();
  }

  /**
   * 私有: 加载文档
   * @param {Page} page puppeteer page object
   * @param {string} docUrl 文档URL
   */
  async _loadDoc(page, docUrl) {
    await page.goto(
      docUrl,
      {
        timeout: 0, 
        waitUntil: 'networkidle2'
      }
    );
    const docTitle = await page.evaluate('document.title') + '';
    return docTitle.replace(/\s|\-|百度文库/g, '');
  } 

  /**
   * 修剪文档页面
   */
  async _trimDoc(page) {
    // 点击继续阅读
    await page.click('.moreBtn');
    await page.waitForFunction(function() {
      return document.getElementById('doc_bottom_wrap').style.display !== 'none'
    }, { polling: 1000 });
    await page.evaluate(function() {
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
      $('.doc-tag-wrap').remove();
      $('.banner-ad').remove();
      $('#doc_bottom_wrap').remove();
      $('#next_doc_box').remove();

      // 移除右侧边栏，减少推荐文档图标对文档类型解析的干扰
      $('.aside').remove();
      // 从文档标题内容中获取文档类型
      if ($('.ic-pdf').length === 1) {
        window.__DOC_TYPE__ = 'pdf';
      }
      else if ($('.ic-doc').length === 1) {
        window.__DOC_TYPE__ = 'doc';
      }
      else if ($('.ic-txt').length === 1) {
        window.__DOC_TYPE__ = 'txt';
      }
      else if ($('.ic-ppt').length === 1) {
        window.__DOC_TYPE__ = 'ppt';
      }
      else if ($('.ic-xls').length === 1) {
        window.__DOC_TYPE__ = 'xls';
      }
      else {
        window.__DOC_TYPE__ = 'unsupported'
      }
      // 移除文档标题
      $('#doc-header-test').remove();
    });

  }

  /**
   * 私有: 滚屏抓取
   */
  async _capture(page, captureId, docTitle, workDir) {

    // 获取文档类型
    const docType = await page.evaluate('window.__DOC_TYPE__');

    let { pageSelectorPrefix, pageClass, pageLineClass } = ((docType) => {

      if (docType === 'doc' || docType === 'pdf' || docType === 'xls') {
        return { pageSelectorPrefix: '#pageNo-', pageClass: '.reader-page', pageLineClass: '.reader-txt-layer .reader-word-layer' };
      } else if (docType === 'txt') {
        return { pageSelectorPrefix: '#reader-pageNo-', pageClass: '.reader-page-wrap', pageLineClass: '.p-txt' };
      } else if (docType === 'ppt') {
        return { pageSelectorPrefix: '.reader-pageNo-', pageClass: '.ppt-image-wrap', pageLineClass: 'img' };
      } else {
        return null;
      }
    })(docType);

    if (pageSelectorPrefix === null) {
      console.warn('🥺\t' + chalk.yellowBright('暂不支持此类文档'));
      return Promise.resolve();
    }

    // 滚动文档加载页面，并截图
    let viewNo = 1;
    const totalPage = await page.evaluate('$("' + pageClass + '").length');
    while (viewNo <= totalPage) {

      // const session = await page.target().createCDPSession();
      // await session.send('Emulation.setPageScaleFactor', {
      //   pageScaleFactor: 0.5, // 50%
      // });

      // await page.evaluate(function(w) {
      //   if (window.reader && window.reader.reader && window.reader.reader.setZoom) {
      //     window.reader.reader.setZoom(w);
      //   }
      // }, this._defaultViewport().width * 0.92);

      // 滚屏并等待需要加载的内容
      await page.evaluate(function(n, pageSelectorPrefix) {
        window.__SCREEN_SCROLLED__ = false;
        if ($(pageSelectorPrefix + n).length === 1) {
          $('html, body').animate({ 'scrollTop': $(pageSelectorPrefix + n).offset().top, 'scrollLeft': $(pageSelectorPrefix + n).offset().left }, 2000, function() {
            window.__SCREEN_SCROLLED__ = true;
            if (document.body.offsetHeight - (window.innerHeight + window.pageYOffset) <= 2) {
              window.__SCREEN_BOTTOM__ = true;
            }
          });
        } else {
          window.__SCREEN_BOTTOM__ = true;
        }
      }, viewNo, pageSelectorPrefix);

      await page.waitForFunction(function(n, pageSelectorPrefix, pageLineClass) {

        if (window.__SCREEN_BOTTOM__ === true) return true;
        // 检查页：滚动停止且内容加载完成
        var _new_page_selector = pageSelectorPrefix + n;
        var _new_page_loaded_selector = pageSelectorPrefix + n + ' ' + pageLineClass;
        if (window.__DOC_TYPE__ === 'ppt') {
          // 对于ppt一类图片内容，检查图片要素是否完整
          return (window.__SCREEN_SCROLLED__ === true 
            && ($(_new_page_selector).length > 0 && $(_new_page_loaded_selector).attr('src') != ''));
        } else {
          // FIXME: 暂时对于文字类文档加载完成与否，采用一种建议算法：3行且第一行内容不为空
          return (window.__SCREEN_SCROLLED__ === true 
            && ($(_new_page_selector).length > 0 
            // && $(_new_page_selector).data('render') === 1 
            && $(_new_page_loaded_selector).length > 3 && $(_new_page_loaded_selector).get(0).innerText != ''));
        }
      }, { polling: 1000 }, viewNo, pageSelectorPrefix, pageLineClass);

      // 适应页面大小
      const docPageHandle = await page.$(pageSelectorPrefix + viewNo);
      const boundingBox = await docPageHandle.boundingBox();
      const newViewport = {
          width: Math.max(this._defaultViewport().width, Math.ceil(boundingBox.width)),
          //FIXME: 这是一个并不可靠的方式，依据百度文库文档一般都不会大于默认尺寸的假设，此处对viewport的设置选择较小值
          height: Math.min(this._defaultViewport().height, Math.ceil(boundingBox.height)),
      };
      await page.setViewport(Object.assign({}, this._defaultViewport(), newViewport));
      
      await page.waitFor(1000);

      if (docType === 'txt') {
        // txt类型文档直接抓取内容
        const txtContents = await page.evaluate((pageSelector) => {
          return $(pageSelector + ' .p-txt').text();
        }, pageSelectorPrefix + viewNo);
        await this._appendTxt(txtContents, path.join(outputDir, `${docTitle}.txt`));
      } else {
        let viewNoStr = ('' + viewNo).padStart(3, '0')
        await page.screenshot({
          // type: 'jpeg',
          type: 'png',
          // path: path.join(workDir, `${captureId}_${viewNo}.jpeg`)
          path: path.join(workDir, `${captureId}_${viewNoStr}.png`)
        });
      }

      this.emit('CAPTURE_PAGE', viewNo);
      
      viewNo++;

    }

    this.emit('capture_complete', path.resolve(workDir), captureId, docTitle, docType);
  }

  /**
   * 私有: 截取DOM Element
   * FIXME: 存在clip抓取空白bug
   * @param {object} opts 
   */
  async _screenshotDOMElement(page, opts = {}) {
    const padding = 'padding' in opts ? opts.padding : 0;
    const path = 'path' in opts ? opts.path : null;
    const type = 'type' in opts ? opts.type : 'png';
    const selector = opts.selector;

    if (!selector)
        throw Error('Please provide a selector.');

    const rect = await page.evaluate(selector => {
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
    // console.log(chalk.red(JSON.stringify(rect)));

    return await page.screenshot({
      type,
      path,
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      }
    });
  }

  /**
   * 输出文本到文本文件末尾(append)
   * @param {string} text 文本内容
   * @param {string} path 输出文本文件路径
   */
  async _appendTxt(text, path) {
    const awriteFile = util.promisify(fs.appendFile);
    return awriteFile(path, text);
  }

  /**
   * 默认浏览器viewport
   */
  _defaultViewport() {
    return {
      // height: 803,
      width: 744,
      height: 1039,
      // width: 954,
      // height: 1349,
      deviceScaleFactor: 1
    };
  }

}