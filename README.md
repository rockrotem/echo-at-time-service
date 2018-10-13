# echo-at-time-service
A service for sending a delayed jobs. It uses Redis and its data types in order to achieve:
1. Persistence
2. Reliability
3. Performance
4. Scalability

## High level architecture
The service has 1 API POST call:
/api/v1/save-message with the payload:
```javascript
const message = {
  "message": "Benec can.",
  "runAt": 1539430684913,
  "uuid": "34ec6bfa-0df6-4465-b09e-c63b3121466c"
};
```

It uses 3 Redis Queue:
1. QueueDelayed - Store messages should be processed in future (delayed)
2. Queue - Store messages to process immediately (now)
3. QueueDead - Store messages to process in case service was down unexpectedly (reliability);

### Flow logic
1. Message should run now saved to redis Queue: and processed immediately.
2. Message should run in future saved to redis QueueDelayed: and processed when needed by runAt.
   When message time to process arrived it will deleted from QueueDelayed: and move to Queue: with redis distributed lock (redlock).
   
Reliability and only one server message processing will be implemented using redis: rpoplpush command.

### Future architecture improvements
* Split read and write services:
    1. Service write message to redis (micro-service only writes)
    2. Service worker for each queue (micro-service only read process messages, dead messages)
* Can implement master election using zookeeper or redis so only one server will process messages with no locking.

# installation
```bash
npm i
```

# package dependencies
## dependencies
* express - as the http server
* redis - as redis client
* redlock - as a redis distributed lock.
* bluebird - as promise library for redis (bluebird.promisifyAll(redis))

## dev dependencies
* eslint + airbnb - code style
* mocha + chai - TDD and testing
* chance - generates message text randomly 

# run tests
Will run all tests + code style using eslint.
2 end to end tests:
* Post to service and add 2 messages to Delayed Queue.
* Post to service and add 1 message to Process Queue.


```bash
npm test
```

