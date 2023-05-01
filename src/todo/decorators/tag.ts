
/* IMPORT */

import * as vscode from 'vscode';
import Consts from '../../consts';
import TagItem from '../items/tag';
import Line from './line';

/* DECORATION TYPES */

const SPECIAL_TAGS = Consts.tags.names.map((name, index) => {
  const colorIndex = index % Consts.colors.tags.background.length;
  return vscode.window.createTextEditorDecorationType({
    backgroundColor: Consts.colors.tags.background[colorIndex],
    color: Consts.colors.tags.foreground[colorIndex],
    borderRadius: '2px',
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    dark: {
      backgroundColor: Consts.colors.dark.tags.background[colorIndex],
      color: Consts.colors.dark.tags.foreground[colorIndex],
    },
    light: {
      backgroundColor: Consts.colors.light.tags.background[colorIndex],
      color: Consts.colors.light.tags.foreground[colorIndex],
    },
  });
});


const TAG = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.tag,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  dark: {
    color: Consts.colors.dark.tag
  },
  light: {
    color: Consts.colors.light.tag
  }
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
