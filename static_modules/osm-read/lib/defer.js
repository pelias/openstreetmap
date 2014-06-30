
var defer = function( total, done ){
    var c = 0;

    return function(){
        if( ++c === total ){
            done();
        }
    }
}

module.exports = defer;