import {ConsoleLog} from './console';

export interface Snapshot<V> {
  console: Array<ConsoleLog>;
  exceptions: Array<Error>;
  renderedDocument: string;
  variant: V;
  applicationState?;
  uri: string;
}