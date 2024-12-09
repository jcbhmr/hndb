import { SignIn } from "@/components/sign-in";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
    return (
        <SignIn />
    );
}
