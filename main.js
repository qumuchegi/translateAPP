'use strict'

const electron = require('electron')
const { ipcMain,app,BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs');
const pdf = require('pdf-parse');
 
const axios = require('axios')
    
let mainWindow = null

app.on('window-all-closed', () => {
    app.quit()
  })

app.on('ready',()=>{
    mainWindow = new BrowserWindow(
        {
            minWidth:1200, minHeight:800,
            
            webPreferences:{
                webSecurity:false,// 关掉浏览器的同源策略，使其可以跨域
                preload: path.join(__dirname,'./render.js' ) 
                /*
                 preload String (可选)  
                 -在页面运行其他脚本之前预先加载指定的脚本 无论页面是否集成 Node, 
                 此脚本可以访问所有 Node API ，脚本路径为文件的绝对路径。

                 由于在本项目 webpack 将 JS 构建为在 浏览器端运行的代码，所以 JS 文件是运行在浏览器页面，
                 故不是 Electron 的渲染进程，所以不能访问 Node，
                 也就不能访问 Electron，如果要在页面中 使用 electron 的API，可以把 electron 模块 作为全局
                 变量引入到浏览器环境，preload 就可以加载这样的引入 electron 的脚本
                */
             
            },
          
        }
    )
    mainWindow.loadURL(`file://${__dirname}/dist/index.html`)
    mainWindow.webContents.openDevTools ()
    mainWindow.on('closed',()=>{mainWindow = null})
})

ipcMain.on('transNewDoc',(event, {from,to,filePath})=>{
    if(filePath){
        console.log('main:',filePath)
        let dataBuffer = fs.readFileSync(filePath);
        let sourceFile = {}
        let transedText 
        let transResult = {} // 包括原文和译文内容

        pdf(dataBuffer).then(async function(data) {
            // 原文信息
            sourceFile.numpages = data.numpages
            sourceFile.info = data.info
            sourceFile.text = data.text

            // API 请求译文
            transedText = await fetchTransRes(from,to,data.text)
            transResult = {transedText, sourceFile}
            event.sender.send('transDocRes', transResult)

        });

       
    }
})

async function fetchTransRes(from,to,text){
    if(text.length < 3000){
        console.log(text.length)
        try{
            let resData = await api.post(from,to,text)
            //console.log(resData)
            return  resData
        }catch(err){
            console.log( err.response.status)
            if(err.response.status===414){
                return 2 // URL 太长，翻译 API 出错
            }
             
        }
       
        //console.log(resData,'length小于3000')
       //.translation[0].translated.reduce((a,b)=>`${a.text||a}${b.text}`)
    }
    else{// 如果原文字符数大于3000字，就返回字数过多的信息，给予用户选择段落翻译的建议
        return  1
        /*
        // 文档内容字符数目大于3000字，那么就将文档分为 n 个部分来一个一个翻译
        let textArr = []
        let resData = []
        let num_text = Math.floor( text.length / 3000 )
        try{
            for(let i = 0; i < num_text ; i++){
                textArr[i] = text.slice(3000*i,3000*(i+1))
                resData[i] = await api.post(from,to,textArr[i])//.translation[0].translated
            }

            console.log(resData)
            return resData
        }catch(err){
             //console.log(err)
             return '翻译出错'
        }
        */
    }
   
}

const url = 'http://api.yeekit.com/dotranslate.php'

const app_kid = '5cbff8d66f3f6'
const app_key = '90dc2c37d4c4f5fa2a6b1344e16b0c4f'

const api={
    post:async(from,to,text)=>{
        let res =  await axios.post(url + `?from=${from}&to=${to}&app_kid=${app_kid}&app_key=${app_key}&text=${encodeURIComponent(text)}`)
        return res.data
    },
}