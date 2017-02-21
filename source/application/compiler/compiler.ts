import {NgModuleFactory} from '@angular/core';

import {
  CompilerHost,
  Program,
  createCompilerHost,
  createProgram,
} from 'typescript';

import {CompileOptions, loadProjectOptions} from './options';
import {CompilerException} from '../../exception';
import {CompilerVmHost} from './compiler-vm';
import {compileTemplates} from './compiler-ng';
import {CompilationEmit} from './emit';
import {Project} from '../project';
import {VirtualMachine} from './vm';
import {assertProgram, assertDiagnostics} from './diagnostics';

export class Compiler {
  private options: CompileOptions;

  constructor(private project: Project) {
    this.options = loadProjectOptions(project);

    if (project.rootModule == null ||
        !project.rootModule.source ||
        !project.rootModule.symbol) {
      throw new CompilerException('Compilation requires a source and symbol');
    }
  }

  async compile(): Promise<NgModuleFactory<any>> {
    const vm = new VirtualMachine();
    try {
      const emit = new CompilationEmit(this.project);

      emit.modules.subscribe(m => vm.defineModule(m.filename, m.moduleId, m.source));
      emit.sources.subscribe(s => vm.defineSource(s.filename, s.source));

      const [module, symbol] = await this.compileToVm(vm, emit);

      return this.requireModule(vm, module, symbol);
    }
    finally {
      vm.dispose();
    }
  }

  private async compileToVm(vm: VirtualMachine, emit: CompilationEmit): Promise<[string, string]> {
    const compilerHost = createCompilerHost(this.options.ts, true);

    const program = this.createProgram(this.options.rootSources, compilerHost);

    compilerHost.writeFile = (filename, data, writeByteOrderMark, onError?, sourceFiles?) => {
      emit.write(filename, data, sourceFiles);
    };

    const [metadataWriter, generatedModules] = await compileTemplates(this.options, program, compilerHost);

    const compilerVmHost = new CompilerVmHost(this.project, vm, metadataWriter, generatedModules);

    const vmoptions = compilerVmHost.vmoptions();

    const templatedProgram = this.createProgram(vmoptions.fileNames, compilerVmHost, program);

    const emitResult = templatedProgram.emit(undefined, compilerHost.writeFile, null, false);
    if (emitResult) {
      assertDiagnostics(emitResult.diagnostics);
    }

    return emit.rootModule(compilerVmHost, this.options.angular.basePath, vmoptions.options);
  }

  private createProgram(files: Array<string>, compilerHost: CompilerHost, previousProgram?: Program): Program {
    const program = createProgram(
      files,
      this.options.ts,
      compilerHost,
      previousProgram);

    assertProgram(program);

    return program;
  }

  private async requireModule(vm: VirtualMachine, source: string, symbol: string) {
    const requiredModule = vm.require(source);

    if (requiredModule[symbol] == null) {
      throw new CompilerException(`Module ${source} does not export a ${symbol} symbol`);
    }

    return requiredModule[symbol];
  }
}