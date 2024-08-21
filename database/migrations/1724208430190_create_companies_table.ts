import CompanyStatus from '#enums/company_status'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'companies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('first_names').notNullable()
      table.string('last_name').notNullable()
      table.string('position').notNullable()
      table.string('email').notNullable()
      table.string('phone').notNullable()
      table.string('company_name').notNullable()
      table.integer('year_of_creation').notNullable()
      table.string('municipality').notNullable()
      table.string('city').notNullable()
      table
        .integer('business_sector_id')
        .unsigned()
        .references('id')
        .inTable('business_sectors')
        .onDelete('CASCADE')
      table.string('rccm_file_path').notNullable()
      table.string('payment_proof_file_path').notNullable()
      table.string('status').defaultTo(CompanyStatus.PENDING)
      table
        .integer('validated_by_id')
        .unsigned()
        .references('id')
        .inTable('administrators')
        .nullable()
      table.timestamp('validation_date').nullable()
      table.text('validation_comment').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
