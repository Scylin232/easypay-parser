const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MONGO_URI = "mongodb+srv://BigToysSettings:Lolik232@cluster0-gd4n6.mongodb.net/bigToysSettings"

const TokenSchema = new Schema({
  pageId: String,
  appId: String,
  bearerToken: String,
});
const CredentialsSchema = new Schema({
  login: String,
  password: String,
});

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const credentialsModel = mongoose.model('Credentials', CredentialsSchema, 'credentials');
const tokenModel = mongoose.model('Tokens', TokenSchema, 'tokens');

module.exports.tokenModel = tokenModel;
module.exports.credentialsModel = credentialsModel;