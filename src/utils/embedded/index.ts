
/* IMPORT */

import * as execa from 'execa';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from '../../config';
import AG from './providers/ag';
import JS from './providers/js';
import RG from './providers/rg';

/* EMBEDDED */

const Embedded = {

  async initProvider () {

    if ( Embedded.provider ) return;

    const {javascript, ag, rg} = Embedded.providers,
          provider = Config.get ().embedded.provider,
          Provider = provider ? await Embedded.providers[provider]() || javascript () : await ag () || await rg () || javascript ();

    Embedded.provider = new Provider ();

  },

  provider: undefined as JS | AG | RG,

  providers: {

    javascript () {

      return JS;

    },

    async ag () {

      try {

        await execa ( 'ag', ['--version'] );

        return AG;

      } catch ( e ) {}

    },

    async rg () {

      const config = Config.get (),
            lookaroundRe = /\(\?<?(!|=)/;

      if ( lookaroundRe.test ( config.embedded.providers.rg.regex ) ) {

        vscode.window.showErrorMessage ( 'ripgrep doesn\'t support lookaheads and lookbehinds, you have to update your "todo.embedded.providers.rg.regex" setting if you want to use ripgrep' );

        return;

      }

      try {

        await execa ( 'rg', ['--version'] );

        return RG;

      } catch ( e ) {}

      const name = /^win/.test ( process.platform ) ? 'rg.exe' : 'rg',
            basePath = path.dirname ( __dirname ),
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

  }

};

/* EXPORT */

export default Embedded;
