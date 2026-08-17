# Central Care Plus - Project Overview & Chat Log

This file was created to save the initial conversation and context of the project.

## Project Understanding

**Frameworks & Libraries:**
- **React Native (Expo):** The app is built using the Expo framework.
- **Navigation:** `@react-navigation/native-stack` and `@react-navigation/bottom-tabs` are used for routing. The app uses a Stack navigator wrapping a Bottom Tab navigator.
- **State Management:** `zustand` is used for global state (e.g., `authStore`).
- **Networking:** `axios` is used for API communication.
- **Other Key Packages:** `expo-location`, `expo-notifications`, `react-native-signature-canvas`, `formik`, `yup`.

**App Structure & Roles:**
- The application implements role-based access for two primary roles: **"carer"** and **"client"**.
- Main screens include:
  - **Login / Authentication**
  - **Dashboard**
  - **Job Roster & Job Details**
  - **Job Notes**
  - **Signature & Pending Signature**
  - **Log Emergency**
  - **Reports** (Carer specific)
  - **Documents** (Client specific)
  - **Profiles** (User and Client profiles)

**Themes:**
- The app supports theming with `ThemeContext`, switching between light and dark modes, integrated with React Navigation's theming system.

*Feel free to ask any specific questions, request new features, or start debugging! This file can be updated with further chat summaries if needed.*
