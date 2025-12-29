# SOA 2025 - Frontend Application

Frontend application for a tourist tour management system. The application enables guides to create and manage tours, and tourists to search, purchase, and execute tours.

## Features

### Authentication and Authorization
- User registration (Guide/Tourist)
- Login and logout
- Profile management (update data, upload photo)
- Role-based access (Admin, Guide, Tourist)
- JWT token authentication

### Tour Management
- **Tour Creation** - Guides can create tours with:
  - Basic information (name, description, difficulty, tags)
  - Key points (keypoints) on the map
  - Price setting and publishing
- **Tour Browsing** - List of available tours with filtering
- **Tour Details** - Display of information, key points, reviews
- **My Tours** - Guides can view and manage their tours
- **Purchased Tours** - Tourists can view tours they purchased
- **Tour Execution** - Progress tracking during tour execution with real-time position updates

### Blog Functionality
- Create blog posts
- Browse all blog posts
- Blog post details
- Like/Dislike functionality
- Comments on blog posts
- Markdown support for text formatting

### Shopping Cart
- Add tours to cart
- View and manage cart
- Purchase process

### Reviews and Ratings
- Add reviews for tours
- Upload photos with reviews
- Display reviews with image gallery
- Rating system

### Administration
- View all users
- Block/unblock users
- User account management

### Social Features
- Follow users (followings)
- View other users' profiles

### Map and Navigation
- Interactive map for creating tours
- Add key points on the map
- Display route between points
- Track current user position
- "Where are you" functionality for user location

## Running the Project

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn

### Installation
```bash
cd soa-fe
npm install
```

### Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Configuration

The backend API endpoint is configured in services at `http://localhost:8080`. To change the endpoint, update the `API_BASE_URL` constants in service files.

## Notes

- The application requires the backend server to be running on port 8080
- Internet connection is required for the map (MapLibre GL uses external tile services)
- JWT token is stored in localStorage

👥 Authors Duško Pilipović, Ognjen Papović, Nemanja Zekanović, Nikola Pejanović
