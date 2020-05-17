const Suite = require('node-test');
const suite = new Suite('API Unit Tests');

suite.test('Test 1', t => {
  return t.assert(true);
});
