{
  "appId": "com.miror.v3",
  "appName": "Miror",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "buildOptions": {
      "keystorePath": "release-key.keystore",
      "keystoreAlias": "miror-key"
    }
  },
  "plugins": {
    "Haptics": {
      "android": {
        "vibrateTimings": true
      }
    }
  }
}