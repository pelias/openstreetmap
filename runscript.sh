#!/bin/bash
echo '------' >> history.log;
date >> history.log;
echo '------' >> history.log;
df -h >> history.log
echo '------' >> history.log;
node index.js 2> err.log 1> out.log;
echo '------' >> history.log;
df -h >> history.log
echo '------' >> history.log;
echo '' >> history.log;