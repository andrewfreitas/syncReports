const assert = require('assert');
const app = require('../../../../src/app');

describe('\'/plano-atividade/export\' service', () => {
  it('registered the service', () => {
    const service = app.service('plano-atividade/export');

    assert.ok(service, 'Registered the service');
  });
});
