import { ArrowRight, ChevronRight, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HashLink as Link } from "react-router-hash-link";
import { TextEffect } from "@/components/ui/text-effect";
import { HeroHeader } from "./header";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { AppImage } from "@/assets";
import LiveAdminPage from "@/pages/LiveAdminPage";
import { Android } from "@/components/ui/android";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      bounce: 0.3,
    },
  },
};

export default function HeroSection() {
  const icons = import.meta.glob("@/assets/icons/*.svg", { eager: true });
  const iconList = Object.values(icons).map((icon: any) => icon.default);

  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
            />
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup
                  variants={{
                    container: container,
                    item: item,
                  }}
                >
                  <Link
                    to="#ai"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-xs">
                      Introducing Coach Wan an AI Basketball Mentor
                    </span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedGroup>

                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mx-auto mt-4 max-w-3xl text-center font-semibold text-4xl md:text-5xl lg:mt-8 xl:text-5xl"
                >
                  BogoBallers
                </TextEffect>
                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="p"
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg"
                >
                  Bogo Basketball League Management System
                </TextEffect>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: container,
                item: item,
              }}
            >
              <div className="relative mt-8 overflow-hidden px-2 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl">
                    <img
                      className="w-full h-full object-cover"
                      src={AppImage.AiGenerateImageThree}
                      alt="app screen"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/100 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </AnimatedGroup>

            <AnimatedGroup
              id="ai"
              variants={{
                container: container,
                item: item,
              }}
            >
              <div className="flex justify-center items-center w-full px-2 pb-12">
                <Android
                  className="w-[300px] md:w-[500px] lg:w-[700px]"
                  src="https://res.cloudinary.com/dod3lmxm6/image/upload/v1762951954/Screenshot_2025-11-12-20-18-33-11_f625b1a6da067bd46fd7e1d052dd6b06_izcxja.jpg"
                />
              </div>
            </AnimatedGroup>
            <AnimatedGroup
              id="download"
              variants={{
                container: container,
                item: item,
              }}
            >
              <div className="flex items-center justify-center w-full px-4 py-6">
                <Card className="bg-muted text-foreground flex flex-col border-0 p-6 w-full max-w-xl shadow-md rounded-xl">
                  <div className="bg-foreground/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Smartphone className="h-6 w-6" />
                  </div>

                  {/* Title + Description */}
                  <div className="mb-4 flex-1 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Download BogoBallers Mobile App for Player and Team
                      Manager
                    </p>

                    <h3 className="text-2xl font-bold leading-snug">
                      This mobile application is designed for players and team
                      managers to easily manage teams, handle game
                      participation, and join league events.
                    </h3>

                    <p className="text-sm leading-relaxed">
                      Access your team roster, upcoming matches, league
                      standings, and game schedules. Stay updated with real-time
                      notifications for game updates, announcements, and
                      upcoming league activities — all within the app.
                    </p>
                  </div>

                  <div>
                    <Button className="w-fit" size="lg" asChild>
                      <a href="https://github.com/hulomjosuan21/bogoballers-admin/raw/refs/heads/main/public/app-builds/app-release.apk">
                        <Download className="h-4 w-4 mr-2" />
                        Download now
                      </a>
                    </Button>
                  </div>
                </Card>
              </div>
            </AnimatedGroup>
          </div>
        </section>
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link
                to="/"
                className="block text-sm duration-150 hover:opacity-75"
              >
                <span> Meet Our Sponsors</span>

                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
              {iconList.map((src, i) => (
                <div className="flex">
                  <img
                    className="mx-auto h-12 w-fit dark:invert"
                    src={src}
                    alt={`icon-${i}`}
                    key={i}
                    height="16"
                    width="auto"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        <LiveAdminPage />
        <div className="mt-24">
          <Footer />
        </div>
      </main>
    </>
  );
}
