
/* IMPORT */

import Consts from '../../consts';
import Item from './item';
import Todo from './todo';

/* TODO DONE */

class TodoDone extends Todo {

  static is ( str: string ) {

    return Item.is ( str, Consts.regexes.todoDone );

  }

}

/* EXPORT */

export default TodoDone;
