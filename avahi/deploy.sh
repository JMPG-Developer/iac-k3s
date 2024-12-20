#!/bin/bash
cp ./kafka.service /etc/avahi/services/kafka.service
cp ./schema-registry.service /etc/avahi/services/schema-registry.service
cp ./control-center.service /etc/avahi/services/control-center.service
systemctl restart avahi-daemon