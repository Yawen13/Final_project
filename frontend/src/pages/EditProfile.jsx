import { useState } from 'react';

// Edits profile details and the avatar, then returns the updated profile to the app.
export default function EditProfilePage({ profile, onSave, onCancel }) {
  const [form, setForm] = useState(profile);

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        avatar: reader.result,
      }));
    };
    reader.readAsDataURL(file);
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
                  {form.name?.slice(0, 2).toUpperCase() || 'JD'}
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
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      avatar: '',
                    }))
                  }
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
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  avatar: event.target.value,
                }))
              }
              placeholder="https://example.com/profile.jpg"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#635BFF] focus:bg-white"
            />
          </div>

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
              className="flex-1 rounded-full bg-[#635BFF] px-4 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#5249ea] hover:shadow-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
