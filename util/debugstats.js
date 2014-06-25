
module.exports = function( instream ){
  
  var stats = { start: new Date() };

  var oldOps = 0;
  setInterval( function(){
    var newOps = stats.indexed || 0;
    if( newOps ) stats.end = new Date();
    stats.iops = newOps - oldOps;
    oldOps = newOps;

  }, 1000 );

  var sInterval = setInterval( function(){
    stats.retry_rate = stats.retries ? ( stats.retries / stats.indexed ).toFixed(2) + '%' : 0;
    console.log( 'stats', JSON.stringify( stats, null, 2 ) );
    // console.log( 'throttle', instream.options.throttle );
  }, 500 );

  instream.on( 'error', function( err ){
    console.error( 'got stream error', err );
  });

  instream.on( 'stats', function( statsObj ){
    for( var attr in statsObj ){
      stats[attr] = statsObj[attr];
    }
  });
}