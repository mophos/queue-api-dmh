import { Knex } from 'knex';

export class DepartmentModel {

  tableName = 'q4u_departments';

  list(db: Knex) {
    return db(this.tableName).orderBy('department_name');
  }

  save(db: Knex, data: any) {
    return db(this.tableName).insert(data);
  }

  update(db: Knex, departmentId: any, data: any) {
    return db(this.tableName).where('department_id', departmentId).update(data);
  }

  remove(db: Knex, departmentId: any) {
    return db(this.tableName).where('department_id', departmentId).del();
  }

}