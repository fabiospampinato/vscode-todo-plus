
/* IMPORT */

import * as execa from 'execa';
import Config from '../../../config';
import AG from './ag';

/* RG */ // ripgrep //URL: https://github.com/BurntSushi/ripgrep

class RG extends AG {

  static bin = 'rg';

  execa ( filePaths ) {

    const config = Config.get ();

    return execa ( RG.bin, ['--color', 'never', '--with-filename', '--pretty', ...config.embedded.providers.rg.args, config.embedded.providers.rg.regex, ...filePaths] );

  }

}

/* EXPORT */

export default RG;
