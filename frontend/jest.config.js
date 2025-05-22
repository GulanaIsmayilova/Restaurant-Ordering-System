module.exports = {
  transformIgnorePatterns: [
    '/node_modules/(?!axios|@stomp/stompjs|sockjs-client)'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    '^axios$': '<rootDir>/__mocks__/axios.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
}; 