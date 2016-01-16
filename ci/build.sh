#!/bin/bash

set -ex

npm install
NODE_ENV=production node_modules/.bin/webpack

if [ ${DRONE_BRANCH} == master -o ${DRONE_BRANCH} == drone ]; then
  cd build
  s3cmd -M sync . s3://alpha.euphoria.io
fi
