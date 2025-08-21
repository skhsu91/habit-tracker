// React import - useState is a "hook" that lets us store and update data in our component
import React, { useState } from 'react';
// Heroicons - Beautiful pre-made icons that work perfectly with our dark theme
import { Bars3Icon, HomeIcon, ListBulletIcon, ChartBarIcon, XMarkIcon } from '@heroicons/react/24/outline';
// Our main page components - each represents a different "screen" in our app
import DailyOverview from './components/DailyOverview';
import MasterListView from './components/MasterListView';
import Analytics from './components/Analytics';

// TypeScript type definition - this ensures we only use valid tab names
// This prevents typos and helps VS Code give us better autocomplete
type TabType = 'overview' | 'list' | 'analytics';

function App() {
  // useState Hook: This creates a "state variable" called activeTab
  // - activeTab holds the current tab the user is viewing
  // - setActiveTab is a function to change which tab is active
  // - 'overview' is the default tab when the app first loads
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // useState Hook for controlling the sidebar menu visibility on desktop
  // - isSidebarOpen controls whether the hamburger menu sidebar is visible
  // - setIsSidebarOpen is the function to show/hide the sidebar
  // - false means the sidebar starts closed when the app loads
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Configuration array for our navigation tabs
  // Each tab has: unique id, display name, icon component, and page component
  // This makes it easy to add new tabs later - just add to this array!
  const tabs = [
    { id: 'overview', name: 'Overview', icon: HomeIcon, component: DailyOverview },
    { id: 'list', name: 'All Habits', icon: ListBulletIcon, component: MasterListView },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, component: Analytics },
  ];

  // Find which component to show based on the active tab
  // The "?" is called optional chaining - it prevents errors if the tab isn't found
  // "|| DailyOverview" means "if nothing is found, use DailyOverview as default"
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DailyOverview;

  return (
    // Main app container - min-h-screen makes it fill the entire browser window
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - This is the top bar you see on every page */}
      <header className="header-dark shadow-sm">
        {/* max-w-7xl centers content and prevents it from getting too wide on large screens */}
        {/* px-4 sm:px-6 lg:px-8 adds responsive padding - more padding on larger screens */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* flex creates a horizontal layout, justify-between pushes items to opposite ends */}
          <div className="flex justify-between items-center h-16">
            {/* Left side of header - logo and hamburger menu */}
            <div className="flex items-center">
              {/* Hamburger menu icon - shows on desktop (hidden on mobile since mobile uses bottom nav) */}
              {/* When clicked, it toggles the sidebar menu open/closed */}
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="desktop-only hamburger-btn flex items-center justify-center p-2 rounded-lg transition-all duration-300"
                aria-label="Toggle navigation menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              {/* App title - ml-3 on desktop for spacing from hamburger, no margin on mobile */}
              <h1 className="xl:ml-3 text-xl font-semibold text-gray-900">
                Habit Tracker
              </h1>
            </div>
            {/* Right side of header - subtitle/status */}
            <div className="text-sm text-gray-500">
              🌟 Your Personal Dashboard
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar Navigation - Slides out from left when hamburger menu is clicked */}
      {/* Only visible on desktop screens (hidden on mobile since mobile uses bottom nav) */}
      <div className={`desktop-only fixed inset-y-0 left-0 z-50 sidebar-nav transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full w-64 bg-secondary border-r shadow-lg">
          {/* Sidebar Header with close button */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            {/* Close button - clicking this closes the sidebar */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="close-btn flex items-center justify-center p-2 rounded-lg transition-all duration-300"
              aria-label="Close navigation menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Sidebar Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-3">
            {/* .map() loops through each tab and creates a navigation item for it */}
            {tabs.map((tab) => {
              // Extract the icon component from the tab object
              const Icon = tab.icon;
              return (
                <button
                  // key is required by React for list items - helps React track changes efficiently
                  key={tab.id}
                  // onClick updates the activeTab and closes the sidebar when user clicks
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setIsSidebarOpen(false); // Close sidebar after selection
                  }}
                  // Template literal (backticks) lets us combine strings and variables
                  // This applies different styles based on whether this tab is active
                  className={`sidebar-nav-item w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                >
                  {/* Render the icon component with specific size and margin */}
                  <Icon className="h-5 w-5 mr-3" />
                  {/* Display the tab name (Overview, All Habits, etc.) */}
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay that appears behind the sidebar when it's open - clicking it closes the sidebar */}
      {isSidebarOpen && (
        <div 
          className="desktop-only fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      {/* Main Content Area - This holds the page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content Area - This is where the actual page content displays */}
        <main className="flex-1">
          {/* This renders whichever component is currently active */}
          {/* ActiveComponent changes based on which tab is selected */}
          <ActiveComponent />
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only visible on small screens */}
      {/* desktop-hidden = hide on desktop screens, fixed = stays in place when scrolling */}
      {/* bottom-0 left-0 right-0 = stick to bottom edge and full width */}
      <nav className="desktop-hidden fixed bottom-0 left-0 right-0 bottom-nav px-4 py-2">
        {/* justify-around spreads the tabs evenly across the bottom */}
        <div className="flex justify-around">
          {/* Same .map() pattern as desktop nav, but with different styling */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                // Same click handler as desktop - updates which tab is active
                onClick={() => setActiveTab(tab.id as TabType)}
                // flex-col = vertical layout (icon on top, text below)
                // items-center = center everything horizontally
                className={`nav-tab flex flex-col items-center ${
                  activeTab === tab.id ? 'active' : ''
                }`}
              >
                {/* Icon sits on top, mb-1 adds small margin below it */}
                <Icon className="h-5 w-5 mb-1" />
                {/* Tab name below the icon, smaller text for mobile */}
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer div to prevent content from being hidden behind the fixed bottom nav */}
      {/* h-16 = height of 4rem (same as nav height), only shows on mobile */}
      <div className="h-16 desktop-hidden" />
    </div>
  );
}

// Export the App component so other files can import and use it
// This is what makes App.tsx the "main" component of our application
export default App;
