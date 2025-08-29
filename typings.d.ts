import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { Logger } from 'pino';
import { Knex } from 'knex';

declare module 'fastify' {
  interface FastifyInstance {
    db: Knex;
    dbHIS: Knex;
  }

  interface FastifyRequest {
    user: any;
    [x: string]: any;
  }

  interface FastifyReply {
    [x: string]: any;
  }

}

