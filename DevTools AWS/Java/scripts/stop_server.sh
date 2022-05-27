#!/bin/bash
isExistApp=`pgrep java`
if [[ -n  $isExistApp ]]; then
   systemctl stop tomcat
fi
