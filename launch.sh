#!/usr/bin/env bash
echo $HOST_ENTRY >>/etc/hosts
node server/lib/server.js
