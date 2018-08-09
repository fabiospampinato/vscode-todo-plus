
/* IMPORT */

import * as _ from 'lodash';
import Item from './item';

/* TODO */

class Todo extends Item {

  contextValue = 'todo';

  constructor ( obj, label, icon = false ) {

    super ( obj, label );

    this.tooltip = _.trim ( obj.code );

    this.command = {
      title: 'Open',
      command: 'todo.viewOpenTodo',
      arguments: [this]
    };

    if ( icon ) {
      this.setTypeIcon ( obj.type );
    }

  }

}

/* EXPORT */

export default Todo;
