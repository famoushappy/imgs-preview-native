const webpack = require("webpack");
const rm = require('rimraf')
const ora = require('ora');
const path = require('path')
const chalk = require('chalk');
const uglify = require("uglifyjs-webpack-plugin"); 
const spinner = ora({
    color: 'green',
    text: 'building to imgs-preview.min.js ...'
})
spinner.start()

rm(path.resolve(__dirname, '../dist'), (err) => {
    if (err) throw err
    webpack({
    	mode: 'production',
        entry: './src/main.js',
        output: {
            path: path.resolve(__dirname, '../dist'),//输出路径，就是上步骤中新建的dist目录，  
	        publicPath: '../dist/',  
	        filename: 'imgs-preview.min.js'
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env": {  
	                NODE_ENV: JSON.stringify("production")  
	            }  
            }),
            new uglify()
        ]
    }, (err, stats) => {
        spinner.stop()
        if (err) throw err
        console.log(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n\n')
            // style a string 

        // compose multiple styles using the chainable API 
        console.log(chalk.blue.bgYellow.bold('building complete !'));
    })
})