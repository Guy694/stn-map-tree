const { join } = require('path');
console.log('process.cwd():', process.cwd());
console.log('Upload dir:', join(process.cwd(), 'public', 'uploads', 'trees'));
console.log('__dirname:', __dirname);
