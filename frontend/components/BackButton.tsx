import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      className="mb-6 relative px-[2.5px] py-[2px] rounded-4xl text-black bg-gradient-to-r from-[#00A9B7] via-[#4C32F2] to-[#9F00BE]"
      onClick={() => router.back()}
    >
      <span className="block bg-[#ffffff] rounded-4xl px-5 py-2 hover:bg-transparent hover:text-white transition-all">
        Go Back
      </span>
    </button>
  )
}
