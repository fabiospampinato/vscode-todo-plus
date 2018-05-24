
/* IMPORT */

import Consts from '../../consts';
import Item from './item';

/* TAG */

class Tag extends Item {

  isNormal () {

    return !this.isSpecial ();

  }

  isSpecial () {

    return Item.is ( this.text, Consts.regexes.tagSpecial );

  }

  static is ( str: string ) {

    return super.is ( str, Consts.regexes.tag );

  }

}

/* EXPORT */

export default Tag;
