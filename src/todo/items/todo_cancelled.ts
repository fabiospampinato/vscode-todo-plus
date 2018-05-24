
/* IMPORT */

import Consts from '../../consts';
import Item from './item';
import Todo from './todo';

/* TODO CANCELLED */

class TodoCancelled extends Todo {

  static is ( str: string ) {

    return Item.is ( str, Consts.regexes.todoCancelled );

  }

}

/* EXPORT */

export default TodoCancelled;
