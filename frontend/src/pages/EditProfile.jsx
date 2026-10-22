import { useState } from 'react';
import { prepareMedia } from '../api/media';

// Edits profile details and the avatar, then returns the updated profile to the app.
export default function EditProfilePage({ profile, onSave, onCancel }) {
  const [form, setForm] = useState(profile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');

    try {
      // Avatars are small, so cap them well below the post image size
      const avatar = avatarFile
        ? await prepareMedia(avatarFile, { maxDimension: 512, maxBytes: 200000 })
        : form.avatar;
      await onSave({ ...form, avatar });
    } catch (uploadError) {
      setError(uploadError.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setForm((current) => ({
      ...current,
      avatar: URL.createObjectURL(file),
    }));
  };

  const clearAvatar = () => {
    if (form.avatar && form.avatar.startsWith('blob:')) URL.revokeObjectURL(form.avatar);
    setAvatarFile(null);
    setForm((current) => ({
      ...current,
      avatar: '',
    }));
  };

  return (
    <div className="min-h-screen bg-[#F4F4F8] p-5 text-slate-900">
      <div className="mx-auto max-w-xl rounded-[28px] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
          >
            Back
          </button>
          <h2 className="text-xl font-bold">Edit profile</h2>
          <div className="w-12" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="overflow-hidden rounded-full border-4 border-slate-200 bg-slate-100">
              {form.avatar ? (
                <img src={form.avatar} alt="Profile preview" className="h-24 w-24 object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center bg-[#4E4C61] text-2xl font-bold text-white">
                  {form.name?.slice(0, 2).toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <label className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                Upload photo
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>

              {form.avatar && (
                <button
                  type="button"
                  onClick={clearAvatar}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              fullName
            </label>
            <input
              id="name"
              value={form.name}
              onChange={handleChange('name')}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#635BFF] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="location" className="mb-2 block text-sm font-medium text-slate-700">
              location
            </label>
            <input
              id="location"
              value={form.location}
              onChange={handleChange('location')}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#635BFF] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-medium text-slate-700">
              bio
            </label>
            <textarea
              id="bio"
              rows="4"
              value={form.bio}
              onChange={handleChange('bio')}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#635BFF] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-700">
              status
            </label>
            <input
              id="status"
              value={form.status}
              onChange={handleChange('status')}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#635BFF] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="avatar" className="mb-2 block text-sm font-medium text-slate-700">
              profileImageUrl
            </label>
            <input
              id="avatar"
              type="url"
              value={form.avatar || ''}
              onChange={(event) => {
                // A typed URL replaces any file that was picked earlier
                setAvatarFile(null);
                setForm((current) => ({
                  ...current,
                  avatar: event.target.value,
                }));
              }}
              placeholder="https://example.com/profile.jpg"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#635BFF] focus:bg-white"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-full border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-[#635BFF] px-4 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#5249ea] hover:shadow-lg disabled:cursor-default disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}