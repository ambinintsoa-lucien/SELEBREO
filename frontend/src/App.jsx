import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./router/RequireAuth.jsx";
import PhoneFrame from "./components/PhoneFrame.jsx";

import SplashScreen from "./screens/onboarding/SplashScreen.jsx";
import LoginScreen from "./screens/auth/LoginScreen.jsx";
import ProfileCreationScreen from "./screens/profileCreation/ProfileCreationScreen.jsx";
import ThemeSelectionScreen from "./screens/themeSelection/ThemeSelectionScreen.jsx";
import FinalizeProfileScreen from "./screens/finalizeProfile/FinalizeProfileScreen.jsx";

import HomeScreen from "./screens/home/HomeScreen.jsx";
import SearchScreen from "./screens/search/SearchScreen.jsx";
import PostDetailScreen from "./screens/postDetail/PostDetailScreen.jsx";

import CreateSelectionScreen from "./screens/post/CreateSelectionScreen.jsx";
import VideoRecordingScreen from "./screens/post/VideoRecordingScreen.jsx";
import PostDetailsEntryScreen from "./screens/post/PostDetailsEntryScreen.jsx";
import PostPreviewScreen from "./screens/post/PostPreviewScreen.jsx";

import RankingScreen from "./screens/ranking/RankingScreen.jsx";
import ParticipantProfileScreen from "./screens/ranking/ParticipantProfileScreen.jsx";

import DuelScreen from "./screens/duel/DuelScreen.jsx";
import DuelResultScreen from "./screens/duel/DuelResultScreen.jsx";

import NotificationsScreen from "./screens/notifications/NotificationsScreen.jsx";

import ProfileScreen from "./screens/profile/ProfileScreen.jsx";
import OtherUserProfileScreen from "./screens/profile/OtherUserProfileScreen.jsx";

import SettingsScreen from "./screens/settings/SettingsScreen.jsx";
import EditProfileScreen from "./screens/settings/EditProfileScreen.jsx";
import BlockedUsersScreen from "./screens/settings/BlockedUsersScreen.jsx";
import SecurityScreen from "./screens/settings/SecurityScreen.jsx";
import DeleteAccountScreen from "./screens/settings/DeleteAccountScreen.jsx";
import CommunityGuidelinesScreen from "./screens/settings/CommunityGuidelinesScreen.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/profile-creation" element={<RequireAuth><ProfileCreationScreen /></RequireAuth>} />
          <Route path="/theme-selection" element={<RequireAuth><ThemeSelectionScreen /></RequireAuth>} />
          <Route path="/finalize-profile" element={<RequireAuth><FinalizeProfileScreen /></RequireAuth>} />

          <Route path="/home" element={<RequireAuth><HomeScreen /></RequireAuth>} />
          <Route path="/search" element={<RequireAuth><SearchScreen /></RequireAuth>} />
          <Route path="/post/:postId" element={<RequireAuth><PostDetailScreen /></RequireAuth>} />

          <Route path="/create" element={<RequireAuth><CreateSelectionScreen /></RequireAuth>} />
          <Route path="/video-recording" element={<RequireAuth><VideoRecordingScreen /></RequireAuth>} />
          <Route path="/create/details" element={<RequireAuth><PostDetailsEntryScreen /></RequireAuth>} />
          <Route path="/create/preview" element={<RequireAuth><PostPreviewScreen /></RequireAuth>} />

          <Route path="/ranking" element={<RequireAuth><RankingScreen /></RequireAuth>} />
          <Route path="/ranked-participant/:username" element={<RequireAuth><ParticipantProfileScreen /></RequireAuth>} />

          <Route path="/duel/:duelId" element={<RequireAuth><DuelScreen /></RequireAuth>} />
          <Route path="/duel-result/:duelId" element={<RequireAuth><DuelResultScreen /></RequireAuth>} />

          <Route path="/notifications" element={<RequireAuth><NotificationsScreen /></RequireAuth>} />

          <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
          <Route path="/user-profile/:username" element={<RequireAuth><OtherUserProfileScreen /></RequireAuth>} />

          <Route path="/settings" element={<RequireAuth><SettingsScreen /></RequireAuth>} />
          <Route path="/edit-profile" element={<RequireAuth><EditProfileScreen /></RequireAuth>} />
          <Route path="/blocked-users" element={<RequireAuth><BlockedUsersScreen /></RequireAuth>} />
          <Route path="/security" element={<RequireAuth><SecurityScreen /></RequireAuth>} />
          <Route path="/delete-account" element={<RequireAuth><DeleteAccountScreen /></RequireAuth>} />
          <Route path="/community-guidelines" element={<RequireAuth><CommunityGuidelinesScreen /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  );
}
