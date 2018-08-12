
/* IMPORT */

import * as execa from 'execa';
import Consts from '../consts';
import EmbeddedProviderAG from './embedded_provider_ag';

/* EMBEDDED PROVIDER RG */

// RG = ripgrep //URL: https://github.com/BurntSushi/ripgrep

class EmbeddedProviderRG extends EmbeddedProviderAG {

  static bin = 'rg';

  execa ( filePaths ) {

    return execa ( EmbeddedProviderRG.bin, ['--color', 'never', '--pretty', '--ignore-case', Consts.regexes.todoEmbedded.source, ...filePaths] );

  }

}

/* EXPORT */

export default EmbeddedProviderRG;
