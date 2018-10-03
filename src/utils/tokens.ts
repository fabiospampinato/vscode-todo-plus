/* IMPORT */

import Config from '../config';
import Time from './time';

function formatTime ( seconds: number, format = 'timekeeping.elapsed.format' ) : string {

  return seconds ? Time.diff ( Date.now () + seconds * 1000, undefined, Config.getKey ( format ) ) : '';

}

/* TOKENS */

export default class Tokens {

  comments = 0;
  projects = 0;
  tags = 0;
  pending = 0;
  done = 0;
  cancelled = 0;
  estSeconds = 0;
  lastedSeconds = 0;
  wastedSeconds = 0;

  get finished() { return this.cache ( 'finished', this.done + this.cancelled ); }
  get all() { return this.cache ( 'all', this.pending + this.finished ); }
  get percentage() { return this.cache ( 'percentage', this.all ? Math.round ( this.finished / this.all * 100 ) : 100 ); }
  get est() { return this.cache ( 'est', formatTime ( this.estSeconds, 'timekeeping.estimate.format' ) ); }
  get lasted() { return this.cache ( 'lasted', formatTime ( this.lastedSeconds ) ); }
  get wasted() { return this.cache ( 'wasted', formatTime ( this.wastedSeconds ) ); }
  get elapsed() { return this.cache ( 'elapsed', formatTime ( this.lastedSeconds + this.wastedSeconds ) ); }

  private cache < V > ( property: keyof Tokens, value: V ) {

    Object.defineProperty ( this, property, { value, enumerable: true } );
    return value;

  }

}

// Ensure all properties used in templates are enumerable, because renderer simply does `for (p in tokens)` to try all of them
[ 'finished', 'all', 'percentage', 'est', 'lasted', 'wasted', 'elapsed' ].forEach ( p => Object.defineProperty ( Tokens.prototype, p, { enumerable: true } ) );
