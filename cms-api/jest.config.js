module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/__tests__/**'
    ],
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            lines: 40,
            branches: 30,
            functions: 35,
            statements: 40
        }
    },
    verbose: true,
    setupFilesAfterEnv: ['./jest.setup.js']
};
