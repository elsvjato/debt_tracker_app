# Splitter - Expense Tracker App

A modern mobile application for splitting expenses with friends and family. Built with React Native and Expo, featuring real-time synchronization, multi-currency support, and intelligent debt settlement calculations.

## 📱 About

Splitter is a comprehensive expense tracking application that helps you manage shared expenses with ease. Whether you're splitting a dinner bill, planning a group trip, or managing household expenses, Splitter makes it simple and transparent.

## ✨ Features

### Core Functionality
- **Event Management**: Create and manage expense groups (events) with multiple participants
- **Expense Tracking**: Track individual and group expenses with detailed categorization
- **Automatic Balance Calculations**: Real-time balance calculations for all participants
- **Smart Debt Settlement**: Intelligent suggestions for optimal debt settlement between participants
- **Contact Management**: Add and organize contacts for easy expense splitting
- **Multi-Currency Support**: Support for multiple currencies in the same event
- **Expense Categories**: Organize expenses by categories (Food, Transport, Entertainment, Accommodation, etc.)

### User Experience
- **Multi-language Support**: Available in English, Ukrainian, and Polish
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Intuitive UI**: Modern, user-friendly interface built with React Native
- **Real-time Sync**: Cloud-based data synchronization using Supabase
- **Offline Support**: Local data storage for offline access

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.79.4) - Cross-platform mobile framework
- **Expo** (53.0.13) - Development platform and toolchain
- **TypeScript** - Type-safe JavaScript
- **Expo Router** (5.1.1) - File-based routing
- **React Navigation** - Navigation library
- **Tailwind CSS** - Utility-first styling (via tailwindcss-react-native)
- **i18next** - Internationalization framework

### Backend & Services
- **Supabase** - Backend as a Service (Authentication, Database, Storage)
- **PostgreSQL** - Relational database
- **Supabase Auth** - User authentication and authorization

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `react-native-reanimated` - Smooth animations
- `expo-image-picker` - Image selection and manipulation
- `@react-native-async-storage/async-storage` - Local storage
- `react-i18next` - Internationalization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **iOS Simulator** (for macOS) or **Android Studio** (for Android development)
- **Supabase Account** (for backend services)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/elsvjato/debt_tracker_app.git
   cd debt_tracker_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Update `config/supabaseClient.ts` with your Supabase URL and anon key:
     ```typescript
     const supabaseUrl = 'YOUR_SUPABASE_URL';
     const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
     ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your device

## 📱 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
debt_tracker_app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── events/        # Event management
│   │   ├── contacts/      # Contact management
│   │   └── profile/       # User profile & settings
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── assets/                # Images, fonts, icons
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── config/                # Configuration files
├── i18n/                  # Internationalization
├── theme/                 # Theme configuration
├── utils/                 # Utility functions
├── supabase-schema.sql    # Database schema
└── package.json
```

## 🔐 Authentication

The app uses Supabase Authentication with email/password:
- User registration
- Email verification
- Password reset
- Secure session management

## 💾 Database Schema

Key tables:
- **contacts** - User contacts
- **events** - Expense groups/events
- **event_participants** - Many-to-many relationship between events and contacts
- **expenses** - Individual expenses
- **expense_paid_by** - Who paid for each expense
- **expense_split_between** - How expenses are split

See `supabase-schema.sql` for the complete schema.

## 🌍 Internationalization

The app supports multiple languages:
- English (en)
- Ukrainian (uk)
- Polish (pl)

Language files are located in `i18n/translations.ts`.

## 🎨 Theming

The app supports:
- Light theme
- Dark theme
- System default (follows device settings)

Theme configuration is in `theme/` directory.

## 📝 License

This project is part of a degree thesis and is provided for educational purposes.

## 👤 Author

**elsvjato**

- GitHub: [@elsvjato](https://github.com/elsvjato)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: This is a degree project application. For production use, ensure proper security configurations, error handling, and testing.

