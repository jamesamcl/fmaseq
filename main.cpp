#include <zlib.h>
#include <stdio.h>
#include <cassert>
#include <string>
#include "sha1.c"

#include <leveldb/db.h>


using namespace std;


static string getAccessionFromHeader(const char *header);


int main(int argc, char *argv[])
{
    leveldb::DB* db;
    leveldb::Options options;
    options.create_if_missing = true;
    leveldb::Status status = leveldb::DB::Open(options, "protdb", &db);
    assert(status.ok());


    gzFile fasta = gzopen(argv[1], "rb");

    if(fasta == NULL)
    {
        return 1;
    }


    size_t n_written = 0;

    enum {

        s_clear,
        s_in_header,
        s_in_seq

    } state = s_clear;


    char b;

    /*
    sha1nfo shaCtx;
    sha1_init(&shaCtx);
    sha1_write(&shaCtx, buf, len);
    uint8t *result = sha1_result(&ctx); // 20 bytes
    */

    char header[2048];
    int header_n = 0;

    sha1nfo shaCtx;

    for(;;)
    {
        int nb = gzread(fasta, &b, 1);

        if(nb == 1) 
        {
            switch(state) {

                case s_clear: 

                    if(b == '>') {
                        state = s_in_header;
                        break;
                    }

                    break;

                case s_in_header:

                    if(b == '\n') {
                        header[header_n] = '\0';
                        state = s_in_seq;
                        break;
                    }

                    header[header_n ++] = b;

                    if(header_n == (sizeof(header) - 1)) {
                        assert(false);
                    }

                    break;

                case s_in_seq:

                    if(b == '\n')
                        break;

                    if(b == '>') {

                        uint8_t *hash = sha1_result(&shaCtx);

                        db->Put(leveldb::WriteOptions(), std::string((const char *) hash, 20), getAccessionFromHeader(header));

                        ++ n_written;

                        if(n_written % 10000 == 0) {
                            printf("%d\n", (int) n_written);
                        }

                        sha1_init(&shaCtx);

                        state = s_in_header;
                        header_n = 0;

                        break;
                    }

                    if(!isalpha(b)) {
                        assert(false);
                    }

                    b = toupper(b);

                    sha1_write(&shaCtx, &b, 1);
                    break;


            };
        }
        else if(nb == 0)
        {
            printf("done\n");
            return 0;
        }
        else if(nb == -1)
        {
            return 2;
        }
    }


    delete db;


    return 0;
}

string getAccessionFromHeader(const char *header) {

    return header;

}


