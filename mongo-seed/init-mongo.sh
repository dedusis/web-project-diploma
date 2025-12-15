#!/bin/bash
echo "Restoring MongoDB data..."
mongorestore /docker-entrypoint-initdb.d/diploma
