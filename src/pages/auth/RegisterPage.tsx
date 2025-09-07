import { Link } from "react-router-dom";
import RegisterForm from "./components/registerForm";
import { AppImage } from "@/assets";
const logo = {
  url: "#",
  src: "https://res.cloudinary.com/dod3lmxm6/image/upload/v1756534465/logo-main_nvlqtm.png",
  alt: "logo",
  title: "BogoBallers",
};
export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to={"/"} className="flex items-center gap-2">
            <img src={logo.src} className="max-h-8" alt={logo.alt} />
            <span className="text-lg font-semibold tracking-tighter">
              {logo.title}
            </span>
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
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <Link to="#">Privacy Policy</Link>.
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={AppImage.AiGenerateImageOne}
          alt="Image"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4]"
        />
      </div>
    </div>
  );
}
