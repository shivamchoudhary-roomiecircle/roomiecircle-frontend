# Getting Started with RoomieCircle

This guide will help you set up and run the RoomieCircle application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

## Installation Steps

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### 3. Environment Setup

This project uses environment variables for configuration. The backend API endpoint and other configurations are managed through the app.

If you need to configure the API base URL, you can update it in `src/lib/api.ts`.

### 4. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:8080` by default.

## Available Scripts

- `npm run dev` - Starts the development server with hot-reload
- `npm run build` - Builds the production-ready application
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components (routes)
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and API client
└── assets/           # Static assets (images, etc.)
```

## Key Features

- **Room Search**: Search for available rooms by location with map view
- **Roommate Search**: Find compatible roommates based on preferences
- **Authentication**: Sign up and log in using email or Google
- **Create Listings**: Post your room listings with auto-save functionality
- **My Listings**: Manage all your room listings in one place

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, you can change it in `vite.config.ts`:

```typescript
server: {
  host: "::",
  port: 3000, // Change to your preferred port
}
```

### Node Version Issues

If you encounter issues, ensure you're using Node.js v18 or higher:

```bash
node --version
```

## Need Help?

- Check the [main README](README.md) for project information
- Visit the [Lovable Documentation](https://docs.lovable.dev/)

## Next Steps

1. Create an account or log in
2. Browse available rooms and roommates
3. Create your first room listing
4. Start finding your perfect roommate!

---

Happy room hunting! 🏠
