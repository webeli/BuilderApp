var path = require('path');

module.exports = {
    context: path.resolve('js'),
    entry: ["../app"],
    output: {
        path: path.resolve('build/'),
        publicPath: '/public/',
        filename: "bundle.js"
    },
    devServer: {
        contentBase: 'public'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
            { test: /\.html$/, exclude: /node_modules/, loader: "raw-loader" },
            { test: /\.less$/, loader: "style!css!less" },
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.es6', '.css', '.less']
    }
}