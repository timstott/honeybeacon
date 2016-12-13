# Honeybeacon Server

Serves an endpoint that indicates the presence of faults on HoneyBadger on a client basis.

When a client calls the endpoint and faults have occurred the server responds positively.
When the same client makes subsequent calls and no new faults have occurred the server responds negatively.

## Starting web server
```
docker-compose up --build

curl http://localhost:3000/ping
pong
```

## Running tests
```
docker-compose run web npm run testw
```

## Arduino Code

Requirements:

- Arduino Board
- Arduino Ethernet Shield
- Relay

Before uploading the code to the Arduino change the `deviceUUID` in [honeybeacon_device.ino](./honeybeacon_device.ino)
