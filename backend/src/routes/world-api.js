import { createController } from 'awilix-koa'

// This is our API controller.
// All it does is map HTTP calls to service calls.
// This way our services could be used in any type of app, not
// just over HTTP.
const api = worldService => ({
  findWorlds: async ctx => ctx.ok(await worldService.find(ctx.query)),
  getWorld: async ctx => ctx.ok(await worldService.get(ctx.params.id)),
  createWorld: async ctx => ctx.created(await worldService.create(ctx.request.body)),
  updateWorld: async ctx =>
    ctx.ok(await worldService.update(ctx.params.id, ctx.request.body)),
  removeWorld: async ctx =>
    ctx.noContent(await worldService.remove(ctx.params.id)),
  deleteTestData: async ctx => ctx.ok(await worldService.deleteTestData()),
})

// Maps routes to method calls on the `api` controller.
// See the `awilix-router-core` docs for info:
// https://github.com/jeffijoe/awilix-router-core
export default createController(api)
  .prefix('/worlds')
  .get('', 'findWorlds')
  .get('/:id', 'getWorld')
  .post('', 'createWorld')
  .put('/:id','updateWorld')
  .patch('/:id', 'updateWorld')
  .delete('/:id', 'removeWorld')
  .delete('/:id/testdata', 'deleteTestData');
