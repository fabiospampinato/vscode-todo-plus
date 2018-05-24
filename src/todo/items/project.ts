
/* IMPORT */

import Consts from '../../consts';
import Item from './item';

/* PROJECT */

class Project extends Item {

  static is ( str: string ) {

    return super.is ( str, Consts.regexes.project );

  }

}

/* EXPORT */

export default Project;
