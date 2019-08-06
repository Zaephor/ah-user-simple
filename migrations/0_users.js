exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('user', function (table) {
      table.increments('id').primary()
      table.uuid('uuid').unique().notNullable()
      table.string('domain', 255).notNullable().defaultTo('') // SQLITE doesn't like compound unique indexes with NULL
      table.string('email', 255).notNullable()
      table.string('password', 255).notNullable()

      table.timestamps(true, true)

      table.unique(['domain', 'email'])
    })
}

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable('user')
}
