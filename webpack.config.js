const webpackMerge = require('webpack-merge');
const commonConfig = require('./build/webpack.common.config');
const configs = {
    dev: require('./build/webpack.dev.config'),
    pro: require('./build/webpack.pro.config'),
    debug: require('./build/webpack.debug.config')
};

const config = (env) => {
    if (env.config === 'dev') {
        process.env.NODE_ENV = 'development';
        process.env.BABEL_ENV = 'development';
    } else {
        process.env.NODE_ENV = 'production';
        process.env.BABEL_ENV = 'production';
        process.env.TAILWIND_MODE = 'watch';
    }

    const toAdd = {
        resolve: {
            fallback: {
                vm: require.resolve('vm-browserify')
            }
        }
        //ignoreWarnings: [/./]
    };

    let finalConfigs = env.config
        ? webpackMerge.merge(commonConfig(env), configs[env.config], toAdd)
        : webpackMerge.merge(commonConfig(env), toAdd);

    const addedConfigs = {
        experiments: {
            outputModule: true,
            asyncWebAssembly: false,
            syncWebAssembly: true
        },
        node: {
            __dirname: false
        },
        optimization: {
            usedExports: true
        },
        target: 'web'
    };

    finalConfigs = webpackMerge.merge(finalConfigs, addedConfigs);

    return finalConfigs;
};

module.exports = config;
