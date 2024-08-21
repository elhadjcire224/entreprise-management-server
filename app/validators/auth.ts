import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8),
  })
)

export const registrationValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const exists = await db.from('administrators').select('id').whereILike('email', value)
        return !!exists.length
      }),
    password: vine.string().minLength(6),
  })
)
