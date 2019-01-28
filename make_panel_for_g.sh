#!/bin/sh
set -e
rm -rf ./panel
mkdir panel
mkdir panel/public
mkdir panel/public/admin
mkdir panel/templates
mv ./dist/index.html ./panel/templates/
mv  ./dist/* ./panel/public/admin/
