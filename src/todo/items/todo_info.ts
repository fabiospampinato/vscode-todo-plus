
/* IMPORT */

import Consts from '../../consts';
import Item from './item';
import Todo from './todo';

/* TODO INFO */

class TodoInfo extends Todo {

  static is ( str: string ) {

    return Item.is ( str, Consts.regexes.todoInfo );

  }

}

/* EXPORT */

export default TodoInfo;