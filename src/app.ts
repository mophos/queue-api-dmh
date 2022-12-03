/// <reference path="../typings.d.ts" />

import path = require('path');
import * as HttpStatus from 'http-status-codes';
import * as fastify from 'fastify';

require('dotenv').config({ path: path.join(__dirname, '../config') });

import helmet = require('@fastify/helmet');

const app: fastify.FastifyInstance = fastify.fastify({
  logger: {
    transport:
      process.env.ENV === 'development'
        ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
          }
        }
        : undefined
  }
})

app.register(require('@fastify/formbody'))
app.register(require('@fastify/cors'), {})
app.register(
  helmet
);

app.register(import('@fastify/rate-limit'), {
  max: +process.env.MAX_CONNECTION_PER_MINUTE || 1000000,
  timeWindow: '1 minute'
})

app.register(require('@fastify/static'), {
  root: path.join(__dirname, '../public'),
})

app.register(require('@fastify/jwt'), {
  secret: process.env.SECRET_KEY
});

var templateDir = path.join(__dirname, '../templates');
app.register(require('@fastify/view'), {
  engine: {
    ejs: require('ejs')
  },
  templates: templateDir
});

app.decorate("authenticate", async (request, reply) => {
  let token: string = null;

  if (request.headers.authorization && request.headers.authorization.split(' ')[0] === 'Bearer') {
    token = request.headers.authorization.split(' ')[1];
  } else if (request.query && request.query.token) {
    token = request.query.token;
  } else {
    token = request.body.token;
  }

  try {
    const decoded = await request.jwtVerify(token);
  } catch (err) {
    reply.status(HttpStatus.UNAUTHORIZED).send({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED),
      message: '401 UNAUTHORIZED!'
    })
  }
});

app.register(require('./plugins/db'), {
  name: 'db',
  options: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: +process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {
      min: 10,
      max: 100,
      afterCreate: (conn, done) => {
        conn.query('SET NAMES utf8', (err) => {
          done(err, conn);
        });
      }
    },
    debug: process.env.DB_DEBUG === "Y" ? true : false
  }
});

app.register(require('./plugins/db'), {
  name: 'dbHIS',
  options: {
    client: 'pg',
    connection: {
      host: process.env.DBHIS_HOST,
      user: process.env.DBHIS_USER,
      port: +process.env.DBHIS_PORT,
      password: process.env.DBHIS_PASSWORD,
      database: process.env.DBHIS_NAME,
    },
    searchPath: ['public'],
    pool: {
      min: 0,
      max: 100
    },
    debug: process.env.DB_DEBUG === "Y" ? true : false
  }
});

// MQTT
app.register(require('./plugins/mqtt'), {
  host: process.env.INTERNAL_NOTIFY_SERVER,
  username: process.env.LOCAL_NOTIFY_USER,
  password: process.env.LOCAL_NOTIFY_PASSWORD
});


app.decorate('verifyAdmin', function (request, reply, done) {
  if (request.user.userType === 'ADMIN') {
    done();
  } else {
    reply.status(HttpStatus.UNAUTHORIZED).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
  }
});

app.decorate('verifyMember', function (request, reply, done) {
  if (request.user.userType === 'MEMBER') {
    done();
  } else {
    reply.status(HttpStatus.UNAUTHORIZED).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
  }
});

app.register(require('./routes/index'), { prefix: '/v1', logger: true });
app.register(require('./routes/login'), { prefix: '/v1/login', logger: true });
app.register(require('./routes/users'), { prefix: '/v1/users', logger: true });
app.register(require('./routes/token'), { prefix: '/v1/token', logger: true });
app.register(require('./routes/api'), { prefix: '/v1/api', logger: true });
app.register(require('./routes/service_points'), { prefix: '/v1/service-points', logger: true });
app.register(require('./routes/service_rooms'), { prefix: '/v1/service-rooms', logger: true });
app.register(require('./routes/priorities'), { prefix: '/v1/priorities', logger: true });
app.register(require('./routes/queue'), { prefix: '/v1/queue', logger: true });
app.register(require('./routes/departments'), { prefix: '/v1/departments', logger: true });
app.register(require('./routes/print'), { prefix: '/v1/print', logger: true });
app.register(require('./routes/sounds'), { prefix: '/v1/sounds', logger: true });
app.register(require('./routes/kiosk'), { prefix: '/v1/kiosk', logger: true });
app.register(require('./routes/nhso'), { prefix: '/v1/nhso', logger: true });

app.get('/', async (req: any, reply: any) => {
  reply.code(200).send({ message: 'Welcome to Q4U API services!', version: '2.9 build 20190319-1' });
});

const port = 3002;
const host = '0.0.0.0';

app.listen({ port: port, host: host }, (err) => {
  if (err) throw err;
  console.log(app.server.address());
});
