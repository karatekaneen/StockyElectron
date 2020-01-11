module.exports = {
	transformIgnorePatterns: ['<rootDir>/node_modules/(?!lightweight-charts)'],
	testMatch: [
		'<rootDir>/src/**/*.(spec|test).(ts|js)',
		'<rootDir>/tests/**/*.(spec|test).(ts|js)'
	],
	preset: '@vue/cli-plugin-unit-jest'
}
