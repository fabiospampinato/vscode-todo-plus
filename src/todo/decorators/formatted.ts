
/* IMPORT */

import * as vscode from 'vscode';
import Config from '../../config';
import Consts from '../../consts';
import FormattedItem from '../items/formatted';
import Line from './line';

/* DECORATION TYPES */

const CODE = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.code,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  dark: {
    color: Consts.colors.dark.code
  },
  light: {
    color: Consts.colors.light.code
  }
});

const BOLD = vscode.window.createTextEditorDecorationType ({
  fontWeight: 'bold',
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

const ITALIC = vscode.window.createTextEditorDecorationType ({
  fontStyle: 'oblique',
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

const STRIKETHROUGH = vscode.window.createTextEditorDecorationType ({
  textDecoration: 'line-through',
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

/* FORMATTED */

class Formatted extends Line {

  TYPES = [CODE, BOLD, ITALIC, STRIKETHROUGH];

  getItemRanges ( formatted: FormattedItem ) {

    return this.TYPES.map ( ( type, index ) => formatted.match[index + 1] && [formatted.range] );

  }

}

/* EXPORT */

export default Formatted;
