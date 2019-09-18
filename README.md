# baidu-doc(WIP)
Articles on [百度文库](https://wenku.baidu.com) are downloaded with 下载券 normally. TROUBLESOME, especially I have no 下载券 ! So I made this simple automatic tool to capture the article as images, then you can process these images as your mind, e.g. converting to pdf, merge them etc.

# Usage
You can run codes directly
```
npm start
```
Or, you can build and run bin file
```
npm run build
# CLI
node ./dist/index.js

# Websocket server
node ./dist/server.js
```
More, you can install as global command
```
npm install -g .
# Just exec the command
# CLI
bdwkc

# Websocket server
bdwkc_ws
```
[![asciicast](https://asciinema.org/a/fgosNTSMp25PpxvALPi7B3Qbd.svg)](https://asciinema.org/a/fgosNTSMp25PpxvALPi7B3Qbd)

> **ATTENTION**
> 
> Required environment variables if you run this program due to npm global installed command
>
> ***PUPPETEER_EXECUTABLE_PATH***: Puppeteer standard env. variable, which tells an executable path of Chromium/Chrome
>
> ***BDWKC_OUTPUT_DIR***: Output path of captured document images
>

# Features
- [x] Support DOC
- [x] Support PDF
- [x] Support XLS
- [x] Support TXT
- [x] Support PPT
- [x] Better CLI interface
- [x] Websocket interface
- [ ] Perfect the capture method

# License
MIT
