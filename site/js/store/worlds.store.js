import axios from 'axios';
import { Store } from '@wonderlandlabs/looking-glass-engine';
import { World } from '../hexagon';

// eslint-disable-next-line prefer-destructuring
const API_URL = process.env.API_URL;
console.log('----- API_URL:', API_URL);

const WorldStore = new Store({
  actions: {
    async addWorld({ actions, state }, { name, resolution }) {
      const { worlds } = state;
      const world = new World(name, resolution);
      worlds.set(name, world);

      axios.post(`${API_URL}/worlds`, world.toJSON());

      actions.setWorlds(worlds);
    },
    updateWorld({ actions, state }, world) {
      console.log('updating world', world);
      state.worlds.forEach((_, name) => {
        if (state.worlds.get(name) === world) {
          state.worlds.delete(name);
        }
      });

      state.worlds.set(world.name, world);
      actions.setWorlds(state.worlds);
    },

    async load({ state, actions }, purge = false) {
      const worlds = purge ? new Map() : state.worlds;
      const { data } = await axios.get(`${API_URL}/worlds`);
      if (Array.isArray(data)) {
        data.forEach(({ id, data, info }) => {
          const world = new World(info.name, Number.parseInt(info.resolution, 10), data, id);
          worlds.set(world.id, world);
        });
      }
      actions.setWorlds(worlds);
    },
    async save(store, world) {
      let result;
      if (world.id) {
        result = await axios.put(`${API_URL}/worlds/${world.id}`, world.toJSON());
      } else {
        result = await axios.post(`${API_URL}/worlds`, world.toJSON());
      }

      console.log('save result: ', result);
      const id = _.get(result, 'data.id');

      // eslint-disable-next-line no-param-reassign
      if (id) world.id = id;
    },

    async deleteWorld(store, world) {
      if (!world.id) return;
      try {
        await axios.delete(`${API_URL}/worlds/${world.id}`);
        await store.actions.load(true);
      } catch (err) {
        console.log('delete error: ', err);
      }
    },
  },
})
  .addProp('worlds', {
    start: new Map(),
  });

export default WorldStore;
