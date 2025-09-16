module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NOTE: `expo-router/babel` is a plugin that you must install if you use Expo Router
      require.resolve('expo-router/babel'),
      // Reanimated plugin has to be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};