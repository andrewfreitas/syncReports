const assert = require('assert');
const app = require('../../src/app');

describe('\'poc\' service', () => {
  it('registered the service', () => {
    const service = app.service('poc');

    assert.ok(service, 'Registered the service');
  });
});
