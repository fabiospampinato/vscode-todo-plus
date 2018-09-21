
/* IMPORT */

import * as _ from 'lodash';
import stringMatches from 'string-matches';
import * as vscode from 'vscode';
import Consts from '../consts';
import Utils from '../utils';
import {Line, Archive, Comment, Formatted, Project, Tag, Todo, TodoBox, TodoFinished, TodoDone, TodoCancelled} from './items';

/* DOCUMENT */

class Document {

  textEditor?: vscode.TextEditor;
  textDocument?: vscode.TextDocument;
  text?: string;

  constructor ( res: string | vscode.TextEditor | vscode.TextDocument ) {

    if ( _.isString ( res ) ) {

      this.text = res;

    } else {

      if ( 'document' in res ) { // => vscode.TextEditor

        this.textEditor = res as vscode.TextEditor; //TSC
        this.textDocument = this.textEditor.document;

      } else { // => vscode.TextDocument

        this.textEditor = vscode.window.visibleTextEditors.find ( te => te.document === res ) || vscode.window.activeTextEditor;
        this.textDocument = res as vscode.TextDocument; //TSC

      }

    }

  }

  /* GET */

  getItems ( Item: typeof Line | typeof Archive | typeof Comment | typeof Formatted | typeof Project | typeof Tag | typeof Todo | typeof TodoBox | typeof TodoFinished | typeof TodoDone | typeof TodoCancelled, regex: RegExp ) {

    const matchText = _.isString ( this.text ) ? this.text : this.textDocument.getText (),
          matches = stringMatches ( matchText, regex );

    return matches.map ( match => {
      return new Item ( this.textEditor, undefined, match );
    });

  }

  getItemAt ( Item: typeof Line | typeof Archive | typeof Comment | typeof Formatted | typeof Project | typeof Tag | typeof Todo | typeof TodoBox | typeof TodoFinished | typeof TodoDone | typeof TodoCancelled, lineNumber: number, checkValidity = true ) {

    const line = this.textDocument.lineAt ( lineNumber );

    if ( checkValidity && !Item.is ( line.text ) ) return;

    return new Item ( this.textEditor, line );

  }

  getLines () {

    return _.range ( this.textDocument.lineCount ).map ( lineNr => this.getLineAt ( lineNr ) );

  }

  getLineAt ( lineNr: number ) {

    return this.getItemAt ( Line, lineNr, false );

  }

  getArchive () {

    return this.getItems ( Archive, Consts.regexes.archive )[0];

  }

  getComments () {

    return this.getItems ( Comment, Consts.regexes.comment );

  }

  getCommentAt ( lineNumber: number, checkValidity? ) {

    return this.getItemAt ( Comment, lineNumber, checkValidity );

  }

  getFormatted () {

    return this.getItems ( Formatted, Consts.regexes.formatted );

  }

  getProjects () {

    return this.getItems ( Project, Consts.regexes.project );

  }

  getProjectAt ( lineNumber: number, checkValidity? ) {

    return this.getItemAt ( Project, lineNumber, checkValidity );

  }

  getTags () {

    return this.getItems ( Tag, Consts.regexes.tagSpecialNormal );

  }

  getTodos () {

    return this.getItems ( Todo, Consts.regexes.todo );

  }

  getTodoAt ( lineNumber: number, checkValidity? ) {

    return this.getItemAt ( Todo, lineNumber, checkValidity );

  }

  getTodosBox () {

    return this.getItems ( TodoBox, Consts.regexes.todoBox );

  }

  getTodoBoxAt ( lineNumber: number, checkValidity? ) {

    return this.getItemAt ( TodoBox, lineNumber, checkValidity );

  }

  getTodosBoxStarted () {

    return this.getItems ( TodoBox, Consts.regexes.todoBoxStarted );

  }

  getTodosDone () {

    return this.getItems ( TodoDone, Consts.regexes.todoDone );

  }

  getTodoDoneAt ( lineNumber: number, checkValidity? ) {

    return this.getItemAt ( TodoDone, lineNumber, checkValidity );

  }

  getTodosCancelled () {

    return this.getItems ( TodoCancelled, Consts.regexes.todoCancelled );

  }

  getTodoCancelledAt ( lineNumber: number, checkValidity? ) {

    return this.getItemAt ( TodoCancelled, lineNumber, checkValidity );

  }

  getTodosFinished () {

    return this.getItems ( TodoFinished, Consts.regexes.todoFinished );

  }

  getTodoFinishedAt ( lineNumber: number, checkValidity? ) {

    return this.getItemAt ( TodoFinished, lineNumber, checkValidity );

  }


  /* IS */

  isSupported () {

    return Utils.editor.isSupported ( this.textEditor );

  }

}

/* EXPORT */

export default Document;
