import { StackConfig } from '../config/options';

// These functions return base template strings for different root files. 
// We are building a modern standalone Angular format template (Angular 17+ style).
// If older versions are selected, this generator could theoretically adapt the template in the future.

export function getBasePackageJson(config: StackConfig): any {
  return {
    name: config.projectName.toLowerCase().replace(/\s+/g, '-'),
    version: "0.0.0",
    scripts: {
      "ng": "ng",
      "start": "ng serve",
      "build": "ng build",
      "watch": "ng build --watch --configuration development",
      "test": "ng test"
    },
    private: true,
    dependencies: {
      "@angular/animations": `^${config.angularVersion}.0.0`,
      "@angular/common": `^${config.angularVersion}.0.0`,
      "@angular/compiler": `^${config.angularVersion}.0.0`,
      "@angular/core": `^${config.angularVersion}.0.0`,
      "@angular/forms": `^${config.angularVersion}.0.0`,
      "@angular/platform-browser": `^${config.angularVersion}.0.0`,
      "@angular/platform-browser-dynamic": `^${config.angularVersion}.0.0`,
      "@angular/router": `^${config.angularVersion}.0.0`,
      "rxjs": "~7.8.0",
      "tslib": "^2.3.0",
      "zone.js": "~0.14.3"
    },
    devDependencies: {
      "@angular-devkit/build-angular": `^${config.angularVersion}.0.0`,
      "@angular/cli": `^${config.angularVersion}.0.0`,
      "@angular/compiler-cli": `^${config.angularVersion}.0.0`,
      "@types/jasmine": "~5.1.0",
      "jasmine-core": "~5.1.0",
      "karma": "~6.4.0",
      "karma-chrome-launcher": "~3.2.0",
      "karma-coverage": "~2.2.0",
      "karma-jasmine": "~5.1.0",
      "karma-jasmine-html-reporter": "~2.1.0",
      "typescript": "~5.4.2"
    }
  };
}

export function getAngularJson(config: StackConfig): any {
  return {
    "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
    "version": 1,
    "newProjectRoot": "projects",
    "projects": {
      [config.projectName]: {
        "projectType": "application",
        "schematics": {
          "@schematics/angular:component": {
            "style": "scss",
            "standalone": true
          },
          "@schematics/angular:directive": {
            "standalone": true
          },
          "@schematics/angular:pipe": {
            "standalone": true
          }
        },
        "root": "",
        "sourceRoot": "src",
        "prefix": "app",
        "architect": {
          "build": {
            "builder": "@angular-devkit/build-angular:browser",
            "options": {
              "outputPath": "dist/" + config.projectName,
              "index": "src/index.html",
              "main": "src/main.ts",
              "polyfills": [
                "zone.js"
              ],
              "tsConfig": "tsconfig.app.json",
              "inlineStyleLanguage": "scss",
              "assets": [
                "src/favicon.ico",
                "src/assets"
              ],
              "styles": [
                "src/styles.scss"
              ],
              "scripts": []
            }
          },
          "serve": {
            "builder": "@angular-devkit/build-angular:dev-server",
            "options": {
              "buildTarget": `${config.projectName}:build`
            }
          }
        }
      }
    }
  };
}

export const MAIN_TS = `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
`;

export const APP_CONFIG_TS = `import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes)
  ]
};
`;

export const APP_ROUTES_TS = `import { Routes } from '@angular/router';

export const routes: Routes = [];
`;

export const APP_COMPONENT_TS = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: \`
    <main class="container">
      <h1>Welcome to {{ title }}!</h1>
      <p>This project was generated using AI Hub Angular Stack Builder.</p>
      <router-outlet></router-outlet>
    </main>
  \`,
  styles: [\`:host { display: block; padding: 2rem; }\`]
})
export class AppComponent {
  title = 'my-angular-app';
}
`;

export const INDEX_HTML = (title: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
`;

export const TSCONFIG_APP_JSON = `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts",
    "src/polyfills.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}`;

export const TSCONFIG_JSON = `{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": [
      "ES2022",
      "dom"
    ]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}`;
