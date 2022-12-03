/// <reference path="../../typings.d.ts" />

import { Knex } from 'knex';
import * as fastify from 'fastify';

import { SystemModel } from '../models/system';
import * as HttpStatus from 'http-status-codes';
const systemModel = new SystemModel();

const router = (fastify, { }, next) => {

  var db: Knex = fastify.db;

  // fastify.get('/', async (req: any, reply: any) => {
  //   reply.code(200).send({ message: 'Fastify, RESTful API services!' })
  // });

  fastify.get('/info', async (req: any, reply: any) => {
    try {
      const rs: any = await systemModel.getInfo(db);
      reply.code(HttpStatus.OK).send({ info: rs[0] })
    } catch (error) {
      console.log(error);
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  next();

}

module.exports = router;