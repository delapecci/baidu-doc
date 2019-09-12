#!/usr/bin/env node

import 'dotenv/config'
import DocCapture from './doc_capture';

// const userCredentials = { firstname: 'Robin' };
// const userDetails = { nationality: 'German' };

// const user = {
//   ...userCredentials,
//   ...userDetails,
// };

// console.log(user);

// console.log(process.env.SOME_ENV_VARIABLE);

(async () => {
  const docCapture = new DocCapture();
  await docCapture.process(
    // 'https://wenku.baidu.com/view/72e9233b4b7302768e9951e79b89680203d86b05.html',
    'https://wenku.baidu.com/view/877802720a4e767f5acfa1c7aa00b52acfc79cc8.html',
    '/Users/lichong/Temp/baidu_doc'
  );
  process.exit(0);
})();