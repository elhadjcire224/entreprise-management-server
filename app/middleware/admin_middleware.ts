import Roles from '#enums/roles'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const user = await ctx.auth.authenticate()
    if (user.role !== Roles.ADMIN) {
      return ctx.response.forbidden({ message: 'Access denied. Admin role required.' })
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
