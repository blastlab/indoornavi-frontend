#!/bin/bash

count=$1
passed=0
failure=0

for ((i = 1; i <= $1; i++)); do
   if python3.5 main.py TestPermissionsPage.test_02_multi_select_in_add_permission_group;then
    passed=$[$passed +1]
   else
    failure=$[$failure +1]
   fi

done

echo "For $1 Tests : "
echo "PASSED: $passed"
echo "FAILED: $failure"
