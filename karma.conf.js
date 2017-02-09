const {readFileSync} = require('fs');

const {resolve, join} = require('path');

module.exports = function (config) {
  config.set({
    frameworks: [
      'jasmine',
      'karma-typescript',
    ],

    files: [
      {pattern: './source/**/*.ts'},
    ],

    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },

    reporters: [
      'spec',
      'progress',
      'karma-typescript',
    ],

    browsers: ['Chrome'],

    karmaTypescriptConfig:
      Object.assign(tsconfig(), {
        bundlerOptions: {
          validateSyntax: false,
        },
        coverageOptions: {
          instrumentation: config.singleRun === true,
        },
        exclude: [
          'build',
          'node_modules',
        ]
      }),
  });
};

function tsconfig() {
  return JSON.parse(readFileSync(resolve(join(__dirname, 'tsconfig.json')), 'utf8'));
}

