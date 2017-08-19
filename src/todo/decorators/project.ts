
/* IMPORT */

import * as vscode from 'vscode';
import Line from './line';
import ProjectItem from '../items/project';
import Consts from '../../consts';

/* PROJECT */

const PROJECT = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.project
});

class Project extends Line {

  TYPES = [PROJECT];

  getItemRanges ( project: ProjectItem ) {

    return [this.getRangesRegex ( project.line, Consts.regexes.project )];

  }

}

/* EXPORT */

export default Project;
