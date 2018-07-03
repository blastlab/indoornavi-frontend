#!/bin/bash

count=$1
command=$2
passed=0
failure=0

for ((i = 1; i <= $1; i++)); do
   if $2;then
    passed=$[$passed +1]
   else
    failure=$[$failure +1]
   fi

done

echo "For $1 Tests : "
echo "PASSED: $passed"
echo "FAILED: $failure"
