
/* IMPORT */

import * as _ from 'lodash';

/* REGEX */

const Regex = {

  test ( re: RegExp, str: string ) { // It works even if the `g` flag is set

    re.lastIndex = 0; // Ensuring it works also for regexes with the `g` flag

    return re.test ( str );

  },

  /* MATCHES */

  matches2ranges ( matches: RegExpMatchArray[] ) {

    return matches.map ( Regex.match2range );

  },

  match2range ( match: RegExpMatchArray ) {

    const first = match[0],
          last = _.findLast ( match, txt => txt && txt.length ) as string, //TSC
          start = match.index + first.indexOf ( last ),
          end = start + last.length;

    return {start, end};

  },

};

/* EXPORT */

export default Regex;
