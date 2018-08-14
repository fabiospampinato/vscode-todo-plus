
/* IMPORT */

import * as execa from 'execa';
import Consts from '../../../consts';
import AG from './ag';

/* RG */ // ripgrep //URL: https://github.com/BurntSushi/ripgrep

class RG extends AG {

  static bin = 'rg';

  execa ( filePaths ) {

    return execa ( RG.bin, ['--color', 'never', '--with-filename', '--pretty', '--ignore-case', Consts.regexes.todoEmbedded.source, ...filePaths] );

  }

}

/* EXPORT */

export default RG;
