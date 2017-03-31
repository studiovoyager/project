$(document).ready(function() {

    //Fixing 'use strict'
    'use strict';

    function add(num1, num2) {
      return num1 + num2;
    }

    console.log('this is main.js');

    //comparing with == generates a warning
    if ('testing' == 'testing') {
      console.log($);
    }

  });
