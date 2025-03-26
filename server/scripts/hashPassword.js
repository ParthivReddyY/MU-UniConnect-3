const bcrypt = require('bcryptjs');

const hashPassword = async () => {
  const password = 'Parthiv@9';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Hashed password:');
  console.log(hashedPassword);
};

hashPassword();
