// app/page.tsx or wherever you want to use it
import { Toaster } from "sonner";
import VideoCallApp from "@/components/VideoCallApp";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <VideoCallApp />
      <Toaster position="top-center" expand={true} richColors closeButton />
    </div>
  );
}

// app/page.tsx
// export default function Home() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
//       <h1 className="text-4xl font-bold text-white">
//         Tailwind CSS v4 is working!
//       </h1>
//     </div>
//   )
// }
