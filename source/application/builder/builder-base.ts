import {Injector, NgModuleFactory} from '@angular/core';

import {ApplicationBuilder} from './builder';
import {RenderOperation, ApplicationStateReader} from '../operation';
import {Route} from '../../route';
import {VariantsMap} from '../../variants';
import {PlatformImpl, createServerPlatform} from './../../platform';

export abstract class ApplicationBuilderBase<M> implements ApplicationBuilder {
  protected operation: Partial<RenderOperation<M>> = {};

  private platformImpl: PlatformImpl;

  abstract getModuleFactory(): Promise<NgModuleFactory<M>>;

  templateDocument(template?: string) {
    if (template != null) {
      this.operation.templateDocument = template;
    }
    return this.operation.templateDocument;
  }

  bootstrap(fn?: (injector: Injector) => void) {
    if (fn) {
      if (this.operation.bootstrap == null) {
        this.operation.bootstrap = [];
      }
      this.operation.bootstrap.push(fn);
    }
    return this.operation.bootstrap;
  }

  postprocess(transform?: (html: string) => string) {
    if (transform) {
      if (this.operation.postprocessors == null) {
        this.operation.postprocessors = [];
      }
      this.operation.postprocessors.push(transform);
    }
    return this.operation.postprocessors;
  }

  variants(map: VariantsMap) {
    if (map) {
      this.operation.variants = map;
    }
    return this.operation.variants;
  }

  routes(routes?: Array<Route>) {
    if (routes) {
      this.operation.routes = routes;
    }
    return this.operation.routes;
  }

  stateReader(stateReader?: ApplicationStateReader) {
    if (stateReader) {
      this.operation.stateReader = stateReader;
    }
    return this.operation.stateReader;
  }

  protected getPlatform(): PlatformImpl {
    return <PlatformImpl> createServerPlatform([]);
  }

  get platform(): PlatformImpl {
    if (this.platformImpl == null) {
      this.platformImpl = this.getPlatform();
    }
    return this.platformImpl;
  }

  dispose() {
    const platformImpl = this.platformImpl;
    if (platformImpl) {
      delete this.platformImpl;

      platformImpl.destroy();
    }
  }
}