/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AuthController = () => import('#controllers/auth_controller')
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
  })
  .prefix('api/v1')
