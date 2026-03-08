import { StackConfig } from '../config/options';

// This applies specific framework mutations (dependencies and files) on top of the zip structure
export function applyFramework(
  config: StackConfig, 
  packageJson: any, 
  angularJson: any,
  addFileToZip: (path: string, content: string) => void
) {
  let globalStyles = `/* You can add global styles to this file, and also import other style files */\n`;

  // Apply Tailwind
  if (config.uiFramework === 'tailwind') {
    packageJson.devDependencies['tailwindcss'] = '^3.4.0';
    packageJson.devDependencies['postcss'] = '^8.4.0';
    packageJson.devDependencies['autoprefixer'] = '^10.4.0';
    
    addFileToZip('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`);
    globalStyles += `\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
  }

  // Apply Bootstrap
  if (config.uiFramework === 'bootstrap') {
    packageJson.dependencies['bootstrap'] = '^5.3.0';
    // Insert into angular.json styles
    const stylesIndex = angularJson.projects[config.projectName].architect.build.options.styles;
    stylesIndex.unshift("node_modules/bootstrap/dist/css/bootstrap.min.css");
  }

  // Apply PrimeNG
  if (config.primeNgVersion && config.primeNgVersion !== 'none') {
    packageJson.dependencies['primeng'] = `^${config.primeNgVersion}.0.0`;
    packageJson.dependencies['primeicons'] = `^7.0.0`;
    
    // Add default CSS
    const stylesIndex = angularJson.projects[config.projectName].architect.build.options.styles;
    stylesIndex.unshift("node_modules/primeicons/primeicons.css");
    // Depending on version, PrimeNG 18+ uses newer theming, prior versions used standard css themes
    if (parseInt(config.primeNgVersion) < 18) {
       stylesIndex.unshift(`node_modules/primeng/resources/themes/lara-light-blue/theme.css`);
       stylesIndex.unshift(`node_modules/primeng/resources/primeng.min.css`);
    }
  }

  // Apply ESLint
  if (config.linting === 'eslint') {
    packageJson.devDependencies['eslint'] = '^8.56.0';
    packageJson.devDependencies['typescript-eslint'] = '^7.0.0';
    packageJson.devDependencies['@angular-eslint/builder'] = `^${config.angularVersion}.0.0`;
    packageJson.devDependencies['@angular-eslint/eslint-plugin'] = `^${config.angularVersion}.0.0`;
    packageJson.devDependencies['@angular-eslint/eslint-plugin-template'] = `^${config.angularVersion}.0.0`;
    packageJson.devDependencies['@angular-eslint/schematics'] = `^${config.angularVersion}.0.0`;
    packageJson.devDependencies['@angular-eslint/template-parser'] = `^${config.angularVersion}.0.0`;

    addFileToZip('.eslintrc.json', `{
  "root": true,
  "ignorePatterns": [
    "projects/**/*"
  ],
  "overrides": [
    {
      "files": [
        "*.ts"
      ],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
      ]
    },
    {
      "files": [
        "*.html"
      ],
      "extends": [
        "plugin:@angular-eslint/template/recommended",
        "plugin:@angular-eslint/template/accessibility"
      ],
      "rules": {}
    }
  ]
}
`);
  }

  addFileToZip('src/styles.scss', globalStyles);
}
