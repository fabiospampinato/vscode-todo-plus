
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

  getItemRanges ( project: ProjectItem, negRange?: vscode.Range | vscode.Range[] ) {

    return [this.getRangesRegex ( project.startLine, Consts.regexes.project, Consts.regexes.tag, negRange )];

  }

}

/* EXPORT */

export default Project;
