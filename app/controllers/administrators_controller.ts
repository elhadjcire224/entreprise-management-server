import CompanyStatus from '#enums/company_status'
import Roles from '#enums/roles'
import Administrator from '#models/administrator'
import Company from '#models/company'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AdministratorsController {
  /**
   * Display a list of resource
   */
  async index({ response, auth }: HttpContext) {
    const loggedUser = auth.user!
    const users = await Administrator.query()
      .select('administrators.*')
      .whereNot('id', loggedUser.id)
      .withCount('assignedCompanies', (query) => {
        query.as('assignedCompaniesCount')
      })
      .withCount('assignedCompanies', (query) => {
        query.where('status', CompanyStatus.ACCEPTED).as('validatedCompaniesCount')
      })

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      assignedCompaniesCount: user.$extras.assignedCompaniesCount,
      validatedCompaniesCount: user.$extras.validatedCompaniesCount,
    }))

    return response.ok({ users: formattedUsers })
  }

  async validators({ response }: HttpContext) {
    const administrators = await Administrator.query().where('role', Roles.VALIDATOR)
    return response.ok(administrators)
  }

  async toggleRole({ params, response }: HttpContext) {
    const user = await Administrator.findOrFail(params.id)
    user.role === Roles.VALIDATOR ? (user.role = Roles.ADMIN) : (user.role = Roles.VALIDATOR)
    await user.save()
    return response.ok({ message: 'Role updated' })
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const user = await Administrator.findOrFail(params.id)
    await user.delete()
    return response.noContent()
  }

  async dashboard({ response }: HttpContext) {
    const now = DateTime.now()
    const startOfMonth = now.startOf('month')
    const startOfLastMonth = now.minus({ months: 1 }).startOf('month')

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) {
        if (current === 0) return 'Aucun changement'
        return 'Nouveau'
      }
      const percentChange = ((current - previous) / previous) * 100
      return `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`
    }

    const totalCompaniesNow = Number((await Company.query().count('* as total'))[0].$extras.total)
    const totalCompaniesLastMonth = Number(
      (await Company.query().where('created_at', '<', startOfMonth.toSQL()).count('* as total'))[0]
        .$extras.total
    )

    const pendingValidationsNow = Number(
      (await Company.query().where('status', 'PENDING').count('* as total'))[0].$extras.total
    )
    const pendingValidationsLastMonth = Number(
      (
        await Company.query()
          .where('status', 'PENDING')
          .where('created_at', '<', startOfMonth.toSQL())
          .count('* as total')
      )[0].$extras.total
    )

    const validatedThisMonth = Number(
      (
        await Company.query()
          .where('status', 'ACCEPTED')
          .whereBetween('updated_at', [startOfMonth.toSQL(), now.toSQL()])
          .count('* as total')
      )[0].$extras.total
    )
    const validatedLastMonth = Number(
      (
        await Company.query()
          .where('status', 'ACCEPTED')
          .whereBetween('updated_at', [startOfLastMonth.toSQL(), startOfMonth.toSQL()])
          .count('* as total')
      )[0].$extras.total
    )

    const rejectedThisMonth = Number(
      (
        await Company.query()
          .where('status', 'REJECTED')
          .whereBetween('updated_at', [startOfMonth.toSQL(), now.toSQL()])
          .count('* as total')
      )[0].$extras.total
    )
    const rejectedLastMonth = Number(
      (
        await Company.query()
          .where('status', 'REJECTED')
          .whereBetween('updated_at', [startOfLastMonth.toSQL(), startOfMonth.toSQL()])
          .count('* as total')
      )[0].$extras.total
    )

    const recentActivities = await Company.query()
      .select('companies.*', 'administrators.name as user_name')
      .leftJoin('administrators', 'companies.administrator_id', 'administrators.id')
      .orderBy('companies.updated_at', 'desc')
      .limit(5)

    return response.ok({
      metrics: [
        {
          title: 'Total des Entreprises',
          value: totalCompaniesNow,
          change: `${calculateChange(totalCompaniesNow, totalCompaniesLastMonth)} depuis le mois dernier`,
          icon: 'BuildingIcon',
        },
        {
          title: 'Validations en Attente',
          value: pendingValidationsNow,
          change: `${calculateChange(pendingValidationsNow, pendingValidationsLastMonth)} depuis le mois dernier`,
          icon: 'ClockIcon',
        },
        {
          title: 'Validées ce Mois',
          value: validatedThisMonth,
          change: `${calculateChange(validatedThisMonth, validatedLastMonth)} depuis le mois dernier`,
          icon: 'CheckIcon',
        },
        {
          title: 'Rejetées ce Mois',
          value: rejectedThisMonth,
          change: `${calculateChange(rejectedThisMonth, rejectedLastMonth)} depuis le mois dernier`,
          icon: 'XIcon',
        },
      ],
      recentActivities: recentActivities.map((activity) => ({
        company: activity.companyName,
        action:
          activity.status === 'ACCEPTED'
            ? 'VALIDÉE'
            : activity.status === 'REJECTED'
              ? 'REJETÉE'
              : activity.status === 'PENDING'
                ? 'EN ATTENTE'
                : activity.status,
        user: activity.$extras.user_name || 'N/A',
        dateTime: activity.updatedAt.toFormat('dd/MM/yyyy HH:mm:ss'),
      })),
    })
  }
}
