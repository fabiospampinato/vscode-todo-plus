
/* IMPORT */

import * as vscode from 'vscode';
import archive from './archive';
import ast from './ast';
import command from './command'
import editor from './editor';
import embedded from './embedded';
import file from './file';
import folder from './folder';
import init from './init';
import regex from './regex';
import time from './time';
import todo from './todo';
import statistics from './statistics';
import view from './view';

/* UTILS */

const Utils = {
  context: <vscode.ExtensionContext> undefined,
  archive,
  ast,
  command,
  editor,
  embedded,
  file,
  folder,
  init,
  regex,
  time,
  todo,
  statistics,
  view
};

/* EXPORT */

export default Utils;
