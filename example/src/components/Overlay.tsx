import { motion } from "motion/react";
import UserInterface from "./UserInterface";

export default function Overlay({ show }: { show?: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 z-10 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <a
        href="https://github.com/kvvasuu/fiber-photo-mode"
        target="_blank"
        rel="author"
        className="absolute px-8 pt-8 flex flex-col transition-colors text-foreground/75 hover:text-neutral-50"
      >
        <h1 className="pointer-events-auto font-display text-4xl m-0">Fiber Photo Mode</h1>
        <span className="-mt-2 pl-px text-xs">by Kvvasu</span>
      </a>

      <UserInterface show={show} />

      <footer className="absolute bottom-0.5 text-center w-full text-foreground/75 text-[0.6rem] select-none pointer-events-auto z-10">
        <a
          href="https://sketchfab.com/3d-models/plane-crash-by-a-brothel-in-nevada-9931703442a14a3db2cd53c368706c64"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-foreground"
        >
          "Plane Crash by a Brothel in Nevada" by Azad Balabanian
        </a>
      </footer>
    </motion.div>
  );
}
