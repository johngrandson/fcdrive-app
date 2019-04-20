if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: './.env' });
}

const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true)

mongoose.connect(`mongodb://${process.env.COSMODDB_USER}.documents.azure.com:10255/${process.env.COSMODDB_USER}` + "?ssl=true", {
    auth: {
        user: process.env.COSMODDB_USER,
        password: process.env.COSMODDB_PWD
    }
})
    .then(() => console.log('Connection to CosmosDB successful'))
    .catch((err) => console.error(err));

mongoose.Promise = global.Promise;

module.exports = mongoose;