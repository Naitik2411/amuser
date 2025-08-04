"use client"
import { signIn, signOut, useSession } from "next-auth/react";

const Navbar = () => {
    const session = useSession()
  return (
    <nav>
      <div className="flex justify-between">
        <div>
            Amuser
        </div>
        <div>
            {session.data?.user && <button className="m-2 p-2 bg-black text-white"  onClick={() => signOut()}>Log out</button>}
            {!session.data?.user && <button className="m-2 p-2 bg-black text-white"  onClick={() => signIn()}>Sign In</button>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
