
/* IMPORT */

import Consts from '../../consts';
import Item from './item';
import TodoFinished from './todo';

/* TODO CANCELLED */

class TodoCancelled extends TodoFinished {

  static is ( str: string ) {

    return Item.is ( str, Consts.regexes.todoCancelled );

  }

}

/* EXPORT */

export default TodoCancelled;
