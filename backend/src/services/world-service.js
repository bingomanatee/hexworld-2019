import { NotFound, BadRequest } from 'fejl';
import { pick, get as lGet } from 'lodash';

// Prefab assert function.
const assertId = BadRequest.makeAssert('No id given');

// Prevent overposting.
const pickProps = data => pick(data, ['info', 'data']);

/**
 * World Service.
 * Gets a world store injected.
 */
export default class WorldService {
  constructor(worldStore) {
    this.worldStore = worldStore;
  }

  async find(params) {
    return this.worldStore.find(params);
  }

  async deleteTestData() {
    return this.worldStore.deleteTestData();
  }

  async get(id) {
    assertId(id);
    // If `worldStore.get()` returns a falsy value, we throw a
    // NotFound error with the specified message.
    return this.worldStore
      .get(id)
      .then(NotFound.makeAssert(`World with id "${id}" not found`));
  }

  async create(record) {
    BadRequest.assert(record, 'No world payload given');
    BadRequest.assert(record.info, 'info is required');
    BadRequest.assert(record.data, 'data is required');
    return this.worldStore.create(pickProps(record));
  }

  async update(id, record) {
    assertId(id);
    BadRequest.assert(record, 'No world payload given');
    BadRequest.assert(record.info, 'info is required');
    BadRequest.assert(record.data, 'data is required');
    return this.worldStore.update(id, pickProps(record));
  }

  async remove(id) {
    // Make sure the world exists by calling `get`.
    await this.get(id);
    return this.worldStore.remove(id);
  }
}
