/* globals describe,expect,it */

import _ from 'lodash';
import { throws } from 'smid';
import { apiHelper } from './api-helper';

// TIP: if you have more than a handful of tests here
// in can be beneficial to split them into multiple files for
// test speed.
describe('worlds API', () => {
  it('can create world', async () => {
    const api = await apiHelper();
    try {
      await api.deleteTestData();
    } catch (err) {
      console.log('can create world error: ', err);
    }
    const world = await api.createWorld({
      info: {
        name: 'alpha',
        resolution: 3
      },
      data: { heights: [1, 2, 3] }
    });

    expect(world.id)
      .toBeDefined();
    expect(world.info)
      .toEqual(
        expect.objectContaining({
          name: 'alpha',
          resolution: 3
        })
      );
  });

  it.skip('can get world', async () => {
    const api = await apiHelper();
    const created = await api.createWorld({
      title: 'Hello'
    });

    const gotten = await api.getWorld(created.id);
    expect(gotten)
      .toEqual(created);
  });

  it.skip('can remove world', async () => {
    const api = await apiHelper();
    const created = await api.createWorld({
      title: 'Hello'
    });

    await api.removeWorld(created.id);

    const { response } = await throws(api.getWorld(created.id));
    expect(response.status)
      .toBe(404);
  });

  it('can find worlds', async () => {
    const api = await apiHelper();
    await api.deleteTestData();
    const world = await api.createWorld({
      info: {
        name: 'alpha',
        resolution: 3
      },
      data: { heights: [1, 2, 3] }
    });
    const world2 = await api.createWorld({
      info: {
        name: 'beta',
        resolution: 2
      },
      data: { heights: [4, 5, 6] }
    });

    const result = await api.findWorlds();
    const foundWorld = _.find(result, { id: world.id });
    expect(_.get(foundWorld, 'info.name'))
      .toBe(world.info.name);
    const foundWorld2 = _.find(result, { id: world2.id });
    expect(_.get(foundWorld2, 'info.name'))
      .toBe(world2.info.name);
  });

  it.skip('can update world', async () => {
    const api = await apiHelper();
    const created = await api.createWorld({
      title: 'Hello'
    });

    const updated = await api
      .updateWorld(created.id, {
        title: 'World',
        completed: true
      })
      .catch(api.catch);

    expect(updated.id)
      .toBe(created.id);
    expect(updated.title)
      .toBe('World');
    expect(updated.completed)
      .toBe(true);
  });
});
