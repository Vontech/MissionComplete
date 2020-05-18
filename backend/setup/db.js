import Mongoose from 'mongoose';

Mongoose.set('useNewUrlParser', true);
Mongoose.set('useFindAndModify', false);
Mongoose.set('useCreateIndex', true);

import Clients from '../models/clients.model';
import logger from './logger';
import config from './config';

export async function setupDB() {
    const { dbHost, dbPort, dbName } = config;
    try {
        if (process.env.MONGODB_URI) {
            await Mongoose.connect(process.env.MONGODB_URI);
            logger.info(`Connected to mongo server at ${process.env.MONGODB_URI}`);
        } else {
            await Mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`);
            logger.info(`Connected to mongo server at mongodb://${dbHost}:${dbPort}/${dbName}`);
        }

        await createBaseClient();

    } catch (err) {
        logger.error('Could not connect to MongoDB.');
    }
};

export async function createBaseClient() {
    // Create the base client if does not already exist
    await Clients.findOneAndUpdate({
        clientId: config.clientId,
    }, {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        grants: ['password']
    }, { upsert: true });

    logger.info('Successfully instantiated base client.');
}