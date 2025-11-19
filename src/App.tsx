import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import WelcomeScreen from './WelcomeScreen';
import DataView from './DataView';
import TaskManagement from './TaskManagement';
import RelationshipOwnerDirectory from './RelationshipOwnerDirectory';
import FAQPage from './pages/FAQPage';
import { Button } from './components/ui/button';
import { Home, Users, CheckSquare, UserCircle, HelpCircle } from 'lucide-react';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/data', icon: Users, label: 'Accounts & Contacts' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/owners', icon: UserCircle, label: 'Relationship Owners' },
    { path: '/faq', icon: HelpCircle, label: 'FAQ' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary">
              Strategic Accounts CRM
            </Link>
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <div className="md:hidden pb-3 flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/data" element={<DataView />} />
          <Route path="/tasks" element={<TaskManagement />} />
          <Route path="/owners" element={<RelationshipOwnerDirectory />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;