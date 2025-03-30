# PromptHub Development Guide

## Commands
- Start server: `npm start`
- Start client: `cd client && npm start`
- Run both concurrently: `npx concurrently "npm start" "cd client && npm start"`
- Run client tests: `cd client && npm test`
- Run single test: `cd client && npm test -- -t "test name"`
- Build client: `cd client && npm run build`

## Code Style Guidelines
- **Imports**: Group imports by type (React, libraries, components, styles)
- **Formatting**: Use 2-space indentation, semicolons at end of lines
- **Naming**: camelCase for variables/functions, PascalCase for components/classes, UPPERCASE for constants
- **Components**: 1 component per file, use functional components with hooks
- **Error Handling**: Use try/catch blocks with specific error messages
- **State Management**: Use React hooks for state (useState, useContext)
- **API Calls**: Centralize in dedicated service files
- **Comments**: Document complex logic, use JSDoc for functions
- **Mongoose**: Define schemas with validation, use timestamps
- **Authentication**: Use JWT tokens with proper expiration
- **Localization**: Prepare for Japanese and English UI