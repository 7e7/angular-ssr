import {ApplicationBase} from '../application';
import {Output} from '../output';

export class ApplicationRenderer {
  constructor(private application: ApplicationBase<any, any>) {}

  renderTo(output: Output): Promise<void> {
    output.initialize();

    return new Promise<void>((resolve, reject) => {
      this.application.prerender()
        .then(snapshots => {
          snapshots.subscribe(
            snapshot => {
              output.write(snapshot);
            },
            exception => {
              reject(new Error(`Fatal render exception: ${exception}`));
            },
            () => resolve());
        })
        .catch(exception => {
          reject(new Error(`Failed to render application: ${exception}`));
        });
    });
  }
}
