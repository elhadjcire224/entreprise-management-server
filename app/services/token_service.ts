import Administrator from '#models/administrator'

export default class TokensService {
  static async generateToken(admin: Administrator) {
    return await Administrator.accessTokens.create(admin)
  }

  static async deleteAllPreviousTokens(admin: Administrator) {
    const tokens = await Administrator.accessTokens.all(admin)
    Promise.race(
      tokens.map(
        (value) =>
          new Promise((resolve) => {
            resolve(Administrator.accessTokens.delete(admin, value.identifier))
          })
      )
    )
    return !!(await Administrator.accessTokens.all(admin))
  }
}
