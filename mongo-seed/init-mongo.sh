#!/bin/bash
echo "Restoring MongoDB data..."
mongorestore --db diploma /docker-entrypoint-initdb.d/diploma
