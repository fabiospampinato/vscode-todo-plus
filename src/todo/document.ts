
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Line from './items/line';
import Comment from './items/comment';
import Project from './items/project';
import Todo from './items/todo';
import Consts from '../consts';
import Utils from '../utils';

/* DOCUMENT */

class Document {

  textDocument: vscode.TextDocument;

  constructor ( textDocument: vscode.TextDocument ) {

    this.textDocument = textDocument;

  }

  /* GET */

  getLines () {

    return _.range ( this.textDocument.lineCount )
            .map ( lineNr => this.textDocument.lineAt ( lineNr ) )
            .map ( line => new Line ( line ) );

  }

  getItems ( Item: typeof Todo | typeof Project | typeof Comment | typeof Line, regex: RegExp ) {

    const matches = Utils.getAllMatches ( this.textDocument.getText (), regex, true );

    return matches.map ( match => {

      const line = this.textDocument.lineAt ( this.textDocument.positionAt ( match.index + 1 ).line );

      return new Item ( line );

    });

  }

  getComments () {

    return this.getItems ( Comment, Consts.regexes.comment );

  }

  getProjects () {

    return this.getItems ( Project, Consts.regexes.project );

  }

  getTodos () {

    return this.getItems ( Todo, Consts.regexes.todo );

  }

  /* TAGS */

  static toTag ( tagName: string ): string {

    return `${Consts.symbols.tag}${tagName}`;

  }

}

/* EXPORT */

export default Document;
