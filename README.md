# Honeybeacon Server

Serves an endpoint that indicates the presence of faults on HoneyBadger on a client basis.

When a client calls the endpoint and faults have occurred the server responds positively.
When the same client makes subsequent calls and no new faults have occurred the server responds negatively.

## Install
```
npm install
bin/boot
```
