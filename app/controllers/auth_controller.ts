import Roles from '#enums/roles'
import Administrator from '#models/administrator'
import TokensService from '#services/token_service'
import { loginValidator, registrationValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const admin = await Administrator.verifyCredentials(email, password)
    const token = await TokensService.generateToken(admin)
    return response.ok({ admin, token })
  }

  async logout({ auth, response }: HttpContext) {
    const admin = auth.user!
    await TokensService.deleteAllPreviousTokens(admin)
    return response.noContent()
  }

  async me({ auth, response }: HttpContext) {
    const admin = auth.user!
    return response.ok(admin)
  }

  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registrationValidator)
    const first = await Administrator.first()
    let admin = new Administrator()
    if (!first) admin.role = Roles.ADMIN
    admin.role = Roles.VALIDATOR
    admin.merge(data)
    await admin.save()
    const token = await TokensService.generateToken(admin)
    return response.created({ admin, token })
  }
}
