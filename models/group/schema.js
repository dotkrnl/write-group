
/**
 * Group model schema
 */

module.exports = {
    name: { type: 'text', require: true, unique: true },
    secret: { type: 'text', require: true },
    email: { type: 'text' },
    create: { type: 'date', require: true, time: true }
};

