import React from 'react';
import appleIcon from '../assets/apple.png';
import googleIcon from '../assets/google.png';
import phoneIcon from '../assets/mobilephone.png';
import logoImg from '../assets/U_logo.png';

export default function Login() {
    return (
      <div className="flex min-h-screen w-full bg-white">

      <div className="flex w-full flex-col justify-between p-8 md:w-1/2 lg:p-16">

      <div><img src={logoImg} alt="Unfinished Logo" className="h-8 w-auto" /></div>

      <div className="mx-auto w-full max-w-md space-y-6">

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Great conversations start unfinished.
          </h1>


          <div className="space-y-3">
            <button className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50">
              <img src={phoneIcon} alt="Phone" className="h-5 w-5 object-contain" />
               Continue with phone
            </button>

            <button className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50">
              <img src={googleIcon} alt="Google" className="h-5 w-5 object-contain" />
               Continue with Google
            </button>

            <button className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50">
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

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Email or username"
              className="w-full rounded-full border border-gray-300 px-5 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
            <button className="w-full rounded-full bg-[#635BFF] py-3 font-medium text-white transition-colors hover:bg-[#5249ea]">
              Continue
            </button>
          </div>

          <p className="text-xs leading-relaxed text-gray-400">
            By continuing, you agree to our Terms of Service, Privacy Policy and Cookie Use.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
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

     <div className="hidden w-1/2 flex-col items-center justify-center bg-[#FFFFFF] md:flex">
        <div className="flex flex-col items-center gap-6">
          <img src={logoImg} alt="Unfinished Branding" className="h-40 w-auto drop-shadow-xl" />
        </div>
      </div>

    </div>
    );
}