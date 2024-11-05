import webpackMerge from 'webpack-merge';

import commonConfig from './build/webpack.common.config.cjs';
import debugConfig from './build/webpack.debug.config.cjs';
import devConfig from './build/webpack.dev.config.cjs';
import proConfig from './build/webpack.pro.config.cjs';

const configs = {
    dev: devConfig,
    pro: proConfig,
    debug: debugConfig
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
                //vm: resolvePath('vm-browserify')
            }
        }
        // ignoreWarnings: [/./]
    };

    let finalConfigs = env.config
        ? webpackMerge.merge(commonConfig(env), configs[env.config], toAdd)
        : webpackMerge.merge(commonConfig(env), toAdd);

    const addedConfigs = {
        experiments: {
            outputModule: true,
            asyncWebAssembly: true,
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

export default config;
