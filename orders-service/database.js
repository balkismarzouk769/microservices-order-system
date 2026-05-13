const { createRxDatabase } = require('rxdb');
const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');

async function createDatabase() {

    const db = await createRxDatabase({
        name: 'ordersdb',
        storage: getRxStorageMemory(),
        ignoreDuplicate: true
    });

    await db.addCollections({
        orders: {
            schema: {
                title: 'orders schema',
                version: 0,
                primaryKey: 'id',
                type: 'object',

                properties: {

                    id: {
                        type: 'string',
                        maxLength: 100
                    },

                    userId: {
                        type: 'number'
                    },

                    products: {
                        type: 'array',

                        items: {
                            type: 'object',

                            properties: {

                                productId: {
                                    type: 'number'
                                },

                                quantity: {
                                    type: 'number'
                                }
                            }
                        }
                    },

                    total: {
                        type: 'number'
                    }
                },

                required: ['id', 'userId', 'products', 'total']
            }
        }
    });

    return db;
}

module.exports = createDatabase;