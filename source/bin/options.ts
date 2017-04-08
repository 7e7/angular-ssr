import commander = require('commander');

import chalk = require('chalk');

import {dirname, join, resolve} from 'path';

import {
  ConfigurationException,
  FileReference,
  FileType,
  PathReference,
  Project,
  fileFromString,
  fromJson,
  pathFromString,
  tsconfig,
} from '../index';

const {version} = require('../../package.json');

export interface CommandLineOptions {
  debug: boolean;
  project: Project;
  output: PathReference;
  templateDocument: string;
  transpilationWhitelist: Array<string>;
  webpack?: FileReference;
}

export const commandLineToOptions = (): CommandLineOptions => {
  const options = parseCommandLine();

  const path = pathFromString(options['project']);

  const tsconfig = tsconfigFromRoot(path);

  if (path.exists() === false) {
    throw new ConfigurationException(`Project path does not exist: ${path}`);
  }

  const source = options['module'];
  const symbol = options['symbol'];

  const project: Project = {
    applicationModule: {source, symbol},
    basePath: rootFromTsconfig(tsconfig),
    tsconfig,
    workingPath: pathFromString(process.cwd()),
  };

  const template = fileFromString(options['template']);

  if (template.exists() === false) {
    throw new ConfigurationException(`HTML template document does not exist: ${options['template']}`);
  }

  let outputString = options['output'];

  if (/^(\\|\/)/.test(outputString) === false) {
    outputString = join(process.cwd(), outputString);
  }

  if (options['ipc']) {
    console.error(chalk.red('IPC mode is not implemented yet'));
    process.exit(1);
  }

  const debug = options['debug'];

  const transpilationWhitelist = options['no-transpile'] || [];

  const output = pathFromString(outputString);

  const webpack = options['webpack'];

  return {
    debug,
    output,
    project,
    templateDocument: template.content(),
    transpilationWhitelist,
    webpack
  };
};

const addToTranspilerWhitelist = (lib: string, memo: Array<string>) => memo.concat(lib);

const parseCommandLine = () => {
  return commander
    .version(version)
    .description(chalk.green('Prerender Angular applications'))
    .option('-d, --debug Enable debugging (stack traces and so forth)', false)
    .option('-p, --project <path>', 'Path to tsconfig.json file or project root (if tsconfig.json lives in the root)', process.cwd())
    .option('-w, --webpack <config>', 'Optional path to webpack configuration file')
    .option('-t, --template <path>', 'HTML template document', 'dist/index.html')
    .option('-m, --module <path>', 'Path to root application module TypeScript file')
    .option('-s, --symbol <identifier>', 'Class name of application root module')
    .option('-t, --no-transpile <library>', 'Add library to the list of libraries that do not require transpilation', addToTranspilerWhitelist, [])
    .option('-o, --output <path>', 'Output path to write rendered HTML documents to', 'dist')
    .option('-a, --application <application ID>', 'Optional application ID if your CLI configuration contains multiple apps')
    .option('-i, --ipc', 'Send rendered documents to parent process through IPC instead of writing them to disk', false)
    .parse(process.argv);
};

const rootFromTsconfig = (tsconfig: FileReference): PathReference => {
  const parsed = fromJson<{extends?: string}>(tsconfig.content());

  if (parsed.extends) {
    return pathFromString(resolve(dirname(join(tsconfig.parent().toString(), parsed.extends))));
  }
  else {
    return tsconfig.parent();
  }
};

const tsconfigFromRoot = (fromRoot: PathReference): FileReference => {
  if (fromRoot.exists() === false) {
    throw new ConfigurationException(`Root path does not exist: ${fromRoot}`);
  }

  if (fromRoot.type() === FileType.File) {
    return fileFromString(fromRoot.toString());
  }

  for (const tsc of tsconfig) {
    const candidates = [
      fromRoot,
      ...Array.from(fromRoot.directories()),
      ...Array.from(fromRoot.parent().directories())
    ].filter(p => /(\\|\/)e2e(\\|\/)/.test(p.toString()) === false);

    return candidates.map(d => fileFromString(join(d.toString(), tsc))).find(c => c.exists());
  }

  throw new ConfigurationException(chalk.red(`Cannot find tsconfig in ${fromRoot} (tried ${tsconfig.join(' and ')}`));
};