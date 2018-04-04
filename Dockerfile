
FROM ubuntu:16.04
MAINTAINER James Alastair McLaughlin <j.a.mclaughlin@ncl.ac.uk>

RUN apt update && apt dist-upgrade -y

RUN useradd synform -p synform -m -s /bin/bash




### node

ADD setup_9.x /

RUN chmod +x /setup_9.x && \
    sync && \
    /setup_9.x && \
    apt-get update && \
    apt-get install -y nodejs && \
    npm install -g forever


COPY download_uniprot.sh main.cpp sha1.c /opt/fmaseq/


### building stuff

RUN apt-get install -y g++ libleveldb-dev zlib1g-dev wget



### make db

RUN cd /opt/fmaseq && \
    g++ -o makedb main.cpp -lleveldb -lz && \
    ./download_uniprot.sh && \
    ./makedb uniprot_sprot.fasta.gz && \
    rm -f *.gz


### node server

COPY findprot.js package.json server.js startup.sh /opt/fmaseq/
RUN chown -R synform:synform /opt/fmaseq

RUN cd /opt/fmaseq && su synform -c "npm install"





COPY startup.sh /
RUN chmod 777 /startup.sh

EXPOSE 6664

ENTRYPOINT ["/startup.sh"]


