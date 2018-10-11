
//TODO: Publish as `time-diff` or something

/* IMPORT */

import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-precise-range-plugin';
import * as toTime from 'to-time';

/* TIME */

const Time = {

  diff ( to: Date | string | number, from: Date = new Date (), format: string = 'long' ) {

    const toSeconds = Time.diffSeconds ( to, from ),
          toDate = new Date ( from.getTime () + ( toSeconds * 1000 ) );

    switch ( format ) {
      case 'long': return Time.diffLong ( toDate, from );
      case 'short': return Time.diffShort ( toDate, from );
      case 'short-compact': return Time.diffShortCompact ( toDate, from );
      case 'clock': return Time.diffClock ( toDate, from );
      case 'seconds': return Time.diffSeconds ( toDate, from );
    }

  },

  diffLong ( to: Date, from: Date = new Date () ) {

    return moment['preciseDiff']( from, to );

  },

  diffShortRaw ( to: Date, from: Date = new Date () ) {

    const seconds = Math.round ( ( to.getTime () - from.getTime () ) / 1000 ),
          secondsAbs = Math.abs ( seconds ),
          sign = Math.sign ( seconds );

    let remaining = secondsAbs,
        parts = [];

    const sections: [string, number][] = [
      ['y', 31536000 ],
      ['w', 604800 ],
      ['d', 86400 ],
      ['h', 3600 ],
      ['m', 60 ],
      ['s', 1 ]
    ];

    sections.forEach ( ([ token, seconds ]) => {

      const times = Math.floor ( remaining / seconds );

      parts.push ({ times, token });

      remaining -= seconds * times;

    });

    return { parts, sign };

  },

  diffShort ( to: Date, from?: Date ) {

    const { parts, sign } = Time.diffShortRaw ( to, from );

    const shortParts = [];

    parts.forEach ( ({ times, token }) => {

      if ( !times ) return;

      shortParts.push ( `${times}${token}` );

    });

    return `${sign < 0 ? '-' : ''}${shortParts.join ( ' ' )}`;

  },

  diffShortCompact ( to: Date, from?: Date ) {

    return Time.diffShort ( to, from ).replace ( /\s+/g, '' );

  },

  diffClock ( to: Date, from?: Date ) {

    const { parts, sign } = Time.diffShortRaw ( to, from );

    const padTokens = ['h', 'm', 's'],
          clockParts = [];

    parts.forEach ( ({ times, token }) => {

      if ( !times && !clockParts.length ) return;

      clockParts.push ( `${padTokens.indexOf ( token ) >= 0 && clockParts.length ? _.padStart ( times, 2, '0' ) : times}` );

    });

    return `${sign < 0 ? '-' : ''}${clockParts.join ( ':' )}`;

  },

  diffSeconds ( to: Date | string | number, from: Date = new Date () ) {

    let toDate;

    if ( to instanceof Date ) {

      toDate = to;

    } else if ( _.isNumber ( to ) ) {

      toDate = new Date ( to );

    } else {

      to = to.replace ( / and /gi, ' ' );
      to = to.replace ( /(\d)(ms|s|m|h|d|w|y)(\d)/gi, '$1$2 $3' );

      if ( /^\s*\d+\s*$/.test ( to ) ) return 0;

      const sugar = require ( 'sugar-date' ); //TSC // Lazy import for performance

      if ( !toDate ) { // sugar + ` from now` //FIXME: Should be + ` from ${date.toString ()}` or something
        const date = sugar.Date.create ( `${to} from now` );
        if ( !_.isNaN ( date.getTime () ) ) {
          toDate = date;
        }
      }

      if ( !toDate ) { // sugar
        const date = sugar.Date.create ( to );
        if ( !_.isNaN ( date.getTime () ) ) {
          toDate = date;
        }
      }

      if ( !toDate ) { // to-time
        try {
          const milliseconds = toTime ( to ).milliseconds ();
          toDate = new Date ( from.getTime () + milliseconds );
        } catch ( e ) {}
      }

    }

    return toDate ? Math.round ( ( toDate.getTime () - from.getTime () ) / 1000 ) : 0;

  }

};

/* EXPORT */

export default Time;
