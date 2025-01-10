// webpack.common.config.cjs
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

// If you want to define a single rule for both TS & JS with ts-loader, you can,
// but typically we handle TS with ts-loader and JS with Babel.
// Here is a helper to load styles:
function getStyleLoaders(isEnvProduction, isEnvDevelopment, paths, useTailwind) {
    const shouldUseSourceMap = false; // customize as needed

    return (cssOptions, preProcessor) => {
        const loaders = [
            // In dev, inject styles via <style> tags; in prod, extract to .css files.
            isEnvDevelopment && require.resolve('style-loader'),
            isEnvProduction && {
                loader: MiniCssExtractPlugin.loader,
                options: paths.publicUrlOrPath?.startsWith('.') ? { publicPath: '../../' } : {}
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions
            },
            {
                loader: require.resolve('postcss-loader'),
                options: {
                    postcssOptions: {
                        plugins: !useTailwind
                            ? [
                                require('postcss-flexbugs-fixes'),
                                require('postcss-preset-env')({
                                    autoprefixer: { flexbox: 'no-2009' },
                                    stage: 3
                                }),
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
}

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

    // If you actually want source maps in production, set to true:
    const shouldUseSourceMap = false;
    // React Refresh is optional for dev:
    const shouldUseReactRefresh = false;

    // Detect new JSX transform
    const hasJsxRuntime = (() => {
        if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
            return false;
        }
        try {
            require.resolve('react/jsx-runtime');
            return true;
        } catch {
            return false;
        }
    })();

    const makeStyleLoaders = getStyleLoaders(isEnvProduction, isEnvDevelopment, paths, useTailwind);

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
            globalObject: 'self',
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
                        // Images
                        {
                            test: [/\.avif$/],
                            type: 'asset',
                            mimetype: 'image/avif',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000')
                                }
                            }
                        },
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            type: 'asset',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000')
                                }
                            }
                        },
                        // Modern approach for SVG w/ @svgr
                        {
                            test: /\.svg$/,
                            type: 'asset/resource',
                            generator: {
                                filename: 'static/media/[name].[hash][ext]'
                            },
                            issuer: { and: [/\.(ts|tsx|js|jsx|md|mdx)$/] },
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

                        // JS/JSX with Babel only (no TS):
                        {
                            test: /\.(js|jsx)$/,
                            include: paths.appSrc,
                            use: [
                                {
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
                                }
                            ]
                        },

                        // TS/TSX with ts-loader and optional Babel
                        {
                            test: /\.(ts|tsx)$/,
                            include: paths.appSrc,
                            use: [
                                // First, run TS through `ts-loader` for type-checking + TS->JS
                                {
                                    loader: require.resolve('ts-loader'),
                                    options: {
                                        // Setting `transpileOnly: false` does full type-checking.
                                        // If you want faster rebuilds & use separate type-checker plugin, set to true.
                                        transpileOnly: false
                                    }
                                },
                                // Then optionally run the output JS through Babel for further transforms
                                {
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
                                }
                            ]
                        },

                        // Global CSS
                        {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: makeStyleLoaders(
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
                            use: makeStyleLoaders(
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
                            use: makeStyleLoaders(
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
                            use: makeStyleLoaders(
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
                            use: makeStyleLoaders(
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
                            use: makeStyleLoaders(
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
                            use: makeStyleLoaders(
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
                            use: makeStyleLoaders(
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

                        // Fallback for everything else
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
            // ESLint Plugin with failOnError: true so lint errors break the build
            new ESLintWebpackPlugin({
                extensions: ['ts', 'tsx', 'js', 'jsx'],
                context: path.resolve(__dirname, '../src'),
                overrideConfigFile: path.resolve(__dirname, '../eslint.config.cjs'),
                failOnError: true
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

            new MiniCssExtractPlugin({
                filename: 'static/css/[name].css',
                chunkFilename: 'static/css/[name].chunk.css'
            }),

            new WasmModuleWebpackPlugin.WebpackPlugin()
        ],

        resolve: {
            alias: {
                moment: require.resolve('dayjs') // example alias
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

        experiments: {
            asyncWebAssembly: true,
            topLevelAwait: true,
            outputModule: true
        },

        target: 'web'
    };

    // Insert a "wasm" rule at the top of the oneOf array
    finalConfig.module.rules = finalConfig.module.rules.map((rule) => {
        if (Array.isArray(rule.oneOf)) {
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
