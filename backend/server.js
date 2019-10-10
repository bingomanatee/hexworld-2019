const Hapi = require('@hapi/hapi');
const connect = require('./src/stores/connect');
const world = require('./plugins/world');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  server.bind({ connect });
  await server.register(world);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

module.exports = init;
