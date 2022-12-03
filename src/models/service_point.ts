import { Knex } from 'knex';

export class ServicePointModel {

  tableName = 'q4u_service_points';

  list(db: Knex) {
    return db('q4u_service_points as sp')
      .select('sp.*', 'd.department_name', 's.sound_file')
      .leftJoin('q4u_departments as d', 'd.department_id', 'sp.department_id')
      .leftJoin('q4u_sounds as s', 's.sound_id', 'sp.sound_id')
      .orderBy('sp.service_point_name');
  }

  listKios(db: Knex) {
    return db('q4u_service_points as sp')
      .select('sp.*', 'd.department_name')
      .leftJoin('q4u_departments as d', 'd.department_id', 'sp.department_id')
      .where('sp.kios', 'Y')
      .orderBy('sp.service_point_name');
  }

  getServicePointIdFromLocalCode(db: Knex, localCode: any) {
    return db(this.tableName).select('service_point_id').where('local_code', localCode).limit(1);
  }

  getPrefix(db: Knex, servicePointId: any) {
    return db(this.tableName)
      .where('service_point_id', servicePointId)
      .limit(1);
  }

  getLocalCode(db: Knex) {
    return db(this.tableName).select('local_code');
  }

  save(db: Knex, data: any) {
    return db(this.tableName).insert(data);
  }

  update(db: Knex, servicePointId: any, data: any) {
    return db(this.tableName).where('service_point_id', servicePointId).update(data);
  }

  remove(db: Knex, servicePointId: any) {
    return db(this.tableName).where('service_point_id', servicePointId).del();
  }

}