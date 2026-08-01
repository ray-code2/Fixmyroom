const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';

module.exports = {
  expo: {
    name: 'Satin. - Hotel & Property Maintenance Platform',
    slug: 'satin-app',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    scheme: 'satin',
    extra: {
      apiUrl
    },
    web: {
      bundler: 'metro'
    }
  }
};
