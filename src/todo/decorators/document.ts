
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Comment from './comment';
import Project from './project';
import Done from './done';
import Cancel from './cancel';
import Code from './code';
import Tags from './tags';
import Style from './style';
import DocumentModule from '../document';
import Utils from '../../utils';

/* DOCUMENT */

class Document {

  static decorate ( textEditor: vscode.TextEditor = vscode.window.activeTextEditor ) {

    if ( !Utils.editor.isSupported ( textEditor ) ) return;

    const doc = new DocumentModule ( textEditor ),
          lines = doc.getLines (),
          codes = doc.getCodes (),
          comments = doc.getComments (),
          projects = doc.getProjects (),
          todosDone = doc.getTodosDone (),
          todosCancel = doc.getTodosCancel ();

    const decorations = Document.getDecorations ( lines, codes, comments, projects, todosDone, todosCancel );

    decorations.forEach ( ({ type, ranges }) => textEditor.setDecorations ( type, ranges ) );

  }

  static getDecorations ( lines, codes, comments, projects, todosDone, todosCancel ) {

    return _.concat (
      new Tags ().getDecorations ( lines ),
      new Code ().getDecorations ( codes ),
      new Comment ().getDecorations ( comments ),
      new Project ().getDecorations ( projects ),
      new Done ().getDecorations ( todosDone ),
      new Cancel ().getDecorations ( todosCancel ),
      new Style ().getDecorations ( lines )
    );

  }

}

/* EXPORT */

export default Document;
