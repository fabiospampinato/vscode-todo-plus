
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Comment from '../items/comment';
import LineItem from '../items/line';
import Project from '../items/project';
import Todo from '../items/todo';
import Utils from '../../utils';

/* LINE */

class Line {

  TYPES = [];

  /* RANGE */

  getRange ( textLine: vscode.TextLine, startCharacter: number, endCharacter: number ) {

    if ( startCharacter < 0 || endCharacter < 0 ) return;

    const line = textLine.range.start.line;

    return new vscode.Range ( line, startCharacter, line, endCharacter );

  }

  getRangeLine ( textLine: vscode.TextLine ) {

    return this.getRange ( textLine, 0, textLine.range.end.character );

  }

  getRangesToken ( textLine: vscode.TextLine, token: string ) {

    const regex = new RegExp ( `(${_.escapeRegExp ( token )})`, 'gm' );

    return this.getRangesRegex ( textLine, regex );

  }

  getRangesRegex ( textLine: vscode.TextLine, regex: RegExp ) {

    const matches = Utils.getAllMatches ( textLine.text, regex, true );

    return matches.map ( match => this.getRange ( textLine, match.index, match.index + _.last ( match ).length ) );

  }

  /* ITEMS */

  getRanges ( items: Todo[] | Project[] | Comment[] | LineItem[] ) {

    const ranges = (items.map as any)( this.getItemRanges.bind ( this ) ), //TSC
          zipped = _.zip ( ...ranges ),
          compact = zipped.map ( _.compact ),
          concat = compact.map ( r => _.concat ( ...r ) );

    return concat;

  }

  getItemRanges ( item: Todo | Project | Comment | LineItem ) {}

  getDecorations ( items: Todo[] | Project[] | Comment[] | LineItem[] ) {

    const ranges = this.getRanges ( items );

    return this.TYPES.map ( ( type, index ) => ({
      type,
      ranges: ranges[index] || []
    }));

  }

}

/* EXPORT */

export default Line;
