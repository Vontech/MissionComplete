import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  clientId: { type: String },
  clientSecret: { type: String },
  redirectUris: { type: Array },
  grants: {type: [String] }
});

const Clients = mongoose.model('Client', ClientSchema);

export default Clients;