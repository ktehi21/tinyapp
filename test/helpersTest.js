const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');


const users = {
  h0fdkc: {
    id: 'h0fdkc',
    email: 'a@a.com',
    password: '$2a$10$FTlSnoom0j2/CN.hkoke/eDlX20uOFYQmbBLbjBcEAI3JHq2b4oNa'
  },
  abgjzj: {
    id: 'abgjzj',
    email: 'b@b.com',
    password: '$2a$10$m/TNVclJzLrkI9o58Ao.f.Wy5oQdzj68VjHMQaRVJeP.yv6P8RZ/G'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("a@a.com");
    const expectedUserID = "h0fdkc";
    // Write your assert statement here
    assert.deepEqual(user.email, users[expectedUserID].email);
  });
});