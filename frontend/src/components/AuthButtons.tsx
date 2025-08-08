import React from "react";
import { Button } from "@/components/ui/button.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator.js";
import { Github } from "lucide-react";
import { googleLogin, githubLogin } from "@/auth/login.js";
import axios from "axios"

interface AuthButtonsProps {
  onUserContinue: () => void;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const AuthButtons: React.FC<AuthButtonsProps> = ({ onUserContinue }) => {
  const navigate = useNavigate();
  const handleLogin = async (method: "google" | "github") => {
    const user =
      method === "google" ? await googleLogin() : await githubLogin();
    console.log("The user is",user);
    if (user) {
      try {
        await axios.post(`${backendUrl}/api/auth/signup`, {
          uid: user.uid,
          displayName: user.displayName || " ",
          email: user.email,
          photoURL: user.photoURL,
          provider: method,
        });
      } catch (error) {
        console.error("❌ Failed to register user in backend:", error);
      }
      navigate("/dashboard");
    }
  };

  return (
    <Card className="w-full max-w-md backdrop-blur-sm bg-card/80 border-border/60">
      <CardHeader>
        <CardTitle className="text-center">
          Get Started with CollabCode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => {
            handleLogin("google");
          }}
          variant="outline"
          className="w-full flex items-center gap-2 h-11"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <Button
          onClick={() => handleLogin("github")}
          variant="outline"
          className="w-full flex items-center gap-2 h-11"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          onClick={onUserContinue}
          variant="ghost"
          className="w-full h-11"
        >
          Continue as Guest
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthButtons;
