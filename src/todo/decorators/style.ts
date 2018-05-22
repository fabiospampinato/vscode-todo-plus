
/* IMPORT */

import * as vscode from 'vscode';
import Line from './line';
import LineItem from '../items/line';
import Config from '../../config';
import Consts from '../../consts';

/* STYLE */

const BOLD = vscode.window.createTextEditorDecorationType ({
  textDecoration: 'none; font-weight: bold;'
});

const ITALIC = vscode.window.createTextEditorDecorationType ({
  textDecoration: 'none; font-style: italic;'
});

const STRIKETHROUGH = vscode.window.createTextEditorDecorationType ({
  textDecoration: 'none; text-decoration: line-through;'
});

class Style extends Line {

  TYPES = [BOLD, ITALIC, STRIKETHROUGH];

  getItemRanges ( line: LineItem, negRange?: vscode.Range | vscode.Range[] ) {

    return [
      this.getRangesRegex ( line.startLine, Consts.regexes.bold, Consts.regexes.code, negRange ),
      this.getRangesRegex ( line.startLine, Consts.regexes.italic, Consts.regexes.code, negRange ),
      this.getRangesRegex ( line.startLine, Consts.regexes.strikethrough, Consts.regexes.code, negRange )
    ];

  }

  getDecorations ( items?: LineItem[], negRange?: vscode.Range | vscode.Range[] ) {

    if ( !Config.getKey ( 'formatting.enabled' ) ) return [];

    return super.getDecorations ( items, negRange );

  }

}

/* EXPORT */

export default Style;
