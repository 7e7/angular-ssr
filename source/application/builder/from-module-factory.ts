import {NgModuleFactory} from '@angular/core/index';

import {ApplicationBase} from './application';

export class ApplicationFromModuleFactory<V> extends ApplicationBase<V, any> {
  constructor(private factory: NgModuleFactory<any>) {
    super();
  }

  dispose() {}

  protected getModuleFactory(): Promise<NgModuleFactory<any>> {
    return Promise.resolve(this.factory);
  }
}
