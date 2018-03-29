
var levelup = require('level')

var db = levelup('./protdb')
var sha1 = require('sha1')

var express = require('express')
var bodyParser = require('body-parser')

var app = express()

app.use(bodyParser.raw({
    inflate: true,
    limit: '100kb',
    type: () => true
}))

app.post('/', (req, res) => {

        var seq = req.body.toString('utf8').trim().toUpperCase()

        var bytes = sha1(seq, { asBytes: true })

        console.log(req.headers['content-type'])
        console.log('lookup ' + seq)

        db.get(new Buffer(bytes), function(err, value) {

                if(err) {

                    res.send(JSON.stringify([]))

                } else {

                    res.send(
                        JSON.stringify(
                            value.split('\n').map(parseFastaHeader),
                            null, 2)
                    )
                }

        })

})

function parseFastaHeader(header) {

    const sections = header.split('|')

    var out = {
        db: sections[0],
        accession: sections[1],
        name:sections[2].split('OS=')[0].trim()
    }

    out.url = 'http://uniprot.org/uniprot/' + out.accession

    console.log(header)

    var re = /([A-Z][A-Z])=/g
    var arr = re.exec(header)

    while(true) {

        var next = re.exec(header)

        if(next) {
            out[mapKey(arr[1])] = header.substring(arr.index + 3, next.index).trim()
                arr = next
        } else {
            out[mapKey(arr[1])] = header.substring(arr.index + 3).trim()
            break
        }

    }

    return out

    function mapKey(key) {

        if(key === 'OS')
            return 'organism'

        if(key === 'GN')
            return 'gene'

        if(key === 'PE')
            return 'proteinExistence'

        if(key === 'SV')
            return 'sequenceVersion'

        return key

    }    
}

app.listen(6664)


