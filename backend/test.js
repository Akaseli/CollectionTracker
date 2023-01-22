const bcrypt = require('bcrypt');

const saltRounds = 10;
const password = '123456';

const hash = bcrypt.hashSync(password, 10)

const match = bcrypt.compareSync(password, hash)

console.log(match)
