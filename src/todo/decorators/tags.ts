
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Line from './line';
import Document from '../document';
import LineItem from '../items/line';
import Consts from '../../consts';

/* TAGS */

const {names, backgroundColors, foregroundColors} = Consts.tags;
const SPECIAL_TAGS = names.map ( ( name, index ) => vscode.window.createTextEditorDecorationType ({
  backgroundColor: backgroundColors[index],
  color: foregroundColors[index],
  borderRadius: '2px'
}));

const TAG = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.tag
});

class Tags extends Line {

  TYPES = [...SPECIAL_TAGS, TAG];

  getItemRanges ( line: LineItem ) {

    return [
      ...names.map ( name => {
        const tag = Document.toTag ( name ),
              regex = new RegExp ( `(?:^|[^a-zA-Z0-9])(${_.escapeRegExp ( tag )})(?![a-zA-Z])`, 'gm' );
        return this.getRangesRegex ( line.line, regex );
      }),
      this.getRangesRegex ( line.line, Consts.regexes.tag )
    ];

  }

}

/* EXPORT */

export default Tags;
