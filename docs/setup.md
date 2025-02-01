# NeoSnipe Setup Instructions

## Prerequisites
- Node.js 14.x or higher
- npm 6.x or higher
- Git

## Installation Steps

### 1. Clone the Repository
```bash
git clone [repository-url]
cd NeoSnipe
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
1. Copy the `.env.example` file to `.env.local`
2. Update the environment variables as needed

### 4. Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### 5. Production Build
```bash
npm run build
npm start
```

## System Requirements
- Modern web browser with WebGL support
- Minimum 4GB RAM
- Recommended: SSD storage for development

## Deployment Options
- Vercel (recommended)
- AWS
- Digital Ocean
- Custom server setup

## Common Setup Issues
1. **WebGL Support**
   - Ensure your graphics drivers are up to date
   - Check browser WebGL support at `chrome://gpu`

2. **Node Version Mismatch**
   - Use `nvm` to manage Node.js versions
   - Run `nvm use` to switch to the correct version

3. **Build Errors**
   - Clear npm cache: `npm clean-cache --force`
   - Delete node_modules and reinstall dependencies