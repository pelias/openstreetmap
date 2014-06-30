#!/bin/bash

set -e

OUT='manyNodes'
XML_OUT="$OUT.xml"
PBF_OUT="$OUT.pbf"

append(){
    echo "$1" >> "$XML_OUT"
}

# make sure file is initially empty
echo -n '' > "$XML_OUT"

append '<?xml version="1.0" encoding="UTF-8"?>'
append "<osm version=\"0.6\" generator=\"`basename $0`\">"
append '<bounds minlat="51.5073601795557" minlon="-0.108157396316528" maxlat="51.5076406454029" maxlon="-0.107599496841431"/>'

i=1

while [ $i -le 3000 ]
do
    append "<node id=\"$i\" lat=\"0\" lon=\"0\" version=\"1\" changeset=\"1\" user=\"x\" uid=\"1\" visible=\"true\" timestamp=\"2008-12-17T01:18:42Z\"/>"

    i=`expr "$i" + 1`
done

append '</osm>'

# create pbf file from xml file
osmosis --read-xml "$XML_OUT" --write-pbf "$PBF_OUT"
