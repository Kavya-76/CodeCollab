import { googleLogin, githubLogin } from "@/auth/login.js";

export default function Login() {
  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h1 className="text-2xl font-semibold">Login to CodeCollab</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-md"
        onClick={googleLogin}
      >
        Sign in with Google
      </button>
      <button
        className="bg-gray-800 text-white px-4 py-2 rounded-md"
        onClick={githubLogin}
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
