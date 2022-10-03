
/* IMPORT */

import Consts from '../../consts';
import Item from './item';
import Todo from './todo';

/* TODO STARTED */

class TodoStarted extends Todo {

  static is ( str: string ) {

    return Item.is ( str, Consts.regexes.todoBoxStarted );

  }

}

/* EXPORT */

export default TodoStarted;