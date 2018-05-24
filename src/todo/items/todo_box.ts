
/* IMPORT */

import Consts from '../../consts';
import Item from './item';
import Todo from './todo';

/* TODO BOX */

class TodoBox extends Todo {

  static is ( str: string ) {

    return Item.is ( str, Consts.regexes.todoBox );

  }

}

/* EXPORT */

export default TodoBox;
