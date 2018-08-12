
/* IMPORT */

import * as execa from 'execa';
import * as fs from 'fs';
import * as path from 'path';
import Config from '../config';
import AG from './embedded_provider_ag';
import JS from './embedded_provider_js';
import RG from './embedded_provider_rg';

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

    try {

      execa.sync ( 'rg', ['--version'] );

      return RG;

    } catch ( e ) {}

    const name = /^win/.test ( process.platform ) ? 'rg.exe' : 'rg',
          basePath = path.dirname ( path.dirname ( require.main.filename ) ),
          filePaths = [
            path.join ( basePath, `node_modules/vscode-ripgrep/bin/${name}` ),
            path.join ( basePath, `node_modules.asar.unpacked/vscode-ripgrep/bin/${name}` )
          ];

    for ( let filePath of filePaths ) {

      if ( !fs.accessSync ( filePath ) ) continue;

      RG.bin = filePath;

      return RG;

    }

  }

};

/* PROVIDER */

const provider = Config.get ().embedded.provider,
      Provider = Providers[provider]() || Providers.javascript ();

/* EXPORT */

export default Provider;
