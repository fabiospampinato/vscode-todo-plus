
/* IMPORT */

import * as vscode from 'vscode';
import Consts from '../../consts';
import TagItem from '../items/tag';
import Line from './line';

/* DECORATION TYPES */

const SPECIAL_TAGS = Consts.tags.names.map ( ( name, index ) => vscode.window.createTextEditorDecorationType ({
  backgroundColor: Consts.tags.backgroundColors[index],
  color: Consts.tags.foregroundColors[index],
  borderRadius: '2px',
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
}));

const TAG = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.tag,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

/* TAG */

class Tag extends Line {

  TYPES = [...SPECIAL_TAGS, TAG];

  getItemRanges ( tag: TagItem ) {

    //FIXME: We are purposely not supporting tags inside code blocks, it's an uncommon case, we'll just be wasting some performance
    // this.TYPES.map ( ( type, index ) => tag.match[index + 1] && this.getRangeDifference ( tag.text, tag.range, [Consts.regexes.formattedCode] ) );
    return this.TYPES.map ( ( type, index ) => tag.match[index + 1] && tag.range );

  }

}

/* EXPORT */

export default Tag;
