
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
          projectsDatas = [];

    return projects.map ( ( project, i ) => {

      const parts = project.line.text.match ( Consts.regexes.projectParts ),
            indentation = parts[1].replace ( ' ', '\u00A0\u00A0' ), // Normal spaces get trimmed, replacing them with NBSP
            level = Utils.ast.getLevel ( parts[1] ),
            name = _.trim ( parts[2] ),
            parentData = _.findLast ( projectsDatas, data => data.level < level ),
            parentName = parentData ? parentData.name : null;

      projectsDatas.push ({ level, name });

      const location = new vscode.Location ( textDocument.uri, project.range.start );

      return new vscode.SymbolInformation ( `${indentation}${name}`, vscode.SymbolKind.Field, parentName, location );

    });

  }

}

/* EXPORT */

export default Symbols;
