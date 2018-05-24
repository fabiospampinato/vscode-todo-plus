
/* IMPORT */

import Consts from '../../consts';
import Item from './item';

/* FORMATTED */

class Formatted extends Item {

  isCode () {

    return Item.is ( this.text, Consts.regexes.formattedCode );

  }

  isBold () {

    return Item.is ( this.text, Consts.regexes.formattedBold );

  }

  isItalic () {

    return Item.is ( this.text, Consts.regexes.formattedItalic );

  }

  isStrikethrough () {

    return Item.is ( this.text, Consts.regexes.formattedStrikethrough );

  }

  static is ( str: string ) {

    return super.is ( str, Consts.regexes.formatted );

  }

}

/* EXPORT */

export default Formatted;
