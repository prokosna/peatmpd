export default {
  profiles: [
    {
      id: 'default',
      name: 'Default',
      host: 'localhost',
      port: 6600,
      isDark: true
    }
  ],
  currentProfileId: 'default',
  metaTags: [],
  isLoading: false,
  infoMessage: null,
  successMessage: null,
  warningMessage: null,
  errorMessage: null,
  messageTimeout: null,
  connectingTimestamp: false,
  isFirstLanding: true
}
