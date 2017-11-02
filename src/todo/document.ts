
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Line from './items/line';
import Code from './items/code';
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

  getItems ( Item: typeof Todo | typeof Project | typeof Comment | typeof Line, regex: RegExp ) {

    const matches = Utils.getAllMatches ( this.textDocument.getText (), regex );

    return matches.map ( match => {

      const range = Utils.match2range ( match ),
            startPos = this.textDocument.positionAt ( range.start ),
            endPos = this.textDocument.positionAt ( range.end ),
            startLine = this.textDocument.lineAt ( startPos ),
            endLine = this.textDocument.lineAt ( endPos ),
            text = _.last ( match );

      return new Item ( this.textDocument, startPos, endPos, startLine, endLine, text );

    });

  }

  getItemAt ( Item: typeof Todo | typeof Project | typeof Comment, lineNumber: number ) { //FIXME: Doesn't really work with code blocks (code blocks not recognized and todos inside code blocks recognized)

    const line = this.textDocument.lineAt ( lineNumber );

    if ( !Item.is ( line.text ) ) return;

    return new Item ( this.textDocument, line.range.start, line.range.end, line, line, line.text  );

  }

  getLines () {

    return _.range ( this.textDocument.lineCount )
            .map ( lineNr => this.textDocument.lineAt ( lineNr ) )
            .map ( line => new Line ( this.textDocument, line.range.start, line.range.end, line, line, line.text ) );

  }

  getCodes () {

    return this.getItems ( Code, Consts.regexes.code );

  }

  getCodeAt ( lineNumber: number ) {

    return this.getItemAt ( Code, lineNumber );

  }

  getComments () {

    return this.getItems ( Comment, Consts.regexes.comment );

  }

  getCommentAt ( lineNumber: number ) {

    return this.getItemAt ( Comment, lineNumber );

  }

  getProjects () {

    return this.getItems ( Project, Consts.regexes.project );

  }

  getProjectAt ( lineNumber: number ) {

    return this.getItemAt ( Project, lineNumber );

  }

  getTodos () {

    return this.getItems ( Todo, Consts.regexes.todo );

  }

  getTodoAt ( lineNumber: number ) {

    return this.getItemAt ( Todo, lineNumber );

  }

  /* TAGS */

  static toTag ( tagName: string ): string {

    return `${Consts.symbols.tag}${tagName}`;

  }

}

/* EXPORT */

export default Document;
