import CompanyStatus from '#enums/company_status'
import Roles from '#enums/roles'
import Company from '#models/company'
import EmailService from '#services/email_service'
import PDFService from '#services/pdf_service'
import { assignCompanyValidator, createCompanyValidator } from '#validators/company'
import { paginationValidator } from '#validators/pagination'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export default class CompaniesController {
  async initializeRegistration({ request, response }: HttpContext) {
    const data = await request.validateUsing(createCompanyValidator)
    const registrationToken = string.random(32)

    const company = await Company.create({
      ...data,
      registrationToken,
      status: CompanyStatus.INCOMPLETE,
    })

    return response.created({ companyId: company.id, registrationToken })
  }

  async finalizeRegistration({ request, params, response }: HttpContext) {
    const { registrationToken } = request.all()
    const company = await Company.findOrFail(params.id)

    if (company.registrationToken !== registrationToken) {
      return response.forbidden({ message: 'Invalid registration token' })
    }

    if (!company.rccmFilePath || !company.paymentProofFilePath) {
      return response.badRequest({ message: 'Missing required documents' })
    }

    company.status = CompanyStatus.PENDING
    company.registrationToken = null
    await company.save()

    await EmailService.sendRegistrationConfirmation(company)

    return response.ok({ message: 'Company registration completed' })
  }

  async index({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const { page, limit, search, status } = await request.validateUsing(paginationValidator)
    const query = Company.query().preload('businessSector').preload('administrator')
    if (user.role === Roles.VALIDATOR) {
      query.where('administrator_id', user.id).where('status', CompanyStatus.PENDING)
    }
    const companies = await query
      .orderBy('updated_at', 'desc')
      .if(status, (builder) => builder.where('status', status!))
      .if(search, (builder) => builder.whereILike('company_name', `%${search}%`))
      .paginate(page || 1, limit || 10)
    return response.ok({ companies })
  }

  async assignCompany({ params, response, request }: HttpContext) {
    const { validatorId } = await request.validateUsing(assignCompanyValidator)

    const company = await Company.findOrFail(params.id)
    if (company.administratorId) {
      return response.badRequest({ message: 'This company is already assigned' })
    }
    company.administratorId = validatorId
    await company.save()
    return response.ok({ message: 'Company assigned' })
  }

  async show({ params, response }: HttpContext) {
    const company = await Company.findOrFail(params.id)
    await company.load('businessSector')
    return response.ok({ company })
  }

  async update({}: HttpContext) {}

  async validate({ params, response, auth, request }: HttpContext) {
    const { status } = await request.validateUsing(
      vine.compile(
        vine.object({ status: vine.enum([CompanyStatus.ACCEPTED, CompanyStatus.REJECTED]) })
      )
    )
    const company = await Company.findOrFail(params.id)
    if (company.status !== CompanyStatus.PENDING) {
      return response.badRequest({ message: 'This company is not pending' })
    }
    if (auth.user!.role !== Roles.ADMIN && company.administratorId !== auth.user!.id) {
      return response.forbidden({ message: 'You are not the assigned validator' })
    }

    company.status = status

    company.validationDate = DateTime.now()

    await company.save()

    const pdfPath = await PDFService.generateAttestation(company)

    // Envoyer l'email de confirmation
    await EmailService.sendAcceptanceConfirmation(company, pdfPath)

    return response.ok({ message: 'Company validated' })
  }

  async destroy({ params, response }: HttpContext) {
    const company = await Company.findOrFail(params.id)
    await company.delete()
    return response.noContent()
  }
}
