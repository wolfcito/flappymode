'use client'

import { useEffect } from 'react'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { FlappyModeGame } from '@/components/flappy-card'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NavMenu } from '@/components/nav-menu'

export default function FlappyMode() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp

      // Llamar a ready() para asegurarse de que el WebApp esté listo
      webApp.ready()

      // Detectar la plataforma
      const platform = webApp.platform // "android" o "ios"

      if (platform === 'ios') {
        // Ajustar la altura del body para iOS
        document.body.style.height = '100vh'

        // Retrasar la llamada a expand() para iOS
        setTimeout(() => {
          webApp.expand()
        }, 300)
      } else {
        // Expandir inmediatamente para otras plataformas
        webApp.expand()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl flex flex-col gap-2 items-center">
        <Card className="w-full h-[600px] border-none">
          <CardContent className="p-0 h-full flex">
            <FlappyModeGame />
          </CardContent>
        </Card>
      </div>
      {/* <NavMenu /> */}
    </div>
  )
}

// function Leaderboard() {
//   return (
//     <>
//       <Card className="bg-black text-white">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold text-[#DFFE00]">
//               Top 10 Leaderboard
//             </h2>
//             {/* <span className="rounded-full bg-[#F7C94B] px-4 py-1 text-black">
//       244,910
//     </span> */}
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow className="border-gray-800">
//                 <TableHead className="text-gray-400">Name</TableHead>
//                 <TableHead className="text-gray-400">Reward</TableHead>
//                 {/* <TableHead className="text-gray-400">TX</TableHead> */}
//                 <TableHead className="text-right text-gray-400">Time</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               <TableRow className="border-gray-800">
//                 <TableCell>hanzayarphyo</TableCell>
//                 <TableCell className="text-right">20K veMode</TableCell>
//                 {/* <TableCell className="font-mono">cccb...53ce</TableCell> */}
//                 <TableCell className="text-right">03:24 11/17</TableCell>
//               </TableRow>
//               <TableRow className="border-gray-800">
//                 <TableCell>Bibuvcg</TableCell>
//                 <TableCell className="text-right">20K veMode</TableCell>
//                 {/* <TableCell className="font-mono">cccb...53ce</TableCell> */}
//                 <TableCell className="text-right">03:24 11/17</TableCell>
//               </TableRow>
//               <TableRow className="border-gray-800">
//                 <TableCell>Ks39</TableCell>
//                 <TableCell className="text-right">100K veMode</TableCell>
//                 {/* <TableCell className="font-mono">5b1e...d830</TableCell> */}
//                 <TableCell className="text-right">03:22 11/17</TableCell>
//               </TableRow>
//               <TableRow className="border-gray-800">
//                 <TableCell>W85</TableCell>
//                 <TableCell className="text-right">100K veMode</TableCell>
//                 {/* <TableCell className="font-mono">5b1e...d830</TableCell> */}
//                 <TableCell className="text-right">03:21 11/17</TableCell>
//               </TableRow>
//               <TableRow className="border-gray-800">
//                 <TableCell>Faisal Mahfuz</TableCell>
//                 <TableCell className="text-right">5K veMode</TableCell>
//                 {/* <TableCell className="font-mono">5b1e...d830</TableCell> */}
//                 <TableCell className="text-right">03:21 11/17</TableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//           <div className="mt-4 flex items-center justify-center gap-2">
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8 border-gray-800"
//             >
//               <ChevronFirst className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8 border-gray-800"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <span className="text-sm text-gray-400">{`1 / 2`}</span>
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8 border-gray-800"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8 border-gray-800"
//             >
//               <ChevronLast className="h-4 w-4" />
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </>
//   )
// }
