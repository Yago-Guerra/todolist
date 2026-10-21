const { PrismaClient } = require('@prisma/client');

const banco = new PrismaClient();
module.exports = banco;
