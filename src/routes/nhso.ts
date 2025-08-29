/// <reference path="../../typings.d.ts" />

import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';

import { NhsoModel } from '../models/nhso';

const nhsoModel = new NhsoModel();



const router = (fastify, { }, next) => {


  fastify.post('/', async (req: any, reply: any) => {
    try {
      const data = req.body;
      console.log(data);
      const obj: any = {
        claimCode: data.claimCode,
        pid: data.pid,
        createdDate: data.createdDate
      };
      // await nhsoModel.saveQueue(obj);
      await nhsoModel.save(obj);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message })
    }
  });



  next();

};

module.exports = router;