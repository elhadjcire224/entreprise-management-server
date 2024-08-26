import BusinessSector from '#models/business_sector'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class BusinessSectorsController {
  schema = vine.compile(
    vine.object({
      name: vine
        .string()
        .trim()
        .minLength(2)
        .maxLength(255)
        .unique(async (db, value) => {
          const result = await db.from('business_sectors').select('id').whereILike('name', value)
          return result.length ? false : true
        }),
    })
  )
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    const businessSectors = await BusinessSector.query()
      .orderBy('created_at', 'desc')
      .withCount('companies')

    const serializedSectors = businessSectors.map((sector) => ({
      ...sector.serialize(),
      companies_count: sector.$extras.companies_count,
    }))
    response.ok(serializedSectors)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(this.schema)
    const businessSector = await BusinessSector.create(data)

    return response.created({
      businessSector,
      companies_count: 0,
    })
  }

  /**
   * Show individual record
   */
  async update({ params, request, response }: HttpContext) {
    const validatedData = await request.validateUsing(this.schema)
    const businessSector = await BusinessSector.findOrFail(params.id)

    businessSector.merge(validatedData)
    await businessSector.save()

    return response.ok(businessSector)
  }

  /**
   * Handle form submission for the edit action
   */

  /**

   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const businessSector = await BusinessSector.findOrFail(params.id)
    await businessSector.delete()
    return response.noContent()
  }
}
