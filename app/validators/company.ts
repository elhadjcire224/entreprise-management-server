import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

/**
 * Validator to validate the payload when creating
 * a new company.
 */
export const createCompanyValidator = vine.compile(
  vine.object({
    companyName: vine.string().minLength(2),
    firstNames: vine.string().minLength(2),
    lastName: vine.string().minLength(2),
    position: vine.string().minLength(2),
    email: vine.string().email(),
    phone: vine.string().minLength(9).maxLength(12),
    yearOfCreation: vine.number().range([1800, DateTime.now().year]),
    municipality: vine.string().minLength(2),
    city: vine.string().minLength(2),
    businessSectorId: vine.number().exists(async (db, value) => {
      const result = await db.from('business_sectors').select('id').where('id', value)
      return !!result.length
    }),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing company.
 */
export const updateCompanyValidator = vine.compile(vine.object({}))

export const uploadRccm = vine.compile(
  vine.object({
    registrationToken: vine.string(),
    rccm: vine.file({ size: '5mb', extnames: ['pdf'] }),
  })
)
export const uploadPaymentProof = vine.compile(
  vine.object({
    registrationToken: vine.string(),
    paymentFile: vine.file({ size: '10mb', extnames: ['pdf', 'jpg', 'png'] }),
  })
)

export const assignCompanyValidator = vine.compile(
  vine.object({
    validatorId: vine.number().exists(async (db, value) => {
      const result = await db.from('administrators').select('id').where('id', value)
      return !!result.length
    }),
  })
)
