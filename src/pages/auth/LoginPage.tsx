import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginForm } from "./components/loginForm";
import { useEffect } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  //   const [searchParams, setSearchParams] = useSearchParams();
  //   const navigate = useNavigate();

  //   useEffect(() => {
  //     const verified = searchParams.get("verified");
  //     console.log("Success");
  //     if (!verified) return;

  //     switch (verified) {
  //       case "success":
  //         toast.success("Your account has been verified. Please log in.");
  //         break;
  //       case "already":
  //         toast.success("Your account was already verified. Please log in.");
  //         break;
  //       case "expired":
  //         toast.success(
  //           "Verification link expired. Please request a new verification email."
  //         );
  //         break;
  //       case "invalid":
  //       default:
  //         toast.error(
  //           "Invalid verification link. Please request a new verification email."
  //         );
  //         break;
  //     }
  //   }, [searchParams, setSearchParams, navigate]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
