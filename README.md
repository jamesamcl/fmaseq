
I only handle raw protein sequences, so you probably want to put ConversionProxy in front of me if you want FASTA, SBOL, etc. support

If I'm on port 6664 and ConversionProxy is on port 9995, the nginx configuration would look something like this:

    location /fmaseq {

            proxy_http_version 1.1;

            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            proxy_set_header X-Synform-TargetWants "PART_RAW_PROTEIN";
            proxy_set_header X-Synform-TargetProvides "DATA_JSON";
            proxy_set_header X-Synform-ClientWants "DATA_JSON";
            proxy_set_header X-Synform-TargetURL "http://127.0.0.1:6664/";

            proxy_pass http://127.0.0.1:9995/;
            proxy_redirect off;

    }

