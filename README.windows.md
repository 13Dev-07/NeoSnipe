# Windows Setup Instructions

If you encounter module not found errors, please try these steps:

1. Open command prompt as administrator
2. Navigate to the project directory
3. Run the following commands:

```batch
clean.bat
npm install
npm run dev
```

If the issue persists, verify that:
1. You are using Node.js version 18.17.0 or higher
2. All project files are in a path without special characters
3. You have run `npm cache clean --force` before installing

The scripts folder should contain:
- env.setup.js
- node-hook.js

These files are required for the development environment setup.