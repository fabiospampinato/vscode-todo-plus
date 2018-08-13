
/* IMPORT */

import Item from './item';

/* TODO */

class Todo extends Item {

  contextValue = 'todo';

  constructor ( obj, label, icon = false ) {

    super ( obj, label );

    this.tooltip = obj.code || obj.line;

    this.command = {
      title: 'Reveal',
      command: 'todo.viewRevealTodo',
      arguments: [this]
    };

    if ( icon ) {
      this.setTypeIcon ( obj.type );
    }

  }

}

/* EXPORT */

export default Todo;
