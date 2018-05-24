
/* IMPORT */

import Consts from '../../consts';
import Item from './item';

/* ARCHIVE */

class Archive extends Item {

  static is ( str: string ) {

    return super.is ( str, Consts.regexes.archive );

  }

}

/* EXPORT */

export default Archive;
