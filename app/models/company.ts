import CompanyStatus from '#enums/company_status'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import BusinessSector from './business_sector.js'

export default class Company extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstNames: string

  @column()
  declare lastName: string

  @column()
  declare position: string

  @column()
  declare email: string

  @column()
  declare phone: string

  @column()
  declare companyName: string

  @column()
  declare yearOfCreation: number

  @column()
  declare municipality: string

  @column()
  declare city: string

  @column()
  declare businessSectorId: number

  @column()
  declare rccmFilePath: string

  @column()
  declare paymentProofFilePath: string

  @column()
  declare status: CompanyStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => BusinessSector)
  declare businessSector: BelongsTo<typeof BusinessSector>
}
