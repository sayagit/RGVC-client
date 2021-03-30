const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");

module.exports = {
    mode: "development",
    entry: path.resolve(__dirname, 'src') + "/index.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        port: 3000,
        historyApiFallback: true
    },
    module: {
        rules: [{
            test: /\.m?js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }]
    },
    resolve: {
        extensions: [' ', '.js', '.jsx'] //' 'で拡張子なしのimportを許可する。
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src') + '/index.html',
            filename: 'index.html'
        }),
        new webpack.ProvidePlugin({ // "process is not defined"エラー回避
            process: 'process/browser'
        })
    ]
}