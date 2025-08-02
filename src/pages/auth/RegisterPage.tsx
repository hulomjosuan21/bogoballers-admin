import { GalleryVerticalEnd } from "lucide-react";
import { Link } from "react-router-dom";
import RegisterForm from "./components/registerForm";
import { Auth } from "@/assets";

export default function RegisterPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link to="/" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Register Organization
                    </Link>
                </div>
                <div className="flex flex-1 flex-col gap-4 items-center justify-center">
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link to="/auth/login" className="underline underline-offset-4">
                            Login
                        </Link>
                    </div>
                    <RegisterForm />
                    <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                        and <Link to="#">Privacy Policy</Link>.
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <img
                    src={Auth.LoginFormImage}
                    alt="Image"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
