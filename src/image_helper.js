import util from 'util';
import path from 'path';
import { exec } from 'child_process';

/**
 * 基于imagemagick垂直合并图片，要求多张图片文件有相同的文件名前缀且在同一目录下
 * @param {string} fileTag 图片文件名前缀
 * @param {string} fileTitle 合成后图片文件名称
 * @param {string} workDirPath 图片文件路径
 * @returns {string} 合成后图片文件绝对路径
 */
export async function append_all(imageTag, outputImageTitle, workDirPath) {
  const images = path.resolve(workDirPath, `${imageTag}_*.{png,jpeg}`);
  const outputImage = path.resolve(workDirPath, `${outputImageTitle}.png`);
  const aexec = util.promisify(exec);
  const { stderr } = await aexec(`convert ${images} -append ${outputImage}`);
  if (stderr) {
    throw new Error(stderr);
  }
  return outputImage;
}

export async function bundle_pdf(imageTag, pdfTitle, workDirPath) {
  const aexec = util.promisify(exec);
  const images = path.resolve(workDirPath, `${imageTag}_*.{png,jpeg}`);
  const outputImage = path.resolve(workDirPath, `${pdfTitle}.pdf`);
  const { stderr } = await aexec(`convert "${images}" -quality 20 ${outputImage}`);
  if (stderr) {
    throw new Error(stderr);
  }
  return outputImage;
}
