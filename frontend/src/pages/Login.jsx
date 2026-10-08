import { useState } from 'react';
import appleIcon from '../assets/apple.png';
import googleIcon from '../assets/google.png';
import phoneIcon from '../assets/mobilephone.png';
import logoImg from '../assets/U_logo.png';
import loginBg from '../assets/login_background.png';
import commentIcon from '../assets/comment.png';
import bigULogo from '../assets/Big_U_logo.png';
import { useNavigate } from 'react-router-dom';
import { login, register, saveSession } from '../api/auth';

function SceneryIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M4 17l4.5-4.5a2 2 0 012.8 0L16 17" />
      <path d="M14 15.5l1.5-1.5a2 2 0 012.8 0L20 15.5" />
    </svg>
  );
}

export default function Login() {

  const navigate = useNavigate();

  const [showComingSoon, setShowComingSoon] = useState(false);

  // Scenic campus photo, cross-faded in over the plain white background
  const [showScenery, setShowScenery] = useState(false);

  // Status: Login mode (isSignUp is false for login, true for creating a new account)
  const [isSignUp, setIsSignUp] = useState(false);

  //Status: Form input data
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // True while the request is in flight, so the button can't be double-fired
  const [busy, setBusy] = useState(false);

  // Click the third-party login pop-up
  const handleThirdPartyClick = () => {
    setShowComingSoon(true);
  };

  // Clear input and error messages when switching to login/register mode
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMsg('');
    setAccount('');
    setPassword('');
    setDisplayName('');
    setEmail('');
  };

  // Submit form (login/register) — POSTs to the backend through src/api/auth.js
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (busy) return;

    if (!account.trim() || !password.trim()) {
      setErrorMsg('Please fill in both account and password');
      return;
    }

    // The register endpoint needs these two; the login form doesn't ask for them
    if (isSignUp && (!displayName.trim() || !email.trim())) {
      setErrorMsg('Please add a display name and an email to create your account');
      return;
    }

    setErrorMsg('');
    setBusy(true);

    try {
      const session = isSignUp
        ? await register({
            username: account.trim(),
            displayName: displayName.trim(),
            email: email.trim(),
            password,
          })
        : await login(account.trim(), password);

      // No token from this API — the session is the user record it returned
      saveSession(session);
      navigate('/home');
    } catch (error) {
      setErrorMsg(error.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
  <div className="relative flex min-h-screen w-full overflow-hidden bg-white">

      {/* Scenic background, cross-faded in behind everything when toggled on */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out motion-reduce:transition-none ${
          showScenery ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
        }`}
        style={{ backgroundImage: `url(${loginBg})` }}
      />

      {/* Soft white wash so the form column stays readable over the photo */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white via-white/85 to-transparent transition-opacity duration-1000 ease-out motion-reduce:transition-none md:w-3/5 ${
          showScenery ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Background toggle */}
      <button
        type="button"
        onClick={() => setShowScenery((on) => !on)}
        aria-pressed={showScenery}
        title={showScenery ? 'Switch to plain background' : 'Switch to campus background'}
        className={`absolute right-5 top-5 z-30 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition-all duration-300 hover:scale-105 active:scale-95 ${
          showScenery
            ? 'border-[#635BFF]/30 bg-white/80 text-[#635BFF] shadow-md'
            : 'border-gray-200 bg-white/70 text-gray-400 shadow-sm hover:text-[#635BFF]'
        }`}
      >
        <SceneryIcon className="h-5 w-5" />
      </button>

      {/* Coming Soon */}
  {showComingSoon && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center space-y-5 border border-gray-100 transform transition-all scale-100">

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">Feature Coming Soon</h3>
        <p className="text-sm text-gray-500">We're working hard </p>
      </div>

      <button
        onClick={() => setShowComingSoon(false)}
        className="w-full rounded-full bg-[#635BFF] py-2.5 text-sm font-medium text-white shadow-[#635BFF]/20 transition-all hover:shadow-lg active:scale-[0.98]"
      >
        Got it
      </button>

    </div>
  </div>
)}

      {/*  MAIN PAGE */}
      {/* relative z-10 so the form paints above the absolutely-positioned background layers */}
      <div className="relative z-10 flex w-full flex-col justify-between p-5 md:w-1/2 lg:p-8">

       <div className="flex justify-start pt-0 gap-2">
         <img src={logoImg} alt="Unfinished Logo" className="h-7 w-auto" />
         <span className="text-xl font-bold text-gray-900">
              Unfinished<span className="text-[#1b2620]">.</span>
            </span>
          </div>

        <div className="mx-auto w-full max-w-md space-y-6">

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            {isSignUp ? "Join Unfinished today." : "Great conversations start unfinished."}
          </h1>

          {/*  List of third-party logins button */}
          <div className="space-y-3">
            <button 
              onClick={handleThirdPartyClick}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              <img src={phoneIcon} alt="Phone" className="h-5 w-5 object-contain" />
              Continue with phone
            </button>

            <button 
              onClick={handleThirdPartyClick}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              <img src={googleIcon} alt="Google" className="h-5 w-5 object-contain" />
              Continue with Google
            </button>

            <button 
              onClick={handleThirdPartyClick}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              <img src={appleIcon} alt="Apple" className="h-5 w-5 object-contain" />
              Continue with Apple
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-gray-200"></div>
            <span className="absolute bg-white px-3 text-xs text-gray-400 uppercase">
              or
            </span>
          </div>

          {/* Username and Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Only the register endpoint asks for these two */}
            {isSignUp && (
              <div>
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-5 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder={isSignUp ? "Username" : "Email or username"}
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-5 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {isSignUp && (
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-5 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            )}

            <div>
              <input
                type="password"
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-5 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              />
              {errorMsg && <p className="mt-1 text-xs text-red-500 pl-4">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[#635BFF] py-3 font-medium text-white transition-colors hover:bg-[#5249ea] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? (isSignUp ? "Creating account…" : "Signing in…")
                : (isSignUp ? "Create account" : "Sign in")}
            </button>
          </form>

          {/* Switch between "Login" and "Create New Account" prompts*/}
          <div className="text-center text-sm text-gray-600">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-[#635BFF] hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>

          <p className="text-xs leading-relaxed text-gray-400">
            By continuing, you agree to our Terms of Service, Privacy Policy and Cookie Use.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <a href="#" className="hover:underline">About</a>
          <span>·</span>
          <a href="#" className="hover:underline">Help</a>
          <span>·</span>
          <a href="#" className="hover:underline">Terms</a>
          <span>·</span>
          <a href="#" className="hover:underline">Privacy</a>
          <span>·</span>
          <a href="#" className="hover:underline">Cookies</a>
          <span>·</span>
          <a href="#" className="hover:underline">Careers</a>
          <span>·</span>
          <span>© 2026 Unfinished</span>
        </div>
      </div>


<div className="relative z-10 hidden w-1/2 flex-col items-center justify-between overflow-hidden p-8 select-none md:flex">

  <img 
    src={bigULogo} 
    alt="Big U Watermark" 
    className="absolute right-[-12%] top-1/2 z-0 h-[60%] max-w-none -translate-y-1/2 object-contain opacity-35 pointer-events-none select-none" 
  />

  
  <div className="relative z-0 my-auto flex flex-col items-center justify-center gap-6 py-10">
    

    <div className="absolute -top-9 right-6 hidden lg:block text-xs text-slate-500 font-serif rotate-12">
      Different people.<br />Same unfinished thoughts.
    </div>

    {/*  1：Mia */}
    <div className="w-80 rounded-2xl bg-white/100 backdrop-blur-md p-3 shadow-xl shadow-purple-900/5 transition-all hover:-translate-y-1 hover:shadow-2xl -rotate-3 -translate-x-6 border border-gray-100">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
            M
          </div>
          <span className="text-sm font-bold text-gray-900">Mia</span>
        </div>
        <span className="text-xs text-gray-400">2m</span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        I don't know if this makes sense, but...
      </p>
      <div className="mt-2 text-[10px] text-gray-400 font-bold tracking-widest">
        •••
      </div>
    </div>

    {/*  2：Leo */}
    <div className="w-80 rounded-2xl bg-white/100 backdrop-blur-md p-3 shadow-xl shadow-purple-900/5 transition-all hover:-translate-y-1 hover:shadow-2xl rotate-2 translate-x-8 border border-gray-100">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
            L
          </div>
          <span className="text-sm font-bold text-gray-900">Leo</span>
        </div>
        <span className="text-xs text-gray-400">Just now</span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        Wait, I actually have a different way of looking at it.
      </p>
      <div className="mt-2 text-[10px] text-gray-400 font-bold tracking-widest">
        •••
      </div>
    </div>

    {/* 3：Campus */}
    <div className="w-72 rounded-2xl bg-white/100 backdrop-blur-sm p-4 shadow-lg shadow-purple-900/5 transition-all hover:-translate-y-1 -rotate-1 -translate-x-12 border border-gray-100">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-semibold">
            C
          </div>
          <span className="text-sm font-bold text-gray-900">Campus</span>
        </div>
        <span className="text-xs text-gray-400">11:42 PM</span>
      </div>
      <p className="text-xs font-medium text-gray-700">Anyone still awake?</p>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
        <img src={commentIcon} alt="replies" className="h-3.5 w-3.5 object-contain opacity-60" />
        <span>12 replies</span>
      </div>
    </div>

  </div>

</div>

    </div>
  );
}