
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
}

/* EXPORT */

export default Project;
