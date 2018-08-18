
/* IMPORT */

import * as execa from 'execa';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from '../../config';
import AG from './providers/ag';
import JS from './providers/js';
import RG from './providers/rg';

/* PROVIDERS */

const Providers = {

  javascript () {

    return JS;

  },

  ag () {

    try {

      execa.sync ( 'ag', ['--version'] );

      return AG;

    } catch ( e ) {}

  },

  rg () {

    const config = Config.get (),
          lookaroundRe = /\(\?<?(!|=)/;

    if ( lookaroundRe.test ( config.embedded.providers.rg.regex ) ) {

      vscode.window.showErrorMessage ( 'ripgrep doesn\'t support lookaheads and lookbehinds, you have to update your "todo.embedded.providers.rg.regex" setting if you want to use ripgrep' );

      return;

    }

    try {

      execa.sync ( 'rg', ['--version'] );

      return RG;

    } catch ( e ) {}

    const name = /^win/.test ( process.platform ) ? 'rg.exe' : 'rg',
          basePath = path.dirname ( path.dirname ( require.main.filename ) ),
          filePaths = [
            path.join ( basePath, `node_modules.asar.unpacked/vscode-ripgrep/bin/${name}` ),
            path.join ( basePath, `node_modules/vscode-ripgrep/bin/${name}` )
          ];

    for ( let filePath of filePaths ) {

      try {

        fs.accessSync ( filePath );

        RG.bin = filePath;

        return RG;

      } catch ( e ) {}

    }

  }

};

/* PROVIDER */

const provider = Config.get ().embedded.provider,
      Provider: typeof JS | typeof AG | typeof RG = provider ? Providers[provider]() || Providers.javascript () : Providers.ag () || Providers.rg () || Providers.javascript ();

/* EXPORT */

export default new Provider ();
