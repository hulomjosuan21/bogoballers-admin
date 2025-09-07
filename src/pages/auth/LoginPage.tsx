import { Link } from "react-router-dom";
import { LoginForm } from "./components/loginForm";
import { AppImage } from "@/assets";
const logo = {
  url: "#",
  src: "https://res.cloudinary.com/dod3lmxm6/image/upload/v1756534465/logo-main_nvlqtm.png",
  alt: "logo",
  title: "BogoBallers",
};
export default function LoginPage() {
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
          <LoginForm />
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={AppImage.AiGenerateImageTwo}
          alt="Image"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4]"
        />
      </div>
    </div>
  );
}
