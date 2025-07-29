// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import noSimpleReturnTypes from './eslint-rules/no-simple-return-types.js'
import tsxPropsPattern from './eslint-rules/tsx-props-pattern.js'
import propsChildrenPattern from './eslint-rules/props-children-pattern.js'
import noBlockComments from './eslint-rules/no-block-comments.js'

const customRules = {
	'no-simple-return-types': noSimpleReturnTypes,
	'tsx-props-pattern': tsxPropsPattern,
	'props-children-pattern': propsChildrenPattern,
	'no-block-comments': noBlockComments,
}

export default tseslint.config(
	[
		{
			ignores: ['dist/**/*', 'temp/**/*', 'backend/**/*', 'src/components/ui/**', 'src/stories/**'],
		},
		{
			files: ['**/*.{ts,tsx}'],
			extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs['recommended-latest'], reactRefresh.configs.vite],
			languageOptions: {
				ecmaVersion: 2020,
				globals: globals.browser,
			},
			plugins: {
				custom: { rules: customRules },
			},
			rules: {
				'@typescript-eslint/no-unused-vars': 'off',
				// NOTE: shadcn button 组件会报错
				'react-refresh/only-export-components': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'react-hooks/exhaustive-deps': 'off',
				'@typescript-eslint/no-empty-object-type': 'off',
				'@typescript-eslint/ban-ts-comment': 'off', // 允许 @ts-ignore 注释，非强制 @ts-expect-error

				// == custom ==
				'custom/no-simple-return-types': 'error',
				'custom/tsx-props-pattern': 'error',
				'custom/props-children-pattern': 'error',
				'custom/no-block-comments': [
					'warn',
					{
						allowJSDoc: true,
					},
				],
			},
		},
	],
	storybook.configs['flat/recommended']
)
