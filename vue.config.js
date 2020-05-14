module.exports = {
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    target: 'web'
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'xyz.prokosna.peatmpd',
        productName: 'peatmpd',
        win: {
          icon: 'build/icon.ico'
        },
        mac: {
          category: 'public.app-category.music',
          icon: 'build/icon.icns',
          target: 'zip'
        },
        linux: {
          target: ['AppImage', 'deb'],
          category: 'Audio',
          icon: 'build/icon.icns'
        }
      }
    }
  }
}
