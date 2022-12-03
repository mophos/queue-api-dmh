/// <reference path="../../typings.d.ts" />
import { KioskModel } from './../models/kiosk';
import * as moment from 'moment';
import { Knex } from 'knex';
import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';
import { QueueModel } from '../models/queue';
import { EzhospModel } from '../models/his/ezhosp';
import { DhosModel } from '../models/his/dhos';
import { HiModel } from '../models/his/hi';
import { HosxpModel } from '../models/his/hosxp';
import { UniversalModel } from '../models/his/universal';
import { HomcModel } from '../models/his/homc';
const hisType = process.env.HIS_TYPE || 'universal';

const kioskModel = new KioskModel();
// ห้ามแก้ไข //

let hisModel: any;
switch (hisType) {
  case 'ezhosp':
    hisModel = new EzhospModel();
    break;
  case 'dhos':
    hisModel = new DhosModel();
    break;
  case 'hosxp':
    hisModel = new HosxpModel();
    break;
  case 'hi':
    hisModel = new HiModel();
    break;
  case 'homc':
    hisModel = new HomcModel();
    break;
  case 'universal':
    hisModel = new UniversalModel();
    break;
  default:
    hisModel = new HosxpModel();
}

const router = (fastify, { }, next) => {

  // const db: Knex = fastify.db;

  // send from smartcard
  fastify.post('/profile', async (req: any, reply: any) => {

    try {
      console.log('insert');

      const token = req.body.token;
      if (token) {
        const kioskId = req.body.kioskId;
        const decoded = fastify.jwt.verify(token);
        const cid = req.body.cid;
        const title = req.body.title;
        const fname = req.body.fname;
        const lname = req.body.lname;
        const birthDate = req.body.birthDate;

        const topic = `kiosk/${kioskId}`;
        const obj = {
          cid: cid,
          fullname: `${title}${fname} ${lname}`,
          birthDate: birthDate
        };
        const payload = {
          ok: true,
          results: obj
        }
        fastify.mqttClient.publish(topic, JSON.stringify(payload), { qos: 0, retain: false });
        reply.status(HttpStatus.OK).send({ cid: cid, title: title, fname: fname, lname: lname, birthDate: birthDate })

      } else {
        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) })
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  });

  fastify.delete('/profile', async (req: any, reply: any) => {

    try {
      const token = req.body.token;
      const kioskId = req.body.kioskId;
      if (token) {
        const decoded = fastify.jwt.verify(token);
        console.log('remove');

        const topic = `kiosk/${kioskId}`;

        const payload = {
          ok: false
        };
        fastify.mqttClient.publish(topic, JSON.stringify(payload), { qos: 0, retain: false });
        reply.status(HttpStatus.OK).send({ message: 'remove' });

      } else {
        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) })
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  });
  // ===============
  fastify.post('/patient/info', { preHandler: [fastify.authenticate] }, async (req: any, reply: any) => {
    const cid = req.body.cid;
    const hn = req.body.hn;
    const dbHIS: Knex = fastify.dbHIS;
    if (cid || hn) {
      try {
        let rs: any;
        if (cid) {
          rs = await hisModel.getPatientInfo(dbHIS, cid);
        } else {
          rs = await hisModel.getPatientInfoWithHN(dbHIS, hn);
        }
        if (rs.length) {
          const data = rs[0];
          const hn = data.hn;
          const cid = data.cid;
          const firstName = data.first_name;
          const lastName = data.last_name;
          const birthDate = data.birthdate;
          const title = data.title;
          const sex = data.sex;

          const thDate = `${moment(birthDate).format('DD/MM')}/${moment(birthDate).get('year') + 543}`;
          const patient = {
            hn: hn,
            cid: cid,
            firstName: firstName,
            lastName: lastName,
            birthDate: thDate,
            engBirthDate: moment(birthDate).format('YYYY-MM-DD'),
            title: title,
            sex: sex
          };

          reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: patient });

        } else {
          reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.NOT_FOUND, message: 'ไม่พบข้อมูล' });
        }
      } catch (error) {
        fastify.log.error(error);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message })
      }
    } else {
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.NOT_FOUND, message: 'CID not found!' })
    }

  });

  fastify.get('/patient/info/remed', { preHandler: [fastify.authenticate] }, async (req: any, reply: any) => {
    const hn = req.query.hn;
    if (hn) {
      try {
        const remed: any = await kioskModel.remed(hn);
        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: remed || false });
      } catch (error) {
        fastify.log.error(error);
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, results: false });
      }
    } else {
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.NOT_FOUND, message: 'hn not found!' });
    }

  });

  fastify.post('/nhso', { preHandler: [fastify.authenticate] }, async (req: any, reply: any) => {
    // const token = req.body.token;
    const data = req.body.data;
    // console.log(data);
    try {
      const rs: any = await kioskModel.nhso(data);
      if (rs.length) {
        const convert = require('xml-js');
        const result = JSON.parse(convert.xml2json(rs, { compact: false, spaces: 4 }));
        const _result = result.elements[0].elements[0].elements[0].elements[0].elements;

        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: _result });

      } else {
        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.NOT_FOUND, message: 'ไม่พบข้อมูล' });
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message })
    }
  });

  fastify.post('/trigger', { preHandler: [fastify.authenticate] }, async (req: any, reply: any) => {
    const url = req.body.url;
    const hn = req.body.hn;
    const cid = req.body.cid;
    const type = req.body.type;
    const localCode = req.body.localCode;
    const servicePointId = req.body.servicePointId;
    const queueNumber = req.body.queueNumber;

    try {
      if (type == 'GET') {
        await kioskModel.triggerGet(url, hn, cid, localCode, servicePointId, queueNumber);
      }
      if (type == 'POST') {
        await kioskModel.triggerPOST(url, hn, cid, localCode, servicePointId, queueNumber);
      }
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
    }
  });

  next();

};

module.exports = router;
