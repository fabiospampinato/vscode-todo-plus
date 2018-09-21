
/* IMPORT */

import Consts from '../../consts';
import Item from './item';
import Todo from './todo';

/* TODO FINISHED */

class TodoFinished extends Todo {

  static is ( str: string ) {

    return Item.is ( str, Consts.regexes.todoFinished );

  }

}

/* EXPORT */

export default TodoFinished;
