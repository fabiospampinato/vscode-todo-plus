
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Comment from './comment';
import Project from './project';
import Done from './done';
import Cancel from './cancel';
import Tags from './tags';
import Style from './style';
import DocumentModule from '../document';
import Utils from '../../utils';

/* DOCUMENT */

class Document {

  static decorate ( textEditor: vscode.TextEditor = vscode.window.activeTextEditor ) {

    if ( !Utils.editor.isSupported ( textEditor ) ) return;

    const doc = new DocumentModule ( textEditor.document ),
          lines = doc.getLines (),
          comments = doc.getComments (),
          projects = doc.getProjects (),
          todos = doc.getTodos (),
          decorations = Document.getDecorations ( lines, comments, projects, todos );

    decorations.forEach ( ({ type, ranges }) => textEditor.setDecorations ( type, ranges ) );

  }

  static getDecorations ( lines, comments, projects, todos ) {

    return _.concat (
      new Tags ().getDecorations ( lines ),
      new Comment ().getDecorations ( comments ),
      new Project ().getDecorations ( projects ),
      new Done ().getDecorations ( todos ),
      new Cancel ().getDecorations ( todos ),
      new Style ().getDecorations ( lines )
    );

  }

}

/* EXPORT */

export default Document;
