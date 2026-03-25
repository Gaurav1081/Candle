import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from "../assets/Logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Search,
  Target,
  Trophy,
  BarChart3,
  BookOpen,
  BarChart2,
  Brain,
  AlertTriangle,
  Signal,
  Settings,
  LogOut,
  MessageSquare,
  Swords,
  User,
  Shield,
} from 'lucide-react';

// Matches the section ids & icons inside LearningCenter.jsx exactly
const LEARNING_SECTIONS = [
  { id: 'stock-basics',         label: 'Stock Basics',          icon: BookOpen },
  { id: 'earnings-financials', label: 'Earnings & Financials', icon: BarChart2 },
  { id: 'beat-meet-miss',      label: 'Beat · Meet · Miss',    icon: Target },
  { id: 'prediction-strategy', label: 'Prediction Strategy',   icon: Brain },
  { id: 'common-mistakes',     label: 'Common Mistakes',       icon: AlertTriangle },
  { id: 'market-signals',      label: 'Market Signals',        icon: Signal },
];

// Settings sections
const SETTINGS_SECTIONS = [
  { id: 'profile',   label: 'Profile',   icon: User },
  { id: 'security',  label: 'Security',  icon: Shield },
];

function AppSidebar({ currentPage, currentLearningSection, currentSettingsSection, onNavigate }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'stocks',         label: 'Stock Search',     icon: Search },
    { id: 'myPredictions',  label: 'My Predictions',  icon: Target },
    { id: 'vs',             label: 'VS Mode',          icon: Swords },
    { id: 'community',      label: 'Community',        icon: MessageSquare },
    { id: 'leaderboard',    label: 'Leaderboard',      icon: Trophy },
    { id: 'analytics',      label: 'Analytics',        icon: BarChart3 },
    { id: 'learning',       label: 'Learning Center',  icon: BookOpen },
  ];

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <Sidebar className="border-r border-candle-electric-blue/20 [&_[data-sidebar=sidebar]]:bg-gradient-to-b [&_[data-sidebar=sidebar]]:from-candle-deep-dark/95 [&_[data-sidebar=sidebar]]:to-candle-black/95 [&_[data-sidebar=sidebar]]:backdrop-blur-xl">
      <SidebarContent>
        {/* Branding with Logo */}
        <SidebarGroup>
          <div className="px-0 py-4 flex items-center">
            <img 
              src={Logo} 
              alt="CANDLE Logo" 
              className="w-20 h-20 object-contain flex-shrink-0 -mr-4"
            />
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold candle-text-gradient leading-tight">
                CANDLE
              </h2>
              <p className="text-xs text-candle-muted-blue mt-0.5">
                Predict. Compete. Learn.
              </p>
            </div>
          </div>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.id)}
                    isActive={currentPage === item.id}
                    className={
                      currentPage === item.id
                        ? 'candle-gradient text-white shadow-glow-sm font-semibold'
                        : ''
                    }
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Learning Center sub-nav — only visible when on the learning page */}
        {currentPage === 'learning' && (
          <SidebarGroup>
            <SidebarGroupLabel>
              Learning Center
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {LEARNING_SECTIONS.map((section) => (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton
                      onClick={() => onNavigate('learning', { section: section.id })}
                      isActive={currentLearningSection === section.id}
                      className={
                        currentLearningSection === section.id
                          ? 'bg-candle-accent-blue/20 text-candle-accent-blue border-l-2 border-candle-accent-blue font-medium'
                          : ''
                      }
                    >
                      <section.icon className="size-4" />
                      <span className="text-sm">{section.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onNavigate('settings', { section: 'profile' })}
                  isActive={currentPage === 'settings'}
                  className={
                    currentPage === 'settings'
                      ? 'candle-gradient text-white shadow-glow-sm font-semibold'
                      : ''
                  }
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings sub-nav — only visible when on the settings page */}
        {currentPage === 'settings' && (
          <SidebarGroup>
            <SidebarGroupLabel>
              Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SETTINGS_SECTIONS.map((section) => (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton
                      onClick={() => onNavigate('settings', { section: section.id })}
                      isActive={currentSettingsSection === section.id}
                      className={
                        currentSettingsSection === section.id
                          ? 'bg-candle-accent-blue/20 text-candle-accent-blue border-l-2 border-candle-accent-blue font-medium'
                          : ''
                      }
                    >
                      <section.icon className="size-4" />
                      <span className="text-sm">{section.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="border-t border-candle-electric-blue/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-candle-electric-blue/10 transition-colors cursor-pointer">
              <Avatar className="size-10 ring-2 ring-candle-electric-blue/30">
                <AvatarImage src={user?.avatar} alt={user?.fullName || user?.username} />
                <AvatarFallback className="candle-gradient text-white font-bold text-sm">
                  {getInitials(user?.fullName || user?.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs text-candle-muted-blue truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout}
              className="text-candle-muted-blue hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;