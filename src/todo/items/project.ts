
/* IMPORT */

import Item from './item';
import Todo from './todo';
import Consts from '../../consts';

/* PROJECT */

class Project extends Item {

  static is ( str: string ) {

    return !Todo.is ( str ) && super.is ( str, Consts.regexes.project );

  }

}

/* EXPORT */

export default Project;
