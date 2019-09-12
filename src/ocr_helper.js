import { TesseractWorker } from 'tesseract.js'

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