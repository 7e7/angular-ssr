import {
  COMPILER_OPTIONS,
  ErrorHandler,
  Sanitizer,
  PlatformRef,
  Provider,
  createPlatformFactory,
} from '@angular/core';

import {
  PlatformLocation
} from '@angular/common';

import {
  COMPILER_PROVIDERS,
  ResourceLoader,
  platformCoreDynamic
} from '@angular/compiler';

import {ErrorHandlerImpl, ExceptionStream} from './exception-stream';
import {ResourceLoaderImpl} from './resource-loader';
import {LocationImpl} from './location';
import {PlatformImpl} from './platform';
import {SanitizerImpl} from './sanitizer';
import {CurrentZone} from './zone';

import {privateCoreImplementation} from 'platform';

const {
  APP_ID_RANDOM_PROVIDER,
} = privateCoreImplementation();

export type PlatformFactory = (extraProviders?: Array<Provider>) => PlatformRef;

export const platformNode: PlatformFactory =
  createPlatformFactory(platformCoreDynamic, 'nodejs', [
    COMPILER_PROVIDERS,
    {
      provide: COMPILER_OPTIONS,
      useValue: {providers: [
        {provide: ResourceLoader, useClass: ResourceLoaderImpl}
      ]},
      multi: true,
    },
    APP_ID_RANDOM_PROVIDER,
    {provide: ExceptionStream, useClass: ExceptionStream},
    {provide: PlatformRef, useClass: PlatformImpl},
    {provide: Sanitizer, useClass: SanitizerImpl},
    {provide: ErrorHandler, useClass: ErrorHandlerImpl},
    {provide: PlatformLocation, useClass: LocationImpl},
    {provide: CurrentZone, useClass: CurrentZone},
  ]);

