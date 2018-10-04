/* IMPORT */

import Config from '../config';
import Time from './time';

/* CACHED COMPUTED PROPERTY */

function cached ( target: object, property: string, descriptor: PropertyDescriptor ) { //TODO: Maybe replace this with _.memoize

  const getter = descriptor.get;

  descriptor.get = function () {

    const value = getter.call ( this );

    Object.defineProperty ( this, property, { value } );

    return value;

  };

}

/* STATISTICS TOKENS */

class StatisticsTokens {

  static supported = ['comments', 'projects', 'tags', 'pending', 'done', 'cancelled', 'finished', 'all', 'percentage', 'est', 'lasted', 'wasted', 'elapsed'];

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
  get finished () {
    return this.done + this.cancelled;
  }

  @cached
  get all () {
    return this.pending + this.finished;
  }

  @cached
  get percentage () {
    return this.all ? Math.round ( this.finished / this.all * 100 ) : 100;
  }

  @cached
  get est () {
    return this.formatTime ( this.estSeconds, 'timekeeping.estimate.format' );
  }

  @cached
  get lasted () {
    return this.formatTime ( this.lastedSeconds, 'timekeeping.elapsed.format' );
  }

  @cached
  get wasted () {
    return this.formatTime ( this.wastedSeconds, 'timekeeping.elapsed.format' );
  }

  @cached
  get elapsed () {
    return this.formatTime ( this.lastedSeconds + this.wastedSeconds, 'timekeeping.elapsed.format' );
  }

  private formatTime ( seconds: number, format: string ) : string {
    return seconds ? Time.diff ( Date.now () + seconds * 1000, undefined, Config.getKey ( format ) ) : '';
  }

}

/* EXPORT */

export default StatisticsTokens;
