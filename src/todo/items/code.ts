
/* IMPORT */

import Item from './item';
import Consts from '../../consts';

/* CODE */

class Code extends Item {

  static is ( str: string ) {

    return super.is ( str, Consts.regexes.code );

  }

}

/* EXPORT */

export default Code;
