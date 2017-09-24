
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

  getRangesRegex ( textLine: vscode.TextLine, posRegex: RegExp, negRegex?: RegExp ) {

    function matches2ranges ( matches ) {
      return matches.map ( match => {
        const end = match.index + match[0].length,
              start = end - _.last ( match ).length;
        return { start, end };
      });
    }

    function rangesDifference ( pos, neg, length ) {
      const cells = _.fill ( Array ( length ), false );
      pos.forEach ( ({ start, end }) => _.fill ( cells, true, start, end ) );
      neg.forEach ( ({ start, end }) => _.fill ( cells, false, start, end ) );
      const ranges = [];
      let start = null,
          end = null;
      for ( let i = 0, l = cells.length; i < l; i++ ) {
        const cell = cells[i];
        const asd = textLine.text[i];
        if ( start === null ) {
          if ( cell ) start = i;
        } else {
          if ( !cell ) end = i;
        }
        if ( start !== null && ( end !== null || i === l - 1 ) ) { //FIXME: What if there's only 1 character?
          end = end !== null ? end : l;
          ranges.push ({ start, end });
          start = null;
          end = null;
        }
      }
      return ranges;
    }

    const posMatches = Utils.getAllMatches ( textLine.text, posRegex ),
          posRanges = matches2ranges ( posMatches );

    let ranges = posRanges;

    if ( posRanges.length && negRegex ) {

      const negMatches = Utils.getAllMatches ( textLine.text, negRegex ),
            negRanges = matches2ranges ( negMatches );

      if ( negRanges.length ) {

        ranges = rangesDifference ( posRanges, negRanges, textLine.text.length );

      }

    }

    return ranges.map ( ({ start, end }) => this.getRange ( textLine, start, end ) );

  }

  /* ITEMS */

  getRanges ( items: Todo[] | Project[] | Comment[] | LineItem[] ) {

    const ranges = (items.map as any)( this.getItemRanges.bind ( this ) ), //TSC
          zipped = _.zip ( ...ranges ),
          compact = zipped.map ( _.compact ),
          concat = compact.map ( r => _.concat ( [], ...r ) );

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
