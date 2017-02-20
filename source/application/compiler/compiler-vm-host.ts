import {cwd} from 'process';

import {
  SourceFile,
  ScriptTarget,
  CompilerHost,
  ParsedCommandLine,
  createSourceFile,
  parseJsonConfigFileContent,
  readConfigFile,
} from 'typescript';

const {matchFiles} = require('typescript'); // does not exist in definition

import {DelegatingHost} from '@angular/tsc-wrapped/src/compiler_host';

import {fileFromString, pathFromString} from 'filesystem';

import {VirtualMachine} from './vm';

import {Project} from '../project';

export class CompilerVmHost extends DelegatingHost {
  public parsedCommandLine: ParsedCommandLine;

  constructor(
    private project: Project,
    private vm: VirtualMachine,
    private host: CompilerHost
  ) {
    super(host);

    this.parsedCommandLine = this.loadOptions();
  }

  private loadOptions(): ParsedCommandLine {
    const {config} = readConfigFile(this.project.tsconfig, f => fileFromString(f).content());

    const host = {
      useCaseSensitiveFileNames: true,
      fileExists: this.fileExists,
      readDirectory: this.readDirectory,
      readFile: this.readFile,
    };

    return parseJsonConfigFileContent(config, host, this.project.basePath);
  }

  readDirectory = (path: string, extensions: Array<string>, excludes: Array<string | RegExp>, includes: Array<string | RegExp>): Array<string> => {
    const traverse = (targetPath: string) => {
      const traversal = pathFromString(targetPath);

      const files = new Set([
        ...Array.from(traversal.files()),
        ...Array.from(this.vm.filenames(targetPath))
      ]);

      const directories = new Set<string>([
        ...Array.from(traversal.directories()),
        ...Array.from(this.vm.directories(targetPath))
      ]);

      return {files: Array.from(files), directories: Array.from(directories)};
    };

    return matchFiles(path, extensions, excludes, includes, false, cwd(), traverse);
  };

  getSourceFile = (filename: string, languageVersion: ScriptTarget, onError?: (message: string) => void): SourceFile => {
    let sourceFile = this.host.getSourceFile(filename, languageVersion, onError); // first due to cache
    if (sourceFile == null) {
      const content = this.vm.sourceCode(filename);
      if (content) {
        return createSourceFile(filename, content, languageVersion, true);
      }
    }
    return sourceFile;
  };

  readFile = (filename: string): string => {
    return this.vm.sourceCode(filename) || this.delegate.readFile(filename);
  };

  getDirectories = (path: string): Array<string> => {
    const directories = this.vm.directories(path);

    for (const realpath of this.host.getDirectories(path)) {
      directories.add(realpath);
    }

    return Array.from(directories);
  };

  fileExists = (filename: string): boolean => {
    return this.vm.filenames().has(filename) || this.host.fileExists(filename);
  };

  directoryExists = (directoryName: string): boolean => {
    return this.vm.directories().has(directoryName) || this.host.directoryExists(directoryName);
  };
}
