'use client';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center bg-[#070E20] h-full min-h-screen cursor-pointer">
      <div className="flex  flex-col mx-auto justify-center w-[500px] h-[350px] bg-[#070E20] border-neutral-700 border-2">
          <Image  className="mx-auto" src="/logo_yellow.svg" alt="Logo" width={150} height={150} />
          <Button className="mt-5 bg-amber-400 px-4 py-6 w-[250px] mx-auto text-neutral-800 font-bold font-xl" onClick={() => router.push('/signin')}>Login </Button>
          <Button className="mt-5 px-4 py-6 bg-neutral-100 w-[250px] mx-autotext-neutral-800 font-bold font-xl mx-auto" onClick ={() => router.push('/signup')}>Register</Button>
      </div>
    </div>
  );
}
