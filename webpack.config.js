const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');



module.exports = {
    mode:'production',
    node:{
        fs:'empty'
    },
  
    //mode:'production',
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
            loader: "babel-loader"
          }
        },
        {
            test: /\.css$/,           //加载CSS 
            use: [
              'style-loader',
              'css-loader'
            ]
        },
        {
            test: /\.(png|svg|jpg|gif)$/,    //加载图片
            use: [
              'file-loader'
            ]
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,     //加载字体
            use: [
              'file-loader'
            ]
        },
  
  
      ]
    },
    plugins: [
        //new CleanWebpackPlugin(['dist']),
	    new HtmlWebpackPlugin({
            title: 'Output Management',
            template: "./src/index.html",
            filename: "./index.html"
        }),
        
    ],
    watch:true,
    watchOptions: {
        aggregateTimeout: 100,
        poll: 200,
        ignored: /node_modules/
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: require('path').join(__dirname, "dist"),
        compress: true,
        port: 8033,
        host: "127.0.0.1",
        
    }
  };