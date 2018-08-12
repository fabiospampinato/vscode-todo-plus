
/* IMPORT */

import * as vscode from 'vscode';
import Consts from '../consts';

/* AST */

const AST = {

  getLevel ( str, indentation = Consts.indentation ) {

    let level = 0,
        index = 0;

    while ( index < str.length ) {
      if ( str.substr ( index, indentation.length ) === indentation ) {
        level++;
        index += indentation.length;
      } else if ( str[0] === '\t' ) {
        level++;
        index += 1;
      } else {
        break;
      }
    }

    return level;

  },

  /* WALK */

  walk ( textDocument: vscode.TextDocument, lineNr: number = 0, direction: number = 1, skipEmptyLines: boolean = true, strictlyMonotonic: boolean = false, callback: Function ) {

    // strictlyMonotonic: only go strictly up or down, don't process other elements at the same level

    const {lineCount} = textDocument;

    const startLine = lineNr >= 0 ? textDocument.lineAt ( lineNr ) : null,
          startLevel = startLine ? AST.getLevel ( startLine.text ) : -1;

    let prevLevel = startLevel,
        nextLine = lineNr + direction;

    while ( nextLine >= 0 && nextLine < lineCount ) {

      const line = textDocument.lineAt ( nextLine );

      if ( skipEmptyLines && ( !line.text || Consts.regexes.empty.test ( line.text ) ) ) {
        nextLine += direction;
        continue;
      }

      const level = AST.getLevel ( line.text );

      if ( direction > 0 && level < startLevel ) break;

      if ( strictlyMonotonic && ( ( direction > 0 && level <= prevLevel ) || ( direction < 0 && level >= prevLevel ) ) ) {
        nextLine += direction;
        continue;
      }

      if ( callback ({ startLine, startLevel, line, level }) === false ) break;

      prevLevel = level;
      nextLine += direction;

    }

  },

  walkDown ( textDocument: vscode.TextDocument, lineNr: number, skipEmptyLines: boolean, strictlyMonotonic: boolean, callback: Function ) {

    return AST.walk ( textDocument, lineNr, 1, skipEmptyLines, strictlyMonotonic, callback );

  },

  walkUp ( textDocument: vscode.TextDocument, lineNr: number, skipEmptyLines: boolean, strictlyMonotonic: boolean, callback: Function ) {

    return AST.walk ( textDocument, lineNr, -1, skipEmptyLines, strictlyMonotonic, callback );

  },

  walkChildren ( textDocument: vscode.TextDocument, lineNr: number, callback: Function ) {

    return AST.walkDown ( textDocument, lineNr, true, false, function ({ startLine, startLevel, line, level }) {

      if ( level <= startLevel ) return false;

      if ( level > ( startLevel + 1 ) ) return;

      callback.apply ( undefined, arguments );

    });

  }

};

/* EXPORT */

export default AST;
