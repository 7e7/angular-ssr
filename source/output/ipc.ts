import {Author} from './author';
import {Snapshot} from '../snapshot';

export class IpcOutput extends Author {
  initialize(): Promise<void> {
    throw new Error('Not implemented');
  }

  write<V>(snapshot: Snapshot<V>): Promise<void> {
    throw new Error('Not implemented');
  }
}