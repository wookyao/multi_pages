var webpack = require("webpack");
var fs = require("fs");
var path = require('path');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var srcDir = path.resolve(process.cwd(), 'src');
var jsPath = path.resolve(srcDir, 'assets/js');
var cssPath = path.resolve(srcDir, 'assets/style');
var imgPath = path.resolve(srcDir, 'assets/images');
var fontsPath = path.resolve(srcDir, 'assets/fonts');



var webpackConfig = {
  "plugins": [
    new CommonsChunkPlugin('common'),
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
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
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader?limit=8192&name=images/[hash:8].[name].[ext]'
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader?limit=10000&name=fonts/[hash:7].[name].[ext]'
    }]
  },
  resolve: {
    alias: {
      style: cssPath,
      jquery: jsPath + "/lib/jquery.min.js",
      core: jsPath + "/core",
      ui: jsPath + "/ui"
    }
  }
});

module.exports = webpackConfig;