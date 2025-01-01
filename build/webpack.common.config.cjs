const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const fs = require('fs');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const WasmModuleWebpackPlugin = require('wasm-module-webpack-plugin');
const { getBrowserPaths } = require('./paths.cjs');

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;
const stylusRegex = /\.styl$/;
const stylusModuleRegex = /\.module\.styl$/;

const config = (env) => {
    // Determine dev/prod
    const isEnvProduction = env.mode === 'production';
    const isEnvDevelopment = !isEnvProduction;

    const version = env.version;
    const paths = getBrowserPaths(env.browser);
    const manifest = env.manifest;
    const channel = env.channel;

    // Check if Tailwind config exists
    const useTailwind = fs.existsSync(path.join(paths.appPath, 'tailwind.config.js'));

    // You can tweak this if you actually want source maps in production
    const shouldUseSourceMap = false;

    const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000');
    // You can enable React Refresh only in dev if you like:
    const shouldUseReactRefresh = false;

    // Detect new JSX transform
    const hasJsxRuntime = (() => {
        if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
            return false;
        }
        try {
            require.resolve('react/jsx-runtime');
            return true;
        } catch (e) {
            return false;
        }
    })();

    // Common function to set up style loaders (CSS, PostCSS, etc.),
    // plus an optional pre-processor (less-loader, sass-loader, stylus-loader).
    const getStyleLoaders = (cssOptions, preProcessor) => {
        const loaders = [
            // In dev, inject styles via <style> tags; in prod, extract to .css files.
            isEnvDevelopment && require.resolve('style-loader'),
            isEnvProduction && {
                loader: MiniCssExtractPlugin.loader,
                options: paths.publicUrlOrPath.startsWith('.') ? { publicPath: '../../' } : {}
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions
            },
            {
                loader: require.resolve('postcss-loader'),
                options: {
                    postcssOptions: {
                        // If you have a postcss.config.js, you can reference it,
                        // but here we configure plugins inline:
                        plugins: !useTailwind
                            ? [
                                require('postcss-flexbugs-fixes'),
                                require('postcss-preset-env')({
                                    autoprefixer: { flexbox: 'no-2009' },
                                    stage: 3
                                }),
                                // Adds PostCSS Normalize as the reset css with default options
                                require('postcss-normalize')
                            ]
                            : [
                                require('tailwindcss'),
                                require('postcss-flexbugs-fixes'),
                                require('postcss-preset-env')({
                                    autoprefixer: { flexbox: 'no-2009' },
                                    stage: 3
                                })
                            ]
                    },
                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment
                }
            }
        ].filter(Boolean);

        if (preProcessor) {
            let preProcessorOptions = { sourceMap: true };

            if (preProcessor === 'less-loader') {
                // Custom theme variables if needed
                preProcessorOptions = {
                    sourceMap: true,
                    lessOptions: {
                        modifyVars: {
                            'primary-color': 'rgb(234,202,68)',
                            'primary-color-active': '#383535',
                            'input-icon-hover-color': '#FFFFFF',
                            'component-background': '#070606',
                            'select-dropdown-bg': '#2A2626',
                            'select-item-selected-bg': '#332F2F',
                            'select-item-active-bg': '#332F2F',
                            'input-border-color': 'rgba(255,255,255,0.2)',
                            borderColor: 'rgba(255,255,255,0.2)',
                            'input-hover-border-color': 'rgba(255,255,255,0.4)',
                            hoverBorderColor: 'rgba(255,255,255,0.4)',
                            'border-color-base': 'rgba(255,255,255,0.2)',
                            'border-width-base': '0',
                            'animation-duration-slow': '0.08s',
                            'animation-duration-base': '0.08s',
                            'layout-header-background': '#2A2626',
                            'layout-header-padding': '0 1.875rem',
                            'layout-header-height': '5.625rem',
                            'layout-footer-padding': 'unset',
                            'border-radius-base': '0.3rem',
                            'checkbox-border-radius': '0.125rem',
                            'heading-color': '#ffffff',
                            'font-size-base': '1.125rem',
                            'line-height-base': '1.375rem',
                            'text-color': '#ffffff',
                            'text-color-secondary': '#AAAAAA',
                            'height-lg': '3.875rem',
                            'checkbox-size': '1.5rem',
                            'btn-text-hover-bg': '#383535',
                            'input-disabled-color': 'rgba(255,255,255,0.6)'
                        },
                        javascriptEnabled: true
                    }
                };
            }

            loaders.push(
                {
                    loader: require.resolve('resolve-url-loader'),
                    options: {
                        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                        root: paths.appSrc
                    }
                },
                {
                    loader: require.resolve(preProcessor),
                    options: preProcessorOptions
                }
            );
        }

        return loaders;
    };

    const finalConfig = {
        entry: {
            background: paths.rootResolve('src/background/index.ts'),
            'content-script': paths.rootResolve('src/content-script/index.ts'),
            pageProvider: paths.rootResolve('src/content-script/pageProvider/index.ts'),
            ui: paths.rootResolve('src/ui/index.tsx')
        },
        output: {
            path: paths.dist,
            filename: '[name].js',
            publicPath: '/',
            // Use 'self' for better cross-context compatibility
            globalObject: 'self',
            // ES Module output (for Manifest V3)
            environment: { module: true, dynamicImport: false }
        },
        module: {
            rules: [
                // Optionally handle node_modules packages that contain sourcemaps
                shouldUseSourceMap && {
                    enforce: 'pre',
                    exclude: /@babel(?:\/|\\{1,2})runtime/,
                    test: /\.(js|mjs|jsx|ts|tsx|css)$/,
                    loader: require.resolve('source-map-loader')
                },
                {
                    oneOf: [
                        {
                            test: [/\.avif$/],
                            type: 'asset',
                            mimetype: 'image/avif',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: imageInlineSizeLimit
                                }
                            }
                        },
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            type: 'asset',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: imageInlineSizeLimit
                                }
                            }
                        },
                        // Modern approach for SVG:
                        // - Use asset/resource for the final file
                        // - Also run @svgr/webpack for React components
                        {
                            test: /\.svg$/,
                            type: 'asset/resource',
                            generator: {
                                filename: 'static/media/[name].[hash][ext]'
                            },
                            issuer: {
                                and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
                            },
                            use: [
                                {
                                    loader: require.resolve('@svgr/webpack'),
                                    options: {
                                        prettier: false,
                                        svgo: false,
                                        svgoConfig: { plugins: [{ removeViewBox: false }] },
                                        titleProp: true,
                                        ref: true
                                    }
                                }
                            ]
                        },
                        // Process application JS/TS with Babel
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: paths.appSrc,
                            loader: require.resolve('babel-loader'),
                            options: {
                                customize: require.resolve('babel-preset-react-app/webpack-overrides'),
                                presets: [
                                    [
                                        require.resolve('babel-preset-react-app'),
                                        {
                                            runtime: hasJsxRuntime ? 'automatic' : 'classic'
                                        }
                                    ]
                                ],
                                plugins: [
                                    isEnvDevelopment &&
                                    shouldUseReactRefresh &&
                                    require.resolve('react-refresh/babel')
                                ].filter(Boolean),
                                cacheDirectory: true,
                                cacheCompression: false,
                                compact: isEnvProduction
                            }
                        },
                        // Process any JS outside of the app with Babel
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: require.resolve('babel-loader'),
                            options: {
                                babelrc: false,
                                configFile: false,
                                compact: false,
                                presets: [
                                    [
                                        require.resolve('babel-preset-react-app/dependencies'),
                                        { helpers: true }
                                    ]
                                ],
                                cacheDirectory: true,
                                cacheCompression: false,
                                sourceMaps: shouldUseSourceMap,
                                inputSourceMap: shouldUseSourceMap
                            }
                        },
                        // CSS (global)
                        {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 1,
                                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                                    modules: { mode: 'icss' }
                                }
                            ),
                            sideEffects: true
                        },
                        // CSS Modules
                        {
                            test: cssModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 1,
                                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                                    modules: {
                                        mode: 'local',
                                        getLocalIdent: getCSSModuleLocalIdent
                                    }
                                }
                            )
                        },
                        // SASS (global)
                        {
                            test: sassRegex,
                            exclude: sassModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                                    modules: { mode: 'icss' }
                                },
                                'sass-loader'
                            ),
                            sideEffects: true
                        },
                        // SASS Modules
                        {
                            test: sassModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                                    modules: {
                                        mode: 'local',
                                        getLocalIdent: getCSSModuleLocalIdent
                                    }
                                },
                                'sass-loader'
                            )
                        },
                        // Less (global)
                        {
                            test: lessRegex,
                            exclude: lessModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                                    modules: { mode: 'icss' }
                                },
                                'less-loader'
                            ),
                            sideEffects: true
                        },
                        // Less Modules
                        {
                            test: lessModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                                    modules: {
                                        mode: 'local',
                                        getLocalIdent: getCSSModuleLocalIdent
                                    }
                                },
                                'less-loader'
                            )
                        },
                        // Stylus (global)
                        {
                            test: stylusRegex,
                            exclude: stylusModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                                    modules: { mode: 'icss' }
                                },
                                'stylus-loader'
                            ),
                            sideEffects: true
                        },
                        // Stylus Modules
                        {
                            test: stylusModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                                    modules: {
                                        mode: 'local',
                                        getLocalIdent: getCSSModuleLocalIdent
                                    }
                                },
                                'stylus-loader'
                            )
                        },
                        // Fallback resource loader
                        {
                            exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            type: 'asset/resource'
                        },
                        // WASM Babel config for specific deps
                        {
                            test: /\.m?js$/,
                            include: [path.join(paths.appNodeModules, 'tiny-secp256k1')],
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    presets: ['@babel/preset-env'],
                                    plugins: [
                                        '@babel/plugin-syntax-dynamic-import',
                                        WasmModuleWebpackPlugin.BabelPlugin
                                    ]
                                }
                            }
                        }
                    ]
                }
            ].filter(Boolean)
        },
        plugins: [
            new ESLintWebpackPlugin({
                extensions: ['ts', 'tsx', 'js', 'jsx'],
                context: path.resolve(__dirname, '../src'),
                overrideConfigFile: path.resolve(__dirname, '../eslint.config.cjs')
            }),
            new HtmlWebpackPlugin({
                inject: true,
                template: paths.notificationHtml,
                chunks: ['ui'],
                filename: 'notification.html'
            }),
            new HtmlWebpackPlugin({
                inject: true,
                template: paths.indexHtml,
                chunks: ['ui'],
                filename: 'index.html'
            }),
            new HtmlWebpackPlugin({
                inject: true,
                template: paths.backgroundHtml,
                chunks: ['background'],
                filename: 'background.html'
            }),
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process',
                dayjs: 'dayjs'
            }),
            new webpack.DefinePlugin({
                'process.env.version': JSON.stringify(`Version: ${version}`),
                'process.env.release': JSON.stringify(version),
                'process.env.manifest': JSON.stringify(manifest),
                'process.env.channel': JSON.stringify(channel)
            }),
            // Extracts CSS in production
            new MiniCssExtractPlugin({
                filename: 'static/css/[name].css',
                chunkFilename: 'static/css/[name].chunk.css'
            }),
            new WasmModuleWebpackPlugin.WebpackPlugin()
        ],
        resolve: {
            alias: {
                // Example: re-map 'moment' to 'dayjs'
                moment: require.resolve('dayjs')
            },
            plugins: [new TSConfigPathsPlugin()],
            fallback: {
                stream: require.resolve('stream-browserify'),
                crypto: require.resolve('crypto-browserify'),
                process: require.resolve('process/browser'),
                events: require.resolve('events/'),
                zlib: require.resolve('browserify-zlib'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                buffer: require.resolve('buffer/'),
                vm: require.resolve('vm-browserify/')
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx']
        },
        stats: 'minimal',
        // If you want to re-enable code splitting, do it here:
        // optimization: { ... }
        experiments: {
            asyncWebAssembly: true,
            topLevelAwait: true,
            outputModule: true
        },
        target: 'web'
    };

    // Insert a "wasm" rule at the top of the oneOf array
    finalConfig.module.rules = finalConfig.module.rules.map((rule) => {
        if (rule.oneOf instanceof Array) {
            return {
                ...rule,
                oneOf: [
                    { test: /\.wasm$/, type: 'webassembly/async' },
                    ...rule.oneOf
                ]
            };
        }
        return rule;
    });

    return finalConfig;
};

module.exports = config;
