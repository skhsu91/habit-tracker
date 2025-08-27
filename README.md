# Habit Tracker App

A modern, full-stack habit tracking application built with React and FastAPI, featuring flexible data source integration and mobile-ready design.

## 🎯 Features

### Current Implementation
- **📊 Daily Overview**: 24-hour summary with quick metrics and habit insights
- **📋 Master List View**: Comprehensive, filterable list of all habits with search and sorting
- **📈 Visual Analytics**: Interactive charts showing trends, category breakdowns, and progress
- **🔄 Multi-Source Data**: Flexible architecture supporting Google Sheets, databases, and other sources
- **📱 Mobile-First Design**: Responsive UI optimized for future React Native deployment
- **🎨 Modern UI**: Clean, intuitive interface with Tailwind CSS styling

### Planned Features
- Google Sheets integration (backend ready)
- Database storage options
- Advanced filtering and categorization
- Goal setting and tracking
- Export/import functionality

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Mobile-first responsive design** for easy React Native migration
- **Component-based architecture** with reusable UI elements
- **Chart.js integration** for data visualization
- **Tailwind CSS** for utility-first styling
- **Axios** for API communication

### Backend (FastAPI + Python)
- **Data source abstraction layer** for multiple integrations
- **RESTful API** with comprehensive endpoints
- **Type-safe** with Pydantic models
- **Async/await** for performance
- **Extensible** for new data sources

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd habit-tracker
   ```

2. **Backend Setup**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Start the FastAPI server
   cd backend
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`

3. **Frontend Setup**
   ```bash
   # Install Node dependencies
   cd frontend
   npm install
   
   # Start the React development server
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## 📊 Data Sources

The app uses a flexible data source architecture that currently supports:

### Mock Data (Default)
- Sample habit data for development and testing
- Always available for immediate use

### Google Sheets (Ready to Configure)
To enable Google Sheets integration:

1. Create a Google Cloud Project
2. Enable the Google Sheets API
3. Create a service account and download credentials
4. Create a `.env` file in the backend directory:
   ```bash
   GOOGLE_SHEETS_ID=your_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_FILE=path/to/credentials.json
   ```

### Adding New Data Sources
The modular architecture makes it easy to add new sources:

1. Create a new class extending `DataSource` in `backend/data_sources/`
2. Implement required methods: `fetch_all_habits()`, `fetch_habits_by_date_range()`, `is_available()`
3. Add to the `DataSourceManager` initialization

## 📱 Mobile-Ready Design

The app is designed with React Native deployment in mind:

- **Mobile-first responsive design** with Tailwind breakpoints
- **Touch-friendly interface** with appropriate spacing and targets
- **Bottom navigation** for mobile devices
- **Component structure** compatible with React Native
- **API service layer** easily portable to React Native

## 🛠️ API Endpoints

### Core Endpoints
- `GET /api/habits` - Get all habits
- `GET /api/habits/today` - Get today's habits
- `GET /api/habits/recent?days=7` - Get recent habits
- `GET /api/dashboard` - Get dashboard summary

### Analytics Endpoints
- `GET /api/metrics/daily` - Get daily metrics
- `GET /api/analytics/categories` - Get category analytics
- `GET /api/analytics/trends?days=30` - Get trend data

### Data Source Management
- `GET /api/sources` - Get available data sources
- All endpoints support `?source=source_name` parameter

## 📋 Database Schema

Current habit event structure:
```typescript
{
  id: string              // Unique identifier (from Google Calendar)
  name: string           // Habit event name
  date: string           // ISO datetime format
  participants: string[] // Optional participants list
  duration: number       // Duration in minutes (15min intervals)
  categories: string[]   // List of categories/tags
  source?: string        // Data source identifier
}
```

## 🎨 UI Components

### Dashboard Views
- **Daily Overview**: Stats cards, recent events, upcoming activities
- **Master List**: Searchable, filterable table with sorting
- **Analytics**: Charts, trends, and category breakdowns

### Mobile Features
- Bottom navigation for mobile devices
- Responsive grid layouts
- Touch-optimized controls
- Adaptive text sizing

## 🔧 Development

### Project Structure
```
habit-tracker/
├── backend/
│   ├── data_sources/    # Data source implementations
│   ├── main.py         # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service layer
│   │   ├── types/       # TypeScript definitions
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

### Adding Features
1. **Backend**: Add new endpoints in `main.py` or data sources in `data_sources/`
2. **Frontend**: Create components in `src/components/` and update the API service
3. **Types**: Update TypeScript types in `src/types/habit.ts`

### Testing
```bash
# Backend testing
cd backend
python -m pytest

# Frontend testing
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
The FastAPI backend can be deployed to:
- Heroku, Vercel, or Railway
- AWS Lambda with Mangum
- Docker containers

### Frontend Deployment
The React frontend can be deployed to:
- Netlify, Vercel, or GitHub Pages
- CDN with static build files

### Environment Variables
Create production environment files:
- Backend: `.env` with Google Sheets configuration
- Frontend: `.env.production` with API URL

## 🔮 Roadmap

### Short-term
- [ ] Google Sheets integration testing
- [ ] Database storage option (PostgreSQL/SQLite)
- [ ] Advanced filtering and search
- [ ] Data export functionality

### Medium-term
- [ ] React Native mobile app
- [ ] Goal setting and progress tracking
- [ ] Calendar integration improvements
- [ ] Offline support

### Long-term
- [ ] Multi-user support
- [ ] Social features and sharing
- [ ] Advanced analytics and insights
- [ ] Integrations with fitness trackers

## 📚 Documentation

For detailed setup, configuration, and development information, see the [documentation directory](docs/README.md).

**Key Documents:**
- [Project Status](docs/PROJECT_STATUS.md) - Current development state and priorities
- [Configuration Guide](docs/setup/CONFIGURATION_GUIDE.md) - Setup and config management
- [Documentation Index](docs/README.md) - Complete documentation navigation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Issues & Bugs**: [GitHub Issues](../../issues)
- **API Reference**: http://localhost:8000/docs (when running locally)
- **Development Status**: [Project Status](docs/PROJECT_STATUS.md)
- **Setup Help**: [Documentation](docs/README.md)