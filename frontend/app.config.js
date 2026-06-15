const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';

module.exports = {
  expo: {
    name: 'FMR - Fix My Room',
    slug: 'fmr-mobile-app',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    scheme: 'fmr',
    extra: {
      apiUrl
    },
    web: {
      bundler: 'metro'
    }
  }
};
