import { useState, useRef, useEffect } from "react";
import { supabase } from '../integrations/supabase/client';
import { Database } from '../types/supabase';
import { Eye, EyeOff, User, Shield, Sliders, HardDrive, Plug, HelpCircle } from "lucide-react";

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

const SECTIONS = [
  { key: "profile", label: "Profile", icon: <User className="h-5 w-5 mr-2" /> },
  { key: "security", label: "Security", icon: <Shield className="h-5 w-5 mr-2" /> },
  { key: "preferences", label: "Preferences", icon: <Sliders className="h-5 w-5 mr-2" /> },
  { key: "storage", label: "Storage & Usage", icon: <HardDrive className="h-5 w-5 mr-2" /> },
  { key: "integrations", label: "Integrations", icon: <Plug className="h-5 w-5 mr-2" /> },
  { key: "support", label: "About us, Support & Feedback", icon: <HelpCircle className="h-5 w-5 mr-2" /> },
];

const SECTION_LABELS: Record<string, string> = Object.fromEntries(SECTIONS.map(s => [s.key, s.label]));

const ROLES = [
  "Student",
  "Professional",
  "Researcher",
  "Educator",
  "Other",
];

// Add your Google OAuth2 client ID and redirect URI here
const GOOGLE_CLIENT_ID = "372101070469-rtlthcnqm8nbisouue17jaahscfia8qe.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = window.location.origin + "/google-drive-callback";
const GOOGLE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export default function AccountSettings() {
  const [activeSection, setActiveSection] = useState("profile");
  // Profile state
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          const profile = data as UserProfile;
          setFullName(profile.full_name || "");
          setUsername(profile.username || "");
          setRole(profile.role || ROLES[0]);
          setAvatar(profile.avatar_url || null);
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarFile(null);
  };

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let avatar_url = null;

      // If a new avatar file is selected, upload to Supabase Storage
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `avatars/${user.id}.${fileExt}`;
        console.log('Uploading avatar to:', filePath);

        // Upload the file (will overwrite if same path)
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          throw uploadError;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        console.log('Public URL data:', publicUrlData);

        avatar_url = publicUrlData?.publicUrl || null;
        console.log('Avatar public URL to save:', avatar_url);
      } else {
        // If no new file, keep the existing avatar
        avatar_url = avatar;
        console.log('No new avatar file, using existing avatar_url:', avatar_url);
      }

      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          username,
          role,
          avatar_url,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });
      if (updateError) {
        console.error('Profile upsert error:', updateError);
        throw updateError;
      }
      console.log('Profile upserted with avatar_url:', avatar_url);

      // Always use the public URL for display
      setAvatar(avatar_url);

      // Update Supabase Auth user_metadata for avatar_url (for header)
      if (avatar_url) {
        await supabase.auth.updateUser({ data: { avatar_url } });
        // Force refresh user object in local state (header)
        await supabase.auth.getUser();
      }

      // Refresh the profile data after saving
      await fetchProfile();

      setEditing(false);
      setAvatarFile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
      // Show error to user if desired
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form to original values
    fetchProfile();
  };

  function handleDriveConnect() {
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(GOOGLE_SCOPE)}` +
      `&include_granted_scopes=true`;
    window.open(authUrl, "_self");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-2">
        <h2 className="text-lg font-bold mb-4 text-pathpdf-700 dark:text-white">Settings</h2>
        {SECTIONS.map(section => (
          <button
            key={section.key}
            className={`text-left px-4 py-2 rounded transition font-medium flex items-center ${activeSection === section.key ? 'bg-pathpdf-300 dark:bg-gray-800 text-pathpdf-500 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-500 dark:hover:bg-gray-300'}`}
            onClick={() => setActiveSection(section.key)}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{SECTION_LABELS[activeSection]}</h1>
          {/* Section Panels */}
          {activeSection === "profile" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">User Profile</h2>
              {loading ? (
                <div className="text-gray-400">Loading profile...</div>
              ) : (
                <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-pathpdf-200 dark:border-gray-700">
                        {avatar ? (
                          <img src={avatar} alt="Avatar" className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-4xl text-gray-400">👤</span>
                        )}
                      </div>
                      {editing && (
                        <button
                          type="button"
                          className="absolute bottom-0 right-0 bg-pathpdf-600 text-white rounded-full p-2 shadow hover:bg-pathpdf-700 transition"
                          onClick={() => fileInputRef.current?.click()}
                          title="Upload profile picture"
                          disabled={saving}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      )}
                      {avatar && editing && (
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
                          onClick={handleRemoveAvatar}
                          title="Remove profile picture"
                          disabled={saving}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        disabled={!editing || saving}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pathpdf-500"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          disabled={!editing || saving}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pathpdf-500"
                          value={email}
                          disabled
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                        <input
                          type="text"
                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pathpdf-500"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          disabled={!editing || saving}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select
                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pathpdf-500"
                          value={role}
                          onChange={e => setRole(e.target.value)}
                          disabled={!editing || saving}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Edit/Save/Cancel Buttons */}
                  <div className="flex gap-3 mt-6 justify-end">
                    {!editing ? (
                      <button
                        type="button"
                        className="px-6 py-2 rounded bg-pathpdf-600 text-white font-semibold hover:bg-pathpdf-700 transition"
                        onClick={() => setEditing(true)}
                        disabled={saving}
                      >Edit</button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="px-6 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                          onClick={handleCancel}
                          disabled={saving}
                        >Cancel</button>
                        <button
                          type="button"
                          className="px-6 py-2 rounded bg-pathpdf-600 text-white font-semibold hover:bg-pathpdf-700 transition"
                          onClick={handleSave}
                          disabled={saving}
                        >{saving ? 'Saving...' : 'Save'}</button>
                      </>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
          {activeSection === "security" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">Security Settings</h2>
              <ChangePasswordForm />
            </div>
          )}
          {activeSection === "privacy" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">Privacy Controls</h2>
              <div className="text-gray-500">Data sharing and document privacy settings will go here.</div>
            </div>
          )}
          {activeSection === "preferences" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">Preferences</h2>
              <PreferencesPanel />
            </div>
          )}
          {activeSection === "notifications" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">Notification Preferences</h2>
              <div className="text-gray-500">Email, push, and in-app notification settings will go here.</div>
            </div>
          )}
          {activeSection === "storage" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">Storage & Usage</h2>
              <div className="text-gray-500">Document library, storage usage, and stats will go here.</div>
            </div>
          )}
          {activeSection === "integrations" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Discover new connections</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Google Drive */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 flex flex-col gap-3 shadow-sm">
                  <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googledrive.svg" alt="Google Drive" className="h-8 w-8 mb-2" />
                  <div className="font-bold text-lg">Google Drive</div>
                  <div className="text-gray-500 text-sm flex-1">Export and save your generated roadmaps as PDF files directly to your Google Drive for easy access and sharing.</div>
                  <span className="inline-block bg-gray-100 text-gray-500 text-xs rounded px-2 py-1 w-max mb-2">LINK PREVIEW</span>
                  <button onClick={handleDriveConnect} className="mt-auto px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">Connect</button>
                </div>
              </div>
              {/* See all section */}
              <div className="text-sm text-gray-500 flex flex-col gap-1 mt-4">
                <a href="#" className="hover:underline flex items-center gap-1">↗ Browse connections in Gallery</a>
                <a href="#" className="hover:underline flex items-center gap-1">↗ Develop or manage integrations <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs ml-1">New</span></a>
                <a href="#" className="hover:underline flex items-center gap-1">? Learn more about connections</a>
              </div>
            </div>
          )}
          {activeSection === "support" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">Support & Feedback</h2>
              <div className="text-gray-500">FAQ, contact, bug report, and feedback will go here.</div>
            </div>
          )}
          {activeSection === "account" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">Account Management</h2>
              <div className="text-gray-500">Subscription, billing, and account actions will go here.</div>
            </div>
          )}
          {activeSection === "accessibility" && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">Accessibility</h2>
              <div className="text-gray-500">Font size, color mode, and accessibility options will go here.</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Supabase does not support re-authenticating with current password directly.
      // You can only update password if the user is logged in.
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4 max-w-md" onSubmit={handleChangePassword}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type={showCurrent ? "text" : "password"}
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pathpdf-500"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="button"
          className="ml-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center"
          tabIndex={-1}
          onClick={() => setShowCurrent(v => !v)}
        >
          {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type={showNew ? "text" : "password"}
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pathpdf-500"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="button"
          className="ml-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center"
          tabIndex={-1}
          onClick={() => setShowNew(v => !v)}
        >
          {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type={showConfirm ? "text" : "password"}
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pathpdf-500"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="button"
          className="ml-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center"
          tabIndex={-1}
          onClick={() => setShowConfirm(v => !v)}
        >
          {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="px-6 py-2 rounded bg-pathpdf-600 text-white font-semibold hover:bg-pathpdf-700 transition mt-2"
        disabled={loading}
      >
        {loading ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}

function PreferencesPanel() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('theme', theme);
    setSuccess('Preferences saved!');
    setTimeout(() => {
      setSuccess(null);
      window.location.reload();
    }, 500);
  };

  const themeOptions = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'system', label: 'System' },
  ];

  return (
    <form className="flex flex-col gap-6 max-w-lg" onSubmit={handleSave}>
      <div>
        <label className="block text-sm font-medium mb-1">Theme</label>
        <div className="flex flex-col gap-1 bg-white dark:bg-gray-900 rounded-md p-2">
          {themeOptions.map(option => (
            <button
              type="button"
              key={option.value}
              className={`flex items-center w-full px-3 py-2 rounded transition text-left
                ${theme === option.value ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setTheme(option.value)}
            >
              <span className="flex items-center mr-3">
                <span
                  className={`inline-block w-4 h-4 rounded-full border-2 transition-all duration-200 shadow-sm
                    ${theme === option.value
                      ? 'bg-black dark:bg-white border-black dark:border-white shadow-md'
                      : 'bg-white dark:bg-gray-900 border-gray-400'}
                  `}
                ></span>
              </span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="px-6 py-2 rounded bg-pathpdf-600 text-white font-semibold hover:bg-pathpdf-700 transition mt-2"
      >
        Save Preferences
      </button>
    </form>
  );
} 