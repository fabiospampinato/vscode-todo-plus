
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Code from '../items/code';
import Comment from '../items/comment';
import LineItem from '../items/line';
import Project from '../items/project';
import Todo from '../items/todo';
import Utils from '../../utils';

/* LINE */

class Line {

  TYPES = [];

  /* RANGE */

  getRange ( textLine: vscode.TextLine, startCharacter: number, endCharacter: number ): vscode.Range {

    if ( startCharacter < 0 || endCharacter < 0 ) return;

    const line = textLine.range.start.line;

    return new vscode.Range ( line, startCharacter, line, endCharacter );

  }

  getRangesRegex ( textLine: vscode.TextLine, posRegex: RegExp, negRegex?: RegExp | RegExp[], negRange?: vscode.Range | vscode.Range[] ): vscode.Range[] {

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
          posRanges = Utils.matches2ranges ( posMatches );

    if ( !posRanges.length ) return []; // Early exit //TSC

    let ranges = posRanges,
        negRanges = _.castArray ( negRange || [] ).filter ( range => range.line === textLine.lineNumber );

    if ( negRegex ) { // Getting negative ranges from negative regexes

      _.castArray ( negRegex ).forEach ( negRegex => {

        const negMatches = Utils.getAllMatches ( textLine.text, negRegex );

        negRanges = negRanges.concat ( Utils.matches2ranges ( negMatches ) );

      });

    }

    if ( negRanges.length ) { // Filtering out negative ranges

      ranges = rangesDifference ( ranges, negRanges, textLine.text.length );

    }

    return ranges.map ( ({ start, end }) => this.getRange ( textLine, start, end ) ) ;

  }

  /* ITEMS */

  getRanges ( items: Todo[] | Project[] | Code[] | Comment[] | LineItem[], negRange?: vscode.Range | vscode.Range[] ) {

    const ranges = (items.map as any)( item => this.getItemRanges ( item, negRange ) ), //TSC
          zipped = _.zip ( ...ranges ),
          compact = zipped.map ( _.compact ),
          concat = compact.map ( r => _.concat ( [], ...r ) );

    return concat;

  }

  getItemRanges ( item: Todo | Project | Code | Comment | LineItem, negRange?: vscode.Range | vscode.Range[] ): vscode.Range[] | vscode.Range[][] {

    return [item.range];

  }

  getDecorations ( items: Todo[] | Project[] | Code[] | Comment[] | LineItem[], negRange?: vscode.Range | vscode.Range[] ) {

    let ranges = this.getRanges ( items, negRange );

    return this.TYPES.map ( ( type, index ) => ({
      type,
      ranges: ranges[index] || []
    }));

  }

}

/* EXPORT */

export default Line;
