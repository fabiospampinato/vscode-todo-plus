
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../consts';
import Utils from '../utils';
import Document from '../todo/document';

/* SYMBOLS */

class Symbols implements vscode.DocumentSymbolProvider {

  provideDocumentSymbols ( textDocument: vscode.TextDocument ) {

    const doc = new Document ( textDocument ),
          projects = doc.getProjects (),
          projectsDatas = [],
          symbols = [];

    projects.forEach ( project => {

      /* SYMBOL */

      const parts = project.line.text.match ( Consts.regexes.projectParts ),
            level = Utils.ast.getLevel ( textDocument, parts[1] ),
            name = _.trim ( parts[2] ),
            selectionRange = project.range,
            startLine = selectionRange.start.line,
            startCharacter = selectionRange.start.character;

      let endLine = startLine;

      Utils.ast.walkDown ( doc.textDocument, startLine, true, false, ({ startLevel, level, line }) => {
        if ( level <= startLevel ) return false;
        endLine = line.lineNumber;
      });

      const endCharacter = doc.textDocument.lineAt ( endLine ).range.end.character,
            fullRange = new vscode.Range ( startLine, startCharacter, endLine, endCharacter ),
            symbol = new vscode.DocumentSymbol ( name, undefined, vscode.SymbolKind.Field, fullRange, selectionRange );

      projectsDatas.push ({ level, name, symbol });

      /* PARENT */

      const parentData = _.findLast ( projectsDatas, data => data.level < level ) || {},
            { symbol: parentSymbol } = parentData;

      if ( parentSymbol ) {

        parentSymbol.children.push ( symbol );

      } else {

        symbols.push ( symbol );

      }

    });

    return symbols;

  }

}

/* EXPORT */

export default Symbols;
