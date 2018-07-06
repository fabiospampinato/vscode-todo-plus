
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../../consts';
import Utils from '../../utils';
import Document from '../document';

/* SYMBOLS */

class Symbols implements vscode.DocumentSymbolProvider {

  provideDocumentSymbols ( textDocument: vscode.TextDocument ) {

    const doc = new Document ( textDocument ),
          projects = doc.getProjects (),
          projectsDatas = [],
          symbols = [];

    projects.forEach ( project => {

      const parts = project.line.text.match ( Consts.regexes.projectParts ),
            level = Utils.ast.getLevel ( parts[1] ),
            name = _.trim ( parts[2] ),
            parentData = _.findLast ( projectsDatas, data => data.level < level ) || {},
            { symbol: parentSymbol } = parentData,
            symbol = new vscode.DocumentSymbol ( name, undefined, vscode.SymbolKind.Field, project.range, project.range );

      projectsDatas.push ({ level, name, symbol });

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
