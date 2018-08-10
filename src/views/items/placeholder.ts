
/* IMPORT */

import Item from './item';

/* PLACEHOLDER */

class Placeholder extends Item {

  contextValue = 'placeholder';

  constructor ( label ) {

    super ( undefined, label );

  }

}

/* EXPORT */

export default Placeholder;
