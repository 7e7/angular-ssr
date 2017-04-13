const {join, resolve} = require('path');

const {CheckerPlugin} = require('awesome-typescript-loader');

const loaders = require('./webpack/loaders');

module.exports = {
  target: 'node',
  entry: './server/index.ts',
  output: {
    filename: 'index.js',
    path: resolve(join(__dirname, 'dist-server')),
    libraryTarget: 'commonjs2',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      loaders.tsjit,
      loaders.html,
      loaders.css
    ]
  },
  plugins: [
    new CheckerPlugin(),
  ],
  externals: [
    '@angular/cli',
    '@angular/common',
    '@angular/compiler',
    '@angular/compiler-cli',
    '@angular/core',
    '@angular/forms',
    '@angular/http',
    '@angular/platform-browser',
    '@angular/router',
    '@angular/tsc-wrapped',
    '@angular/service-worker',
    function(context, request, callback) {
      const exclusions = [/\@ngrx/, /rxjs/, /observable/, /zone\.js/, /reflect-metadata/];

      if (exclusions.some(expr => expr.test(request))) {
        callback(null, `commonjs ${request.replace(/^.*?(\\|\/)node_modules(\\|\/)/, String())}`);
      }
      else {
        callback();
      }
    },
  ],
  node: {
    __dirname: true,
    __filename: true
  }
};
