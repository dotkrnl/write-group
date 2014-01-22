
/**
 * Mesg model schema
 */

module.exports = {
    author: { type: 'text', require: true },
    content: { type: 'text', require: true, big: true },
    create: { type: 'date', require: true, time: true },
    group: { type: 'text', require: true },
    id: { type: 'number', require: true, unique: true },
};
