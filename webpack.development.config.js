let path = require('path')

//TODO: change to mode production 
let config = {
    mode: 'development',
    entry: [
        './src/index.tsx'
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'babel-loader' },
                    { loader: 'ts-loader', options: { onlyCompileBundledFiles: true } }
                ]
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    node: {
        fs: 'empty'
    },
    resolve: {
        extensions: ['*', '.ts', '.tsx', '.js', '.jsx'],
    },
    output: {
        path: __dirname + '/public/assets/javascript',
        publicPath: '/assets/javascript',
        filename: 'bundle.js'
    },
    plugins: [],
    devServer: {
        contentBase: './public',
        index: "index.html",
        proxy: {
            "/": {
                target: "http://localhost:8000/", //host to place to proxy
                changeOrigin: true, // required if you want to send right host-header if webserver has multiple vhosts
                bypass: function(req, res, proxyOptions) {
                    //return falsey value here to not proxy
                    return req.path
                }
            }
        }        
    },
};

module.exports = config;