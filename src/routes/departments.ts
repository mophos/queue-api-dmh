/// <reference path="../../typings.d.ts" />

import { Knex } from 'knex';

import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';
import { DepartmentModel } from '../models/department';

const departmentModel = new DepartmentModel();

const router = (fastify, { }, next) => {

  var db: Knex = fastify.db;

  fastify.get('/', { beforeHandler: [fastify.authenticate] }, async (req: any, reply: any) => {

    try {
      const rs: any = await departmentModel.list(db);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.post('/', { beforeHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: any, reply: any) => {
    const departmentName = req.body.departmentName;

    const data: any = {
      department_name: departmentName,
    };

    try {
      await departmentModel.save(db, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.put('/:departmentId', { beforeHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: any, reply: any) => {
    const departmentId: any = req.params.departmentId;
    const departmentName = req.body.departmentName;

    const data: any = {
      department_name: departmentName,
    };

    try {
      await departmentModel.update(db, departmentId, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.delete('/:departmentId', { beforeHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: any, reply: any) => {
    const departmentId: any = req.params.departmentId;

    try {
      await departmentModel.remove(db, departmentId);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  next();

}

module.exports = router;
