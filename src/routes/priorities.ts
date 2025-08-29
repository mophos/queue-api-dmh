/// <reference path="../../typings.d.ts" />

import { Knex } from 'knex';
import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';
import { PriorityModel } from '../models/priority';

const priorityModel = new PriorityModel();

const router = (fastify, { }, next) => {

  var db: Knex = fastify.db;

  fastify.get('/', { beforeHandler: [fastify.authenticate] }, async (req: any, reply: any) => {

    try {
      const rs: any = await priorityModel.list(db);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.post('/', { beforeHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: any, reply: any) => {
    const priorityName = req.body.priorityName;
    const priorityPrefix = req.body.priorityPrefix;
    // const priorityColor = req.body.priorityColor;

    const data: any = {
      priority_name: priorityName,
      priority_prefix: priorityPrefix,
      // priority_color: priorityColor
    };

    try {
      await priorityModel.save(db, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.put('/:priorityId', { beforeHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: any, reply: any) => {
    const priorityId: any = req.params.priorityId;
    const priorityName = req.body.priorityName;
    const priorityPrefix = req.body.priorityPrefix;
    // const priorityColor = req.body.priorityColor;

    const data: any = {
      priority_name: priorityName,
      priority_prefix: priorityPrefix,
      // priority_color: priorityColor
    };

    try {
      await priorityModel.update(db, priorityId, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.delete('/:priorityId', { beforeHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: any, reply: any) => {
    const priorityId: any = req.params.priorityId;

    try {
      await priorityModel.remove(db, priorityId);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  next();

}

module.exports = router;
