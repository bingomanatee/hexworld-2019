import axios from 'axios';
import _ from 'lodash';
import { Store } from '@wonderlandlabs/looking-glass-engine';

// eslint-disable-next-line prefer-destructuring
const API_URL = process.env.API_URL;
console.log('----- API_URL:', API_URL);

const WorldStore = new Store({
  actions: {
    async addWorld(store, { name, resolution }) {
      const { actions, state } = store;
      const { worlds, WorldClass } = state;
      const world = new WorldClass(name, resolution);
      world.store = store;
      worlds.set(name, world);

      axios.post(`${API_URL}/worlds`, world.toJSON());

      actions.setWorlds(worlds);
    },
    defineWorldClass(store, World) {
      store.actions.setWorldClass(World);
      World.store = store;
      console.log('worldClass set to ', World);
    },

    updateWorld({ actions, state }, world) {
      state.worlds.set(world.id, world);
      actions.setWorlds(state.worlds);
    },

    editWorldPoint(store, pointIndex, worldId) {
      store.actions.setEditedPoint({ pointIndex, worldId });
    },

    async fetch(store, id) {
      const World = store.state.WorldClass;
      try {
        const { data } = await axios.get(`${API_URL}/worlds/${id}`);
        // @TODO: examine schema
        console.log('fetch', id, 'data ---', data);
        let heights = _.get(data, 'data');
        const { info } = data;
        try {
          heights = JSON.parse(heights);
          const world = new World(info.name, Number.parseInt(info.resolution, 10), heights, id);
          world.store = store;
          store.state.worlds.set(id, world);
          await store.actions.setWorlds(store.state.worlds);
          console.log('updated world', id, 'with heights', heights);
        } catch (err) {
          console.log('set worlds error', err);
        }
      } catch (err) {
        console.log('bad fetch', err);
      }
      console.log('fetch done');
    },

    async load(store, purge = false) {
      const { state, actions } = store;
      const World = state.WorldClass;
      if (!World) {
        return;
      }
      const worlds = purge ? new Map() : state.worlds;
      const { data } = await axios.get(`${API_URL}/worlds`);
      if (Array.isArray(data)) {
        data.forEach(({ id, data, info }) => {
          const world = new World(info.name, Number.parseInt(info.resolution, 10), data, id);
          world.store = store;
          worlds.set(world.id, world);
        });
      }
      actions.setWorlds(worlds);
    },
    async save(store, world) {
      console.log('saving ', world.id, world.toJSON());
      let result;
      try {
        if (world.id) {
          result = await axios.put(`${API_URL}/worlds/${world.id}`, world.toJSON());
        } else {
          result = await axios.post(`${API_URL}/worlds`, world.toJSON());
          console.log('save result: ', result);
          const id = _.get(result, 'data.id');

          // eslint-disable-next-line no-param-reassign
          if (id) world.id = id;
        }
      } catch (err) {
        console.log('error saving', err);
      }
      console.log('save result: ', result);
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
  .addProp('WorldClass')
  .addProp('editedPoint')
  .addProp('worlds', {
    start: new Map(),
  });

export default WorldStore;
