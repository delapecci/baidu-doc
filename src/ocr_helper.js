import { TesseractWorker } from 'tesseract.js'

/**
 * 基于tesseract.js识别图片内文字函数
 * @param {string} imageFilePath 
 * @return {Promise<string>} 识别结果文本
 */
export async function recognize(imageFilePath) {
  const tessWorker = new TesseractWorker()
  return new Promise((resolve, reject) => {
    tessWorker.recognize(docImgFilePath, 'eng+chi_sim')
    .progress((info) => {
      console.log(info)
    })
    .catch(err => reject(err))
    .then(data => {
      resolve(data.text)
    })
  })
}