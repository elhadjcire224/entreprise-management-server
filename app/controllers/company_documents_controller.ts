import Company from '#models/company'
import { uploadPaymentProof, uploadRccm } from '#validators/company'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'

export default class CompanyDocumentsController {
  async uploadRccm({ request, params, response }: HttpContext) {
    const { registrationToken, rccm } = await request.validateUsing(uploadRccm)
    const company = await Company.findOrFail(params.id)

    if (company.registrationToken !== registrationToken) {
      return response.forbidden('Invalid registration token')
    }
    const key = `${company.id}_rccm_${Date.now()}.${rccm.extname}`
    await rccm.moveToDisk(key)

    company.rccmFilePath = await drive.use().getUrl(key)

    await company.save()
    return response.ok({ message: 'file uploaded' })
  }
  async uploadPaymentProof({ request, params, response }: HttpContext) {
    const { registrationToken, paymentFile } = await request.validateUsing(uploadPaymentProof)
    const company = await Company.findOrFail(params.id)

    if (company.registrationToken !== registrationToken) {
      return response.forbidden('Invalid registration token')
    }
    const key = `${company.id}_payment_proof_${Date.now()}.${paymentFile.extname}`

    await paymentFile.moveToDisk(key)
    company.paymentProofFilePath = await drive.use().getUrl(key)
    await company.save()

    return response.ok({ message: 'file uploaded' })
  }
}
