
# Reference-Web - Technical Documentation

## Overview

Reference-Web is a React-based web application for tracking website rankings and managing SEO data. The application is built with modern web technologies and uses Supabase as the backend service.

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Animation**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives via shadcn/ui

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility libraries and configurations
├── pages/              # Route components
├── services/           # Business logic and API calls
├── translations/       # Static translation files
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

supabase/
├── config.toml         # Supabase configuration
└── functions/          # Edge functions
```

## Detailed Code Structure

### `/src/components/`

Component library organized by feature and functionality:

#### `/Admin/`
- **`AdminMenu.tsx`** - Navigation menu for admin dashboard
- **`AdminStats.tsx`** - Statistics cards for admin overview
- **`AddAdminForm.tsx`** - Form for granting admin privileges
- **`UserTable.tsx`** - Table displaying users and their roles
- **`DirectoryManagement.tsx`** - Directory website management interface
- **`DirectoryAddForm.tsx`** - Form for adding websites to directory
- **`DirectoryTable.tsx`** - Table for managing directory entries
- **`EventAnalytics.tsx`** - Analytics dashboard for tracking events
- **`TrackingScriptGenerator.tsx`** - Generates tracking scripts for websites
- **`TranslationManager.tsx`** - Interface for managing translations

#### `/Admin/Pricing/`
- **`PricingPlanList.tsx`** - Lists all pricing plans
- **`PricingPlanCard.tsx`** - Individual pricing plan display
- **`PricingPlanCreateDialog.tsx`** - Dialog for creating new plans
- **`PricingPlanEditDialog.tsx`** - Dialog for editing existing plans
- **`PricingPlanDeleteDialog.tsx`** - Confirmation dialog for deletion

#### `/Auth/`
- **`ProtectedRoute.tsx`** - Route wrapper for authenticated access

#### `/Dashboard/`
- **`DashboardView.tsx`** - Main dashboard layout
- **`MainDashboardContent.tsx`** - Central dashboard content
- **`QuickTipsCard.tsx`** - Tips and guidance card
- **`StatsSection.tsx`** - Statistics overview section

#### `/Directory/`
- **`DirectoryFilters.tsx`** - Filtering interface for directory
- **`DirectoryWebsiteCard.tsx`** - Individual website card in directory

#### `/Keywords/`
- **`AuthenticatedView.tsx`** - Keywords view for logged-in users
- **`GuestView.tsx`** - Keywords view for anonymous users
- **`KeywordDifficultyBadge.tsx`** - Badge showing keyword difficulty
- **`KeywordRankingStatus.tsx`** - Status indicator for keyword rankings
- **`KeywordTable.tsx`** - Table displaying keyword data

#### `/Layout/`
- **`Header.tsx`** - Application header with navigation
- **`Footer.tsx`** - Application footer
- **`DesktopNavigation.tsx`** - Desktop navigation menu
- **`MobileMenu.tsx`** - Mobile responsive menu
- **`LogoSection.tsx`** - Application logo component
- **`LanguageSwitch.tsx`** - Language selection component
- **`ThemeToggle.tsx`** - Dark/light theme toggle
- **`UserSection.tsx`** - User profile and authentication section
- **`WelcomeAnimation.tsx`** - First-visit welcome animation

#### `/RankTracker/`
- **`AddWebsiteForm.tsx`** - Form for adding websites to track
- **`RankingChart.tsx`** - Chart displaying ranking trends
- **`WebsiteDetailsCard.tsx`** - Detailed website information card
- **`WebsiteList.tsx`** - List of tracked websites

#### `/AddWebsite/`
- **`WebsiteBasicInfo.tsx`** - Basic website information form
- **`ContactInfo.tsx`** - Contact information form section
- **`AdditionalSettings.tsx`** - Additional website settings

#### `/Payment/`
- **`PaymentStep.tsx`** - Payment process step component
- **`CreditCardForm.tsx`** - Credit card input form

#### `/ui/`
Comprehensive UI component library based on shadcn/ui including buttons, forms, dialogs, tables, charts, and more.

### `/src/contexts/`

#### `AuthContext.tsx`
- Manages user authentication state
- Provides login/logout functionality
- Handles admin role checking
- Manages session persistence

#### `LanguageContext.tsx`
- Internationalization support
- Dynamic translation loading from database
- Language switching functionality
- Custom translation management

### `/src/hooks/`

Custom hooks for various functionalities:

- **`use-admin-status.tsx`** - Checks if user has admin privileges
- **`use-admin-users.tsx`** - Manages admin user operations
- **`use-pricing-plans.tsx`** - Handles pricing plan data
- **`useDirectoryManagement.tsx`** - Directory management operations
- **`useFirstVisit.tsx`** - Tracks first-time visitors
- **`useCustomTranslations.tsx`** - Custom translation management
- **`useWebsiteSubmission.tsx`** - Website form submission logic

### `/src/pages/`

Route components organized by functionality:

#### Main Pages
- **`Index.tsx`** - Homepage with dashboard view
- **`Auth.tsx`** - Authentication (login/signup) page
- **`About.tsx`** - About page
- **`Pricing.tsx`** - Public pricing display
- **`Profile.tsx`** - User profile management
- **`Rankings.tsx`** - Rankings overview page
- **`Keywords.tsx`** - Keyword management page
- **`Directories.tsx`** - Public directory listing
- **`AllWebsites.tsx`** - User's tracked websites
- **`AddWebsite.tsx`** - Add new website form

#### Admin Pages
- **`Admin.tsx`** - Main admin dashboard with user management
- **`Admin/Dashboard.tsx`** - Admin overview dashboard
- **`Admin/Pricing.tsx`** - Pricing plan management
- **`Admin/Analytics.tsx`** - Event analytics dashboard
- **`Admin/Directory.tsx`** - Directory management

#### Utility Pages
- **`NotFound.tsx`** - 404 error page
- **`Privacy.tsx`** - Privacy policy page
- **`Terms.tsx`** - Terms of service page
- **`Sitemap.tsx`** - HTML sitemap
- **`SitemapXml.tsx`** - XML sitemap generator

### `/src/services/`

Business logic and external API interactions:

#### `websiteService.ts`
- Website CRUD operations
- Data mapping between UI and database
- User website management

#### `directoryService.ts`
- Directory website management
- Category management
- Public directory operations

#### `eventTrackingService.ts`
- Event tracking functionality
- Analytics data collection
- External tracking script generation

#### `sqlMigrations.ts`
- Database migration utilities
- SQL schema management

### `/src/integrations/supabase/`

#### `client.ts`
- Supabase client configuration
- Database connection setup

#### `types.ts`
- Auto-generated TypeScript types from Supabase schema
- Database table interfaces

### `/supabase/functions/`

Edge functions for server-side operations:

#### `admin-users/index.ts`
- Lists all users with their roles
- Admin-only endpoint
- Uses service role for elevated permissions

#### `add-admin/index.ts`
- Grants admin privileges to users
- Validates admin permissions
- Handles role assignment

#### `track-event/index.ts`
- Processes tracking events from external websites
- Stores analytics data
- CORS-enabled for cross-origin requests

## Database Schema

### Core Tables

#### `websites`
- User's tracked websites
- SEO metrics and rankings
- Contact information
- Pricing associations

#### `user_roles`
- User permission system
- Admin/user role management
- Uses enum type `app_role`

#### `directory_websites`
- Public directory listings
- Website categorization
- Public visibility controls

#### `pricing`
- Pricing plan definitions
- Multi-language support
- Active/inactive states

#### `custom_translations`
- Dynamic translation system
- Multi-language content
- Admin-editable translations

#### `events`
- Analytics event tracking
- User interaction data
- Session-based tracking

## Authentication & Authorization

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. Session state managed in `AuthContext`
3. Auto-redirect based on authentication status
4. Session persistence across browser sessions

### Authorization System
- Role-based access control using `user_roles` table
- Admin privileges checked via `has_role()` function
- Protected routes using `ProtectedRoute` component
- Edge functions validate permissions before operations

## State Management

### React Query
- Server state management
- Caching and synchronization
- Optimistic updates
- Error handling

### Context Providers
- Authentication state
- Language preferences
- Theme management
- Global application state

## Internationalization

### Translation System
- Static translations in `/src/translations/`
- Dynamic translations from `custom_translations` table
- Admin interface for translation management
- Runtime language switching

## Styling & UI

### Tailwind CSS
- Utility-first CSS framework
- Custom design system
- Responsive design patterns
- Dark/light theme support

### shadcn/ui Components
- Accessible component library
- Consistent design patterns
- Customizable via CSS variables
- Built on Radix UI primitives

## Development Workflow

### Project Setup
1. Clone repository
2. Install dependencies with `npm install`
3. Configure Supabase connection
4. Run development server with `npm run dev`

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Consistent component patterns
- Separation of concerns

### Deployment
- Vite build process
- Static site generation
- Supabase edge function deployment
- Environment-specific configurations

## Performance Considerations

### Optimization Strategies
- Code splitting with React Router
- Lazy loading for non-critical components
- React Query caching strategies
- Image optimization
- Bundle size monitoring

### Database Optimization
- Row Level Security policies
- Efficient query patterns
- Index optimization
- Connection pooling via Supabase

## Security Features

### Data Protection
- Row Level Security (RLS) policies
- User data isolation
- Admin permission validation
- Secure session management

### API Security
- Edge function authentication
- CORS configuration
- Input validation
- SQL injection prevention

## Monitoring & Analytics

### Event Tracking
- Custom analytics system
- User interaction tracking
- Performance monitoring
- Error logging

### Admin Analytics
- User activity dashboards
- Website performance metrics
- System health monitoring

This documentation provides a comprehensive overview of the Reference-Web application architecture, code organization, and technical implementation details.
