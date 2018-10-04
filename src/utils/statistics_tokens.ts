/* IMPORT */

import Config from '../config';
import Time from './time';

/* CACHED COMPUTED PROPERTY */

function cached ( target: object, property: string, descriptor: PropertyDescriptor ) {

  const getter = descriptor.get;
  descriptor.get = function () {

    const value = getter.call ( this );
    Object.defineProperty ( this, property, { value });
    return value;

  }

}

/* TOKENS */

class Tokens {

  static supported: ( keyof Tokens )[] = [
    'comments', 'projects', 'tags', 'pending', 'done', 'cancelled',
    'finished', 'all', 'percentage',
    'est', 'lasted', 'wasted', 'elapsed',
  ];

  comments = 0;
  projects = 0;
  tags = 0;
  pending = 0;
  done = 0;
  cancelled = 0;
  estSeconds = 0;
  lastedSeconds = 0;
  wastedSeconds = 0;

  @cached
  get finished() {

    return this.done + this.cancelled;

  }

  @cached
  get all() {

    return this.pending + this.finished;

  }

  @cached
  get percentage() {

    return this.all ? Math.round ( this.finished / this.all * 100 ) : 100 ;

  }

  @cached
  get est() {

    return this.formatTime ( this.estSeconds, 'timekeeping.estimate.format' );

  }

  @cached
  get lasted() {

    return this.formatTime ( this.lastedSeconds );

  }

  @cached
  get wasted() {

    return this.formatTime ( this.wastedSeconds );

  }

  @cached
  get elapsed() {

    return this.formatTime ( this.lastedSeconds + this.wastedSeconds );

  }

  private formatTime ( seconds: number, format = 'timekeeping.elapsed.format' ) : string {

    return seconds ? Time.diff ( Date.now () + seconds * 1000, undefined, Config.getKey ( format ) ) : '';

  }

}

export default Tokens;
