import vine from '@vinejs/vine'

export const paginationValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().range([1, 100]).optional(),
    status: vine.string().optional(),
    search: vine.string().optional(),
  })
)
