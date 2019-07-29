var webpack = require("webpack");
var fs = require("fs");
var path = require('path');

var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var extractTextPlugin = require("extract-text-webpack-plugin");

var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var srcDir = path.resolve(process.cwd(), 'src');
var jsPath = path.resolve(srcDir, 'assets/js');


var webpackConfig = {
  "plugins": [
    new CommonsChunkPlugin('common'),
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new extractTextPlugin('style/main.css')
  ]
};

// 获取所有入口文件
// 约定：
//  1. [src/js/pages] 文件下的js文件为入口文件
//  2. [src/js/pages] 下的js命名须与 [src/pages] 下的html名称一致
function getEntryFile() {
  var
    jsEntryPath = path.resolve(jsPath, 'pages'),
    dirs = fs.readdirSync(jsEntryPath),
    matchs = {},
    files = {};

  dirs.forEach(function(item) {
    matchs = item.match(/(.+)\.js$/);
    if (matchs) {
      files[matchs[1]] = path.resolve(jsPath, 'pages', item);
      var plugin = new HtmlWebpackPlugin({
        filename: matchs[1] + '.html',
        template: './src/views/' + matchs[1] + '.html',
        chunks: ['common', matchs[1]],
        inject: 'true',
        minify: {
          removeComments: false,
          collapseWhitespace: false
        }
      });

      webpackConfig.plugins.push(plugin);
    }
  });
  return files;
};



Object.assign(webpackConfig, {
  cache: true,
  entry: getEntryFile(),
  output: {
    path: path.join(__dirname, "dist/"),
    publicPath: "",
    filename: "js/[name].[chunkhash:8].js",
    chunkFilename: "js/[chunkhash].[chunkhash:8].js"
  },
  module: {
    rules: [{
      test: /\.css$/,
      loader: extractTextPlugin.extract('css-loader?minimize')
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader?limit=8192&name=images/[name].[hash:8].[ext]'
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader?limit=10000&name=fonts/[name].[hash:8].[ext]'
    }]
  },
  resolve: {
    alias: {
      style: path.resolve(srcDir, 'assets/style'),
      img: path.resolve(srcDir, 'assets/images'),
      fonts: path.resolve(srcDir, 'assets/fonts'),
      jquery: jsPath + "/lib/jquery.min.js",
      core: jsPath + "/core",
      ui: jsPath + "/ui"
    }
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    host: 'localhost',
    port: 8089
  }
});

module.exports = webpackConfig;