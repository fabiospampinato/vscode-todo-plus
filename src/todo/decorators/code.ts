
/* IMPORT */

import * as vscode from 'vscode';
import Line from './line';
import CodeItem from '../items/code';
import Consts from '../../consts';

/* CODE */

const CODE = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.code
});

class Code extends Line {
  TYPES = [CODE];
}

/* EXPORT */

export default Code;
