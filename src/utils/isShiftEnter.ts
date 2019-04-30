//Control the Shift+enter command
const isShiftEnter = (function () {

  var flag = false;

  return function (operation: string) {

    if(operation == 'read')
      return flag;
    else if (operation == 'write')
      flag = !flag;

  }
})();

/* EXPORT */

export default isShiftEnter;