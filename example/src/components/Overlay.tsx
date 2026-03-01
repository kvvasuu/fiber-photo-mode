import { motion } from "motion/react";
import UserInterface from "./UserInterface";

export default function Overlay({ show }: { show?: boolean }) {
  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <a href="https://github.com/kvvasuu/fiber-photo-mode" target="_blank" rel="author" className="title">
        <h1>Fiber Photo Mode</h1>
        <span>by Kvvasu</span>
      </a>
      <UserInterface show={show} />
      <footer className="footer">
        <a
          href="https://sketchfab.com/3d-models/plane-crash-by-a-brothel-in-nevada-9931703442a14a3db2cd53c368706c64"
          target="_blank"
          rel="noreferrer"
        >
          "Plane Crash by a Brothel in Nevada" by Azad Balabanian
        </a>
      </footer>
    </motion.div>
  );
}
