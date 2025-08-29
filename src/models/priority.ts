import { Knex } from 'knex';
export class PriorityModel {

  tableName = 'q4u_priorities';

  list(db: Knex) {
    return db(this.tableName).orderBy('priority_name');
  }

  getPrefix(db: Knex, priorityId: any) {
    return db(this.tableName)
      .select('priority_prefix')
      .where('priority_id', priorityId).limit(1);
  }

  save(db: Knex, data: any) {
    return db(this.tableName).insert(data);
  }

  update(db: Knex, priorityId: any, data: any) {
    return db(this.tableName).where('priority_id', priorityId).update(data);
  }

  remove(db: Knex, priorityId: any) {
    return db(this.tableName).where('priority_id', priorityId).del();
  }

}