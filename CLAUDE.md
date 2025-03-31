# PromptHub Development Guide

## Commands
- Start server: `npm start` or watch mode: `npm run server`
- Start client: `cd client && npm start`
- Run concurrently: `npm run dev`
- Run client tests: `cd client && npm test`
- Run single test: `cd client && npm test -- -t "test name"`
- Build client: `cd client && npm run build`
- Create production build: `cd client && npm run build && npm start`

## Code Style Guidelines
- **Imports**: Group by type (React, libraries, components, styles)
- **Formatting**: 2-space indentation, semicolons, max 80 chars per line
- **Naming**: camelCase (variables/functions), PascalCase (components/classes), UPPERCASE (constants)
- **Components**: One component per file, use functional components with hooks
- **State Management**: Use React hooks (useState, useContext)
- **API Calls**: Centralize in dedicated service files with proper error handling
- **Error Handling**: Use try/catch with specific error messages
- **Mongoose**: Define schemas with validation, use timestamps
- **Authentication**: JWT tokens with proper expiration
- **Localization**: Support Japanese and English (comments in both languages)
- **Testing**: Component/unit tests with React Testing Library
- **Environment**: Use .env for configuration (see .env.example)