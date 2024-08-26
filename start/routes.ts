/*
|--------------------------------------------------------------------------
| routers file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AuthController = () => import('#controllers/auth_controller')
const CompaniesController = () => import('#controllers/companies_controller')
const CompanyDocumentsController = () => import('#controllers/company_documents_controller')
const BusinessSectorsController = () => import('#controllers/business_sectors_controller')
const AdministratorsController = () => import('#controllers/administrators_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router
  .group(() => {
    router
      .group(() => {
        router.post('register', [AuthController, 'register']).as('register')
        router.post('login', [AuthController, 'login']).as('login')
        router.post('logout', [AuthController, 'logout']).as('logout').use(middleware.auth())
      })
      .as('auth')
      .prefix('/auth')

    router
      .group(() => {
        router
          .group(() => {
            // route dont seleument les admin peuvent acceder
            router.put(':id', [CompaniesController, 'update']).as('update')
            router.delete(':id', [CompaniesController, 'destroy']).as('destroy')
          })
          .use(middleware.admin())

        router.get('/', [CompaniesController, 'index']).as('index')
        router.get(':id', [CompaniesController, 'show']).as('show')
        router.post(':id/validate', [CompaniesController, 'validate']).as('validate')
        router.post(':id/assign', [CompaniesController, 'assignCompany']).as('assign')
      })
      .prefix('/companies')
      .as('companies')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [AdministratorsController, 'index']).as('index')
        router.put(':id/toggle-role', [AdministratorsController, 'toggleRole']).as('toggle-role')
        router.delete(':id', [AdministratorsController, 'destroy']).as('destroy')
      })
      .prefix('/users')
      .use([middleware.auth(), middleware.admin()])
    router.get('me', [AuthController, 'me']).use(middleware.auth())
    router
      .resource('business-sectors', BusinessSectorsController)
      .as('business-sectors')
      .apiOnly()
      .except(['index'])
      .use('*', [middleware.auth(), middleware.admin()])

    router
      .get('validators', [AdministratorsController, 'validators'])
      .use([middleware.auth(), middleware.admin()])
    router.get('admin/dashboard', [AdministratorsController, 'dashboard'])
    router.get('business-sectors', [BusinessSectorsController, 'index'])
    router.group(() => {
      // Public company registration flow
      router.post('companies', [CompaniesController, 'initializeRegistration'])
      router.post('companies/:id/rccm', [CompanyDocumentsController, 'uploadRccm'])
      router.post('companies/:id/payment-proof', [CompanyDocumentsController, 'uploadPaymentProof'])
      router.post('companies/:id/finalize', [CompaniesController, 'finalizeRegistration'])
    })
  })
  .prefix('api/v1')
