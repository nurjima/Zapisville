"use strict"
$(window).on("load", function(){

    var preload = $('.preload');
    for (let i=0; i <= 24; ++i) {
        preload.append('<img src="img/diamond-'+i+'.png">');
    }
    preload.append('<img src="img/bomb.png">');
    preload.append('<img src="img/boom.png">');
    preload.append('<img src="img/select.png">');

   
});


