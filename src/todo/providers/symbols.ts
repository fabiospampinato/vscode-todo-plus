
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../../consts';
import Utils from '../../utils';
import Document from '../document';

/* SYMBOLS */

class Symbols implements vscode.DocumentSymbolProvider {

  provideDocumentSymbols ( textDocument: vscode.TextDocument ) {

    const text = textDocument.getText (),
          projects = Utils.getAllMatches ( text, Consts.regexes.project ),
          projectsDatas = [];

    return projects.map ( project => {

      const parts = project[0].match ( Consts.regexes.projectParts ),
            indentation = parts[1].replace ( ' ', '\u00A0\u00A0' ), // Normal spaces get trimmed, replacing them with NBSP
            level = Utils.ast.getLevel ( parts[1] ),
            name = _.trim ( parts[2] );

      projectsDatas.push ({ indentation, level, name });

      const parent = _.findLast ( projectsDatas, data => data.level < level ),
            parentName = parent ? parent.name : null;

      const position = textDocument.positionAt ( project.index + parts[1].length ),
            location = new vscode.Location ( textDocument.uri, position );

      return new vscode.SymbolInformation ( `${indentation}${name}`, vscode.SymbolKind.Namespace, parentName, location );

    });

  }

}

/* EXPORT */

export default Symbols;
