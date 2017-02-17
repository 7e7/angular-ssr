import {getApplicationProject} from 'test-fixtures';

import {Compiler} from '../compiler';

xdescribe('Compiler', () => {
  it('should be able to build a TypeScript application and produce in-memory artifacts', async () => {
    const compiler =
      new Compiler(
        getApplicationProject(
          'test-fixtures/application-basic-inline',
          'BasicInlineApplication'));

    const module = await compiler.compile();
    expect(module).not.toBeNull();
    expect(typeof module).toBe('function');
  });
});
