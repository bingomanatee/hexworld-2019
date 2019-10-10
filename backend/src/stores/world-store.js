import _ from 'lodash';
import uuid from 'uuid/v4';
import connect from './connect';

const ENV = process.env.NODE_ENV;
const ROOT = ENV === 'test' ? 'hexworld/-tests-/world' : 'hexworld/world';

function worldPath(id, part, key = null) {
  if (key) {
    return `${ROOT}/${id}/${part}/${key}`;
  }
  return `${ROOT}/${id}/${part}`;
}

export default function createWorldStore(logger) {

  return {
    async deleteTestData() {
      const ids = await connect.keys(`${ROOT  }*`);
      try {
        return Promise.all(ids.map(id => connect.del(id)))
      } catch(err) {
        console.log('error deleting all: ', err);
        return [];
      }
    },

    async find() {
      logger.debug('Finding worlds');
      let ids = await connect.keys(worldPath('*', 'info'));

      if (Array.isArray(ids)) {
      }
      ids = ids.map((id) => {
        const match = new RegExp(`${ROOT}\\/([^/]+)\\/`).exec(id);
        if (match) return match[1];
        return '';
      })
        .filter(a => a);

      return Promise.all(ids.map( async (id) => {
        const info = await connect.hgetall(worldPath(id, 'info'));
        return {id, info};
      }));
    },

    async get(id) {
      logger.debug(`Getting world with id ${id}`)
      const info = await connect.hgetall(worldPath(id, 'info'));
      const data = await connect.hget(worldPath(id, 'data'));
      return {info: info || {}, data: data || {}}
    },

    async create(record) {
      const info = _.get(record, 'info', {});
      const data = _.get(record, 'data', {});
      const id = uuid();
      try {
        if (!info.name) {
          throw new Error('no name');
        }
        const infoPath = worldPath(id, 'info');
        await Promise.all(Object.keys(info).map((key) => connect.hset(infoPath, key, info[key])));

        await connect.set(worldPath(id, 'data'), JSON.stringify(data));
        logger.debug(`Created new world`);
      } catch (err) {
        console.log('create error: ', err);
        throw err;
      }

      return {...record, id}
    },

    async update(id, data) {
      logger.debug(`Updated world ${id}`, data);
      return data
    },

    async remove(id) {
      logger.debug(`Removed world ${id}`)
    }
  }
}
