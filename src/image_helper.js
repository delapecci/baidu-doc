import util from 'util';
import path from 'path';
import { exec } from 'child_process';

export async function append_all(docTag, docTitle, workDirPath) {
  const images = path.resolve(workDirPath, `${docTag}_*.png`);
  const outputImage = path.resolve(workDirPath, `${docTitle}.png`);
  const aexec = util.promisify(exec);
  const { stderr } = await aexec(`convert ${images} -append ${outputImage}`);
  if (stderr) {
    throw new Error(stderr);
  }
  return outputImage;
}
