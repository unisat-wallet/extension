/* eslint-disable indent */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const fs = require('fs');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;
const stylusRegex = /\.styl$/;
const stylusModuleRegex = /\.module\.styl$/;
const WasmModuleWebpackPlugin = require('wasm-module-webpack-plugin');
const { getBrowserPaths } = require('./paths');

const config = (env) => {
  const version = env.version;
  const paths = getBrowserPaths(env.browser);
  // Check if Tailwind config exists
  const useTailwind = fs.existsSync(path.join(paths.appPath, 'tailwind.config.js'));

  const shouldUseSourceMap = false;
  const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000');
  const isEnvDevelopment = true;
  const isEnvProduction = false;
  const shouldUseReactRefresh = false;
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

  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        // css is located in `static/css`, use '../../' to locate index.html folder
        // in production `paths.publicUrlOrPath` can be a relative path
        options: paths.publicUrlOrPath.startsWith('.') ? { publicPath: '../../' } : {}
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            // Necessary for external CSS imports to work
            // https://github.com/facebook/create-react-app/issues/2677
            ident: 'postcss',
            config: false,
            plugins: !useTailwind
              ? [
                  'postcss-flexbugs-fixes',
                  ['postcss-preset-env', { autoprefixer: { flexbox: 'no-2009' }, stage: 3 }],
                  // Adds PostCSS Normalize as the reset css with default options,
                  // so that it honors browserslist config in package.json
                  // which in turn let's users customize the target behavior as per their needs.
                  'postcss-normalize'
                ]
              : [
                  'tailwindcss',
                  'postcss-flexbugs-fixes',
                  ['postcss-preset-env', { autoprefixer: { flexbox: 'no-2009' }, stage: 3 }]
                ]
          },
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment
        }
      }
    ].filter(Boolean);
    if (preProcessor) {
      let preProcessorOptions = {
        sourceMap: true
      };
      if (preProcessor === 'less-loader') {
        preProcessorOptions = {
          sourceMap: true,
          // 自定义主题
          lessOptions: {
            modifyVars: {
              'primary-color': 'rgb(234,202,68)',
              'primary-color-active': '#383535',
              'input-icon-hover-color': '#FFFFFF',
              'component-background': '#1C1919',
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
              // "checkbox-border-width": "1px",
              'layout-header-background': '#2A2626',
              'layout-header-padding': '0 1.875rem',
              'layout-header-height': '5.625rem',
              'layout-footer-padding': 'unset',
              'border-radius-base': '0.3rem',
              'checkbox-border-radius': '0.125rem',
              // 'checkbox-color': '#2A2626',
              // 'checkbox-check-color': '#D7721F',
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
          // options: {
          //   sourceMap: true,
          // },
          options: preProcessorOptions
        }
      );
    }
    return loaders;
  };

  const config = {
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
      globalObject: 'this'
    },
    module: {
      rules: [
        // Handle node_modules packages that contain sourcemaps
        shouldUseSourceMap && {
          enforce: 'pre',
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          test: /\.(js|mjs|jsx|ts|tsx|css)$/,
          loader: require.resolve('source-map-loader')
        },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // TODO: Merge this config once `image/avif` is in the mime-db
            // https://github.com/jshttp/mime-db
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
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit
                }
              }
            },
            {
              test: /\.svg$/,
              use: [
                {
                  loader: require.resolve('@svgr/webpack'),
                  options: {
                    prettier: false,
                    svgo: false,
                    svgoConfig: {
                      plugins: [{ removeViewBox: false }]
                    },
                    titleProp: true,
                    ref: true
                  }
                },
                {
                  loader: require.resolve('file-loader'),
                  options: {
                    name: 'static/media/[name].[hash].[ext]'
                  }
                }
              ],
              issuer: {
                and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
              }
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
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

                plugins: [isEnvDevelopment && shouldUseReactRefresh && require.resolve('react-refresh/babel')].filter(
                  Boolean
                ),
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                compact: isEnvProduction
              }
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [[require.resolve('babel-preset-react-app/dependencies'), { helpers: true }]],
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,

                // Babel sourcemaps are needed for debugging into node_modules
                // code.  Without the options below, debuggers like VSCode
                // show incorrect code and set breakpoints on the wrong lines.
                sourceMaps: shouldUseSourceMap,
                inputSourceMap: shouldUseSourceMap
              }
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use MiniCSSExtractPlugin to extract that CSS
            // to a file, but in development "style" loader enables hot editing
            // of CSS.
            // By default we support CSS Modules with the extension .module.css
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                modules: {
                  mode: 'icss'
                }
              }),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true
            },
            // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
            // using the extension .module.css
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                modules: {
                  mode: 'local',
                  getLocalIdent: getCSSModuleLocalIdent
                }
              })
            },
            // Opt-in support for SASS (using .scss or .sass extensions).
            // By default we support SASS Modules with the
            // extensions .module.scss or .module.sass
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                  modules: {
                    mode: 'icss'
                  }
                },
                'sass-loader'
              ),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true
            },
            // Adds support for CSS Modules, but using SASS
            // using the extension .module.scss or .module.sass
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
            // 支持 stylus
            {
              test: stylusRegex,
              exclude: stylusModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                  modules: {
                    mode: 'icss'
                  }
                },
                'stylus-loader'
              ),
              sideEffects: true
            },
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
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource'
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
            {
              test: /\.m?js$/,
              include: [path.join(paths.appNodeModules, 'tiny-secp256k1')],
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env'],
                  plugins: [
                    '@babel/plugin-syntax-dynamic-import',
                    // '@babel/plugin-transform-runtime', // do not use with this plugin
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
        extensions: ['ts', 'tsx', 'js', 'jsx']
      }),
      // new AntdDayjsWebpackPlugin(),
      // new HtmlWebpackPlugin({
      //   inject: true,
      //   template: paths.popupHtml,
      //   chunks: ['ui'],
      //   filename: 'popup.html',
      // }),
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
      // new AssetReplacePlugin({
      //   '#PAGEPROVIDER#': 'pageProvider',
      // }),
      new webpack.DefinePlugin({
        'process.env.version': JSON.stringify(`Version: ${version}`),
        'process.env.release': JSON.stringify(version)
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        // filename: 'static/css/[name].[contenthash:8].css',
        // chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        filename: 'static/css/[name].css',
        chunkFilename: 'static/css/[name].chunk.css'
      }),
      new WasmModuleWebpackPlugin.WebpackPlugin()
    ],
    resolve: {
      alias: {
        moment: require.resolve('dayjs')
      },
      plugins: [new TSConfigPathsPlugin()],
      fallback: {
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify')
        // buffer: require.resolve('buffer/')
      },
      extensions: ['.js', 'jsx', '.ts', '.tsx']
    },
    stats: 'minimal',
    // optimization: {
    //   splitChunks: {
    //     cacheGroups: {
    //       'webextension-polyfill': {
    //         minSize: 0,
    //         test: /[\\/]node_modules[\\/]webextension-polyfill/,
    //         name: 'webextension-polyfill',
    //         chunks: 'all',
    //       },
    //     },
    //   },
    // },
    experiments: {
      asyncWebAssembly: true
    }
  };
  config.module.rules = config.module.rules.map((rule) => {
    if (rule.oneOf instanceof Array) {
      return {
        ...rule,
        oneOf: [{ test: /\.wasm$/, type: 'webassembly/async' }, ...rule.oneOf]
      };
    }
    return rule;
  });
  return config;
};

module.exports = config;
