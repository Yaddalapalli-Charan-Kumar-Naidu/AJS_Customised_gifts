# AJS Customised Gifts

Premium customized gifts for every special moment in life 🌸

## Project Structure

```
├── backend/     # Express.js + MongoDB API
├── frontend/    # Next.js 16 + Tailwind CSS
```

## Setup

### Backend
```bash
cd backend
npm install
npm run seed   # Seed the database
npm run dev    # Start development server
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Start Next.js dev server
```

## Environment Variables

See `backend/.env.example` for backend configuration.

Frontend requires `NEXT_PUBLIC_API_URL` pointing to the backend API.
