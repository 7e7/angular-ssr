import 'reflect-metadata';

import 'symbol-observable';

const promise = Promise;

import bluebird = require('bluebird'); // some webpack plugins use bluebird to disastrous effect

bluebird.Promise = promise;