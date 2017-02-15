export class Exception extends Error {
  constructor(msg: string, private innerException?: Error) {
    super(msg);
  }

  public get stack(): string {
    if (this.innerException) {
      return `${super.stack} -> ${this.innerException.stack}`;
    }

    return super.stack;
  }
}