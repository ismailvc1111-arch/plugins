module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
  i18n: {
    enabled: true,
  },
  aeat: {
    enabled: true,
    resolve: './src/plugins/aeat'
  },
});
