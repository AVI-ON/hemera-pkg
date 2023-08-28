#!/usr/bin/env bash
set -euxo pipefail

VERSION=v2.9.21
DEB=nats-server-${VERSION}-amd64.deb

[ ! -f "$DEB" ] && wget "https://github.com/nats-io/nats-server/releases/download/${VERSION}/${DEB}" "--output-file=/tmp/${DEB}"
sudo apt install /"tmp/$DEB"
rm -f "/tmp/$DEB"

sudo ln -s /usr/local/bin/nats-server /usr/local/bin/gnatsd