import fs from 'fs';

const args = process.argv.slice(2);
const version = args[0];

/////// Define paths ///////
const packageJsonPath = [
   'frontend/package.json',
   'backend/package.json',
   'package.json'
];
const envFilePath = [
   'frontend/.env',
   'frontend/.env.production',
];


if (!version) {
   console.error('Please provide a version argument.');
   process.exit(1);
}

const verPrefix = version.includes('-')
   ? (version.split('-')[0].charCodeAt(0).toString(8).slice(-2))
   : '';
const npmCompatibleVersion = verPrefix + version.replace(/[^0-9.]/g, '');


/////// Update package.json ///////
packageJsonPath.forEach((filePath) => {
   if (fs.existsSync(filePath)) {
      const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      config.version = npmCompatibleVersion;

      if (config.scripts) {
         for (const scriptName in config.scripts) {
            if (!scriptName.startsWith('d')) continue;

            config.scripts[scriptName] = config.scripts[scriptName]
               .replace(/(?:\w*-)?\d{1,4}\.\d{1,4}\.\d{1,4}/g, version);
         }
      }

      const updatedPkgJson = JSON.stringify(config, null, 2);
      fs.writeFileSync(filePath, updatedPkgJson);
   }
   else {
      console.warn(`File not found: ${filePath}`);
   }
});


/////// Update .env file ///////
envFilePath.forEach((filePath) => {
   if (fs.existsSync(filePath)) {
      const envContent = fs.readFileSync(filePath, 'utf8');
      const updatedEnvContent = envContent.replace(
         /APP_VERSION=.*/g,
         `APP_VERSION=${version}`
      );

      fs.writeFileSync(filePath, updatedEnvContent);
   }
   else {
      console.warn(`File not found: ${filePath}`);
   }
});
