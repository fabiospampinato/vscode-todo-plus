//Control the Shift+enter command
const isShiftEnter = (function () {

  var flag = false;

  return function (operation: string) {

    if(operation == 'get')
      return flag;
    else if (operation == 'set')
      flag = !flag;

  }
})();

/* EXPORT */

export default isShiftEnter;