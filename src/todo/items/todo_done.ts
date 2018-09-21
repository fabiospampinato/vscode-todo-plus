
/* IMPORT */

import Consts from '../../consts';
import Item from './item';
import TodoFinished from './todo';

/* TODO DONE */

class TodoDone extends TodoFinished {

  static is ( str: string ) {

    return Item.is ( str, Consts.regexes.todoDone );

  }

}

/* EXPORT */

export default TodoDone;
