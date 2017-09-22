
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

  getItemRanges ( line: LineItem ) {

    return [
      this.getRangesRegex ( line.line, Consts.regexes.bold ),
      this.getRangesRegex ( line.line, Consts.regexes.italic ),
      this.getRangesRegex ( line.line, Consts.regexes.strikethrough )
    ];

  }

  getDecorations ( items? ) {

    if ( !Config.getKey ( 'formatting.enabled' ) ) return [];

    return super.getDecorations ( items );

  }

}

/* EXPORT */

export default Style;
