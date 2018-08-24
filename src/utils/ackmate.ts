
/* IMPORT */

import * as _ from 'lodash';

/* ACKMATE */

const Ackmate = {

  newLineRe: /\r?\n/g,
  filePathRe: /^(?=\D):?([^]*)$/,
  matchLineRe: /^(\d+)(?:;\d+ \d+)?:([^]*)$/,

  normalizePath ( filePath ) {

    return filePath.replace ( /\\/g, '/' );

  },

  parse ( str ) {

    const lines = str.split ( Ackmate.newLineRe );

    let filePath, match;

    return _.compact ( lines.map ( line => {

      if ( match = line.match ( Ackmate.filePathRe ) ) {

        filePath = Ackmate.normalizePath ( match[1] );

      } else if ( match = line.match ( Ackmate.matchLineRe ) ) {

        return {
          filePath,
          lineNr: parseInt ( match[1] ) - 1, // 0-index
          line: match[2]
        };

      }

    }));

  }

};

/* EXPORT */

export default Ackmate;
