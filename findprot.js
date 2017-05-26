
var levelup = require('level')

var db = levelup('./protdb')
var sha1 = require('sha1')



const seq = 'DEKSKLKDLEEFREYPEGQFLTTNQGVRVSETDMSLKAGERGPTLLEDFHFREKLTHFDH' +
    'ERIPERVVHARGTGAHGYFECYESMAEYTMASFLQEAGKKTPVFVRFSTVVGFRGSADTV' +
    'RDARGFATKFYTEDGNYDLVGNNIPVFFIQDAIKFPDLVHSIKPEPDDEMPQASAAHDTF' + 
    'WDFVASHY' 

var bytes = sha1(seq, { asBytes: true})

db.get(new Buffer(bytes), function(err, value) {

    console.log(arguments)

})



