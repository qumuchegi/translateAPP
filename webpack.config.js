const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HappyPack = require('happypack');// 多进程执行构建
const happyPackThreadPool = HappyPack.ThreadPool({size:5}) // 共享进程池子进程数
//const webpack = require('webpack')
const DefinePlugin = require('webpack/lib/DefinePlugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const CopyPlugin = require('copy-webpack-plugin');



module.exports = {
    mode:'production',
    //target:'electron-renderer',
    entry:{
        app:'./src/index',
        //electronRender:'./render'
    },
    output:{
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')  
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "happypack/loader?id=babel" 
          }
        },
        {
            test: /\.css$/,           //加载CSS 
            include:path.resolve(__dirname,'src'),
            use: "happypack/loader?id=css"
        },
        {
            test: /\.(png|svg|jpg|gif)$/,    //加载图片
            include:path.resolve(__dirname,'src'),
            use: "happypack/loader?id=img"
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,     //加载字体
            use: [{
                loader:'url-loader',
                options:{
                    limit:1024*30,
                    fallback:'file-loader'
                }
              }
            ]
        },
  
  
      ]
    },
    
    optimization:{
        splitChunks:{
            chunks: 'all',
            name: true,  
        },
    },
    plugins: [
        new CleanWebpackPlugin(),// 在重新构建之前清理 dist 文件夹
	    new CopyPlugin([ // 拷贝一些静态资源入图标等到 dist 目录下 的 static 
            { from: 'static',
              to: 'static',
              cache:true,
            },
            
          ]),
        // HappyPack 使用多进程并行执行 loader ，缩短执行构建时间
        new HappyPack({
            id:'babel',
            loaders:['babel-loader?cacheDirectory'],
            threadPool:happyPackThreadPool
        }),
        new HappyPack({
            id:'css',
            loaders:[
                'style-loader',
                'css-loader'],
            threadPool:happyPackThreadPool
        }),
        new HappyPack({
            id:'img',
            loaders:['file-loader'],
            threadPool:happyPackThreadPool
        }),
        
        /*
        new ParallelUglifyPlugin({// 多进程并行处理压缩
            test:/\.js$/g,
            workerCount:5,
            sourceMap: true,
            cacheDir:path.resolve(__dirname,'dist'),
            uglifyJS:{
                output:{
                    beautify:false,
                    comments:false,
                },
                compress:{
                    warnings:false,
                    drop_console:true,
                    collapse_vars:true,
                    reduce_vars:true
                }
            },
            
        }),
        */
       
        new HtmlWebpackPlugin({ // 生产HTML，并管理构建的分离代码在 HTML文件上的挂载
            //title:'output management',
            //chunks:['app'],// 设置挂载哪些 chunk 
            title: 'Code Splitting',
            template: "./src/index.html",
            filename: "./index.html"
        }),
        
        new DefinePlugin({ // 定义当前环境变量为 生产环境，用于构建线上生产环境代码
            'process.env.NODE_ENV': JSON.stringify('production') // ‘ “production” ’
          })
     
    ],
    /*
    watch:true,
    watchOptions: {
        aggregateTimeout: 100,
        poll: 200,
        ignored: /node_modules/
    },
    */
    devtool: 'inline-source-map',
    devServer: {
        contentBase: require('path').join(__dirname, "dist"),
        compress: true,
        port: 8033,
        host: "127.0.0.1",
        hot: true
    },
    externals:{
       electron:'electron'
    }
  };