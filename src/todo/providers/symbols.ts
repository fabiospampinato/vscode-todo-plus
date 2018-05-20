
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../../consts';

/* SYMBOLS */

class Symbols implements vscode.DocumentSymbolProvider {

  provideDocumentSymbols ( textDocument: vscode.TextDocument ) {

    const lines = textDocument.getText ().split ( '\n' );

    return _.filter ( lines.map ( ( line, lineNr ) => {

      const match = line.match ( Consts.regexes.project );

      if ( !match ) return;

      const charNr = match[0].indexOf ( match[1] ),
            position = new vscode.Position ( lineNr, charNr ),
            location = new vscode.Location ( textDocument.uri, position );

      const parts = line.match ( Consts.regexes.projectParts ),
            idendation = parts[1].replace ( ' ', '\u00A0\u00A0' ), // Normal spaces get trimmed, replacing them with NBSP
            name = parts[2],
            description = _.trim ( parts[3] );

      return new vscode.SymbolInformation ( `${idendation}${name}`, vscode.SymbolKind.Namespace, description, location );


    }));

  }

}

/* EXPORT */

export default Symbols;
