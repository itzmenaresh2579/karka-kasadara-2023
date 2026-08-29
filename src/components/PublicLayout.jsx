import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getContent } from "../firebase/contentService";

export default function PublicLayout() {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    (async () => setContact(await getContent("contact")))();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer contact={contact} />
    </>
  );
}
