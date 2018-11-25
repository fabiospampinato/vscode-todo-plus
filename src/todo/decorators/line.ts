
/* IMPORT */

import * as _ from 'lodash';
import stringMatches from 'string-matches';
import * as vscode from 'vscode';
import Utils from '../../utils';
import LineItem from '../items/line';

/* LINE */

class Line {

  TYPES = [];

  /* RANGE */

  parseRanges ( text: string, rangesRaw: vscode.Range | RegExp | vscode.Range[] | RegExp[] ) {

    let negRanges = _.flatten ( _.castArray ( rangesRaw as any ) ); //TSC

    return _.filter ( _.flatten ( negRanges.map ( neg => {

      if ( !neg ) return;

      if ( neg instanceof vscode.Range ) {

        return {
          start: neg.start.character,
          startLine: neg.start.line,
          end: neg.end.character,
          endLine: neg.end.line
        };

      } else if ( neg instanceof RegExp ) {

        const matches = stringMatches ( text, neg ),
              ranges = Utils.regex.matches2ranges ( matches );

        return ranges;

      }

    })));

  }

  getRangeDifference ( text: string, posRange: vscode.Range, negRangesRaw: vscode.Range | RegExp | vscode.Range[] | RegExp[] = [] ) {

    const posOffset = posRange.start.character;

    /* NEGATIVE RANGES */

    const negRanges = this.parseRanges ( text, negRangesRaw ).filter ( range => range && range.start < range.end && ( !range['line'] || range['line'] === posRange.start.line ) ); //TSC

    /* DIFFERENCE */

    if ( !negRanges.length ) return [posRange];

    // Algorithm:
    // 1. All cells start unfilled
    // 2. Filling all the positive cells
    // 3. Unfilling all the negative cells
    // 4. Transforming consecutive positive cells to ranges

    const cells = Array ( posOffset + text.length ); // 1.

    _.fill ( cells, true, posRange.start.character, posRange.end.character ); // 2.

    negRanges.forEach ( ({ start, end }) => _.fill ( cells, false, posOffset + start, posOffset + end ) ); // 3.

    const ranges: vscode.Range[] = [];

    let start = null,
        end = null;

    for ( let i = 0, l = cells.length; i < l; i++ ) { // 4.

      const cell = cells[i];

      if ( start === null ) {
        if ( cell ) start = i;
      } else {
        if ( !cell ) end = i;
      }

      if ( start !== null && ( end !== null || i === l - 1 ) ) { //FIXME: What if there's only 1 character?
        end = end !== null ? end : l;
        ranges.push ( new vscode.Range ( posRange.start.line, start, posRange.start.line, end ) );
        start = null;
        end = null;
      }

    }

    return ranges;

  }

  /* ITEMS */

  getItemRanges ( item: LineItem, negRanges?: vscode.Range | vscode.Range[] | RegExp | RegExp[] ) {

    return _.isEmpty ( negRanges ) ? [item.range] : [this.getRangeDifference ( item.text, item.range, negRanges )];

  }

  getItemsRanges ( items: LineItem[], negRanges?: vscode.Range | vscode.Range[] | RegExp | RegExp[] ) {

    const ranges = items.map ( item => this.getItemRanges ( item, negRanges ) ),
          zipped = _.zip ( ...ranges as any ), //TSC
          compact = zipped.map ( _.compact ),
          concat = compact.map ( r => _.concat ( [], ...r ) );

    return concat;

  }

  getDecorations ( items: LineItem[], negRanges?: vscode.Range | vscode.Range[] | RegExp | RegExp[] ) {

    let ranges = this.getItemsRanges ( items, negRanges );

    return this.TYPES.map ( ( type, index ) => ({
      type,
      ranges: ranges[index] || []
    }));

  }

}

/* EXPORT */

export default Line;
