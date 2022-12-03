/// <reference path="../../typings.d.ts" />

import { Knex } from 'knex';

import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';
import { ServiceRoomModel } from '../models/service_room';

const roomModel = new ServiceRoomModel();

const router = (fastify, { }, next) => {

  var db: Knex = fastify.db;

  // get service point lists
  fastify.get('/:servicePointId', { beforeHandler: [fastify.authenticate] }, async (req: any, reply: any) => {

    try {
      const servicePointId = req.params.servicePointId;
      const rs: any = await roomModel.list(db, servicePointId);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  })

  // save new service room
  fastify.post('/', { beforeHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: any, reply: any) => {
    const roomName = req.body.roomName;
    const roomNumber = req.body.roomNumber;
    const servicePointId = req.body.servicePointId;

    const data: any = {
      room_number: roomNumber,
      room_name: roomName,
      service_point_id: servicePointId,
    };

    try {
      await roomModel.save(db, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  })

  // update service room
  fastify.put('/:roomId', { beforeHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: any, reply: any) => {
    const roomId: any = req.params.roomId;
    const roomName = req.body.roomName;
    const roomNumber = req.body.roomNumber;
    const servicePointId = req.body.servicePointId;

    const data: any = {
      room_number: roomNumber,
      room_name: roomName,
      service_point_id: servicePointId,
    };

    try {
      await roomModel.update(db, roomId, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  })

  // remove service point
  fastify.delete('/:roomId', { beforeHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: any, reply: any) => {
    const roomId: any = req.params.roomId;

    try {
      await roomModel.remove(db, roomId);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  })

  next();

}

module.exports = router;