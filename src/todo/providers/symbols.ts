
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
          codes = Utils.getAllMatches ( text, Consts.regexes.code );

    const projectsFiltered = projects.filter ( project => !codes.find ( code => _.inRange ( project.index, code.index, code.index + code[0].length ) ) ); // Filtering out "projects" inside code blocks

    return projectsFiltered.map ( project => {

      const parts = project[0].match ( Consts.regexes.projectParts ),
            idendation = parts[1].replace ( ' ', '\u00A0\u00A0' ), // Normal spaces get trimmed, replacing them with NBSP
            name = _.trim ( parts[2] ),
            description = _.trim ( parts[3] );

      const position = textDocument.positionAt ( project.index + parts[1].length ),
            location = new vscode.Location ( textDocument.uri, position );

      return new vscode.SymbolInformation ( `${idendation}${name}`, vscode.SymbolKind.Namespace, description, location );

    });

  }

}

/* EXPORT */

export default Symbols;
