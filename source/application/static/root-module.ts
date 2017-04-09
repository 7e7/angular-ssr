import {
  CallExpression,
  Identifier,
  Program,
  PropertyAccessExpression,
  SourceFile,
  SyntaxKind,
} from 'typescript';

import {dirname, relative, resolve} from 'path';

import {ModuleDeclaration} from '../project';

import {StaticAnalysisException} from '../../exception';

import {traverse} from './traverse';

import {
  Files,
  bootstrap,
  bootstrapFactory,
  ngModule
} from '../../static';

export const discoverRootModule = (basePath: string, program: Program): ModuleDeclaration => {
  const expression = new RegExp(`(\.${bootstrap}|\.${bootstrapFactory}|${ngModule})`);

  const candidates = new Array<ModuleDeclaration>();

  for (const sourceFile of program.getSourceFiles()) {
    if (isExternal(sourceFile) || expression.test(sourceFile.text) === false) { // broad filter, performance optimization
      continue;
    }

    const bootstrapIdentifiers = new Set<string>();

    traverse<CallExpression>(sourceFile, SyntaxKind.CallExpression,
      node => {
        if (node.expression.kind !== SyntaxKind.PropertyAccessExpression) {
          return false;
        }
        const pae = <PropertyAccessExpression> node.expression;
        if (pae.name.kind !== SyntaxKind.Identifier) {
          return false;
        }
        switch (pae.name.text) {
          case bootstrap:
          case bootstrapFactory:
            if (node.arguments.length === 0 || node.arguments[0].kind !== SyntaxKind.Identifier) {
              break;
            }
            bootstrapIdentifiers.add(defactory((<Identifier> node.arguments[0]).text));
        }
        return false;
      });

    for (const identifier of Array.from(bootstrapIdentifiers)) {
      const imported = importClause(basePath, sourceFile, identifier);
      if (imported) {
        candidates.push(imported);
      }
      else {
        const declaration = exportClause(basePath, sourceFile, identifier);
        if (declaration) {
          invalidPairing(sourceFile, identifier);
        }
      }
    }
  }

  switch (candidates.length) {
    case 0:
      throw new StaticAnalysisException('No root @NgModule discovered (an NgModule which is passed to a bootstrap function) (use the CLI or API options instead)');
    case 1:
      return candidates[0];
    default:
      throw new StaticAnalysisException(`Multiple root @NgModule discovered, cannot determine the correct one (${formatCandidates(candidates)})`);
  }
};

const exportClause = (basePath: string, sourceFile: SourceFile, identifier: string): ModuleDeclaration => {
  const exports: Map<string, any> = sourceFile['symbol'].exports;

  for (const exportIdentifier of Array.from(exports.keys())) {
    if (exportIdentifier === identifier) {
      return {
        source: relative(basePath, sourceFile.fileName),
        symbol: exportIdentifier,
      };
    }
  }

  return null;
};

const importClause = (basePath: string, sourceFile: SourceFile, identifier: string): ModuleDeclaration => {
  for (const statement of sourceFile['imports']) {
    if (statement.parent == null ||
        statement.parent.importClause == null ||
        statement.parent.importClause.namedBindings == null) {
      continue;
    }
    for (const clause of statement.parent.importClause.namedBindings.elements || []) {
      if (clause.name == null) {
        continue;
      }
      if (defactory(clause.name.text) === identifier) {
        return {
          source: relativeImportPath(basePath, sourceFile.fileName, statement.text),
          symbol: identifier,
        };
      }
    }
  }
  return null;
};

const defactory = (identifier: string) => identifier.replace(/NgFactory/, String());

const externalExpr = new RegExp(`(\\|\/)${Files.modules}(\\|\/)`);

const isExternal = (file: SourceFile): boolean => externalExpr.test(file.fileName);

const relativeImportPath = (basePath: string, filename: string, relativePath: string) =>
  relative(basePath, resolve(dirname(filename), relativePath));

const formatCandidates = (candidates: Array<ModuleDeclaration>) => candidates.map(m => `${m.symbol} in ${m.source}`).join(', and ');

const invalidPairing = (sourceFile: SourceFile, identifier: string): void => {
  const descriptions = [
    'Pairing bootstrapModule or bootstrapModuleFactory with the root @NgModule in the same file will not work',
    'Otherwise it is impossible to import that module without bootstrapping the application',
    `You must extract "${identifier}" from ${sourceFile.fileName} and export it from a separate file for this to work`
  ];
  throw new StaticAnalysisException(descriptions.join('. '));
};
