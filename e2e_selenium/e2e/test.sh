#!/bin/bash

for ((i = 1; i <= $1; i++)); do
   date=$(date +'%d-%m-%Y %H:%M:%S:%3N')
   echo ' ';
   echo "---------------------START TEST SUITE $i OF $1--------------------: "
   echo ' '
   echo "TEST START DATE : $date"
   echo ' '
   echo "------------------------------------------------------------------: "

   python3 main.py -v

   echo ' '
   echo "---------------------END TEST SUITE $i OF $1----------------------: "
   echo ' '
   echo "TEST END DATE : $date"
   echo ' '
   echo "------------------------------------------------------------------: "

done

