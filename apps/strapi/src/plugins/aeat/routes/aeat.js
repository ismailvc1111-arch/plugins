'use strict';

module.exports = [
  {
    method: 'POST',
    path: '/aeat/sii/send/:invoiceId',
    handler: 'aeat.sendSii',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
];
