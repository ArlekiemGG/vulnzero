#!/bin/bash
cd ../machines

for machine in vulnnet cryptolocker; do
  echo "Construyendo $machine..."
  docker build -t vulnzero/$machine:1.0 $machine
done