# Windows Setup Guide for Sacred Geometry Project

## Prerequisites
- Node.js (LTS version recommended)
- Git
- Visual Studio Code (recommended)
- Windows Terminal (recommended)

## Installation Steps

1. Clone the Repository
```bash
git clone [repository-url]
cd [project-directory]
```

2. Install Dependencies
```bash
npm install
```

3. Environment Setup
- Copy `.env.example` to `.env`
- Update environment variables as needed

4. Development Server
```bash
npm run dev
```

5. Build for Production
```bash
npm run build
```

## Troubleshooting Common Windows Issues

### Node-gyp Issues
If you encounter node-gyp errors:
1. Install Visual Studio Build Tools
2. Install Python 2.7
3. Run `npm config set python python2.7`

### WebGL Support
- Ensure your graphics drivers are up to date
- Check that hardware acceleration is enabled in your browser

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── pages/         # Next.js pages
├── shaders/       # GLSL shaders
├── styles/        # CSS and styling
└── utils/         # Utility functions
```

## Development Guidelines
1. Use VSCode for best developer experience
2. Enable ESLint and Prettier extensions
3. Run tests before commits: `npm test`
4. Follow the existing code style

## Performance Optimization
- Use the built-in performance monitoring tools
- Follow WebGL best practices
- Implement lazy loading where appropriate

## Need Help?
- Check the documentation in the `docs` folder
- Raise an issue on the repository
- Contact the development team