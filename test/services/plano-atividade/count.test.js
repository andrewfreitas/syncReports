const assert = require('assert');
const app = require('../../../../src/app');

describe('\'/plano-atividade/count\' service', () => {
  it('registered the service', () => {
    const service = app.service('plano-atividade/count');

    assert.ok(service, 'Registered the service');
  });
});
