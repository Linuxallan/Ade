const path = require('path');
const webpack = require('webpack');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    context: __dirname,
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    entry: slsw.lib.entries,
    devtool: slsw.lib.webpack.isLocal ? 'cheap-module-eval-source-map' : 'source-map',
    resolve: {
        extensions: ['.mjs', '.json', '.ts'],
        symlinks: false,
        cacheWithContext: false,
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js',
    },
    target: 'node',
    externals: [nodeExternals()],
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.(tsx?)$/,
                loader: 'ts-loader',
                exclude: [
                    [
                        path.resolve(__dirname, 'node_modules'),
                        path.resolve(__dirname, '.serverless'),
                        path.resolve(__dirname, '.webpack'),
                    ],
                ],
                options: {
                    transpileOnly: true,
                    experimentalWatchApi: true,
                },
            },
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'BUCKET': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).BUCKET),
                'CERTIFICATE_ARN': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).CERTIFICATE_ARN),
                'CF_BRANCH': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).CF_BRANCH),
                'CF_DOMINIO': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).CF_DOMINIO),
                'CF_REPOSITORIO': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).CF_REPOSITORIO),
                'CF_ROL_CODEBUILD': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).CF_ROL_CODEBUILD),
                'CF_ROL_PIPELINE': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).CF_ROL_PIPELINE),
                'CLIENT_ID': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).CLIENT_ID),
                'REGION': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).REGION),
                'ROLE_ARN_CLOUDFORMATION': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).ROLE_ARN_CLOUDFORMATION),
                'SECRET_GITHUB': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).SECRET_GITHUB),
                'STAGE': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).STAGE),
                'TABLA_EVENTOS': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).TABLA_EVENTOS),
                'URL_TEMPLATE': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).URL_TEMPLATE),
                'URL_WELCU': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).URL_WELCU),
                'URL_WELCU_LIST': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).URL_WELCU_LIST),
                'USER_POOL_ID': JSON.stringify(require(`./config.${slsw.lib.options.stage}.json`).USER_POOL_ID)
            }
        })
    ],
};
