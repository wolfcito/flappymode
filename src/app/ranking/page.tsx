'use client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format } from 'numerable'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

import Image from 'next/image'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Leaderboard() {
  const [highScores, setHighScores] = useState<
    { nickname: string; score: number }[]
  >([])

  useEffect(() => {
    const fetchHighScores = async () => {
      try {
        const { data: scores, error: fetchHighScoresError } = await supabase
          .from('flappymodeV2')
          .select('*')
          .order('score', { ascending: false })
          .limit(10)

        if (fetchHighScoresError) {
          console.error(
            'Error fetching high scores:',
            fetchHighScoresError.message,
          )
        } else {
          setHighScores(scores || [])
        }
      } catch (error) {
        console.error('Unexpected error fetching high scores:', error)
      }
    }

    fetchHighScores()
  }, [])
  return (
    <>
      <h2 className="text-4xl font-bold px-4 py-6 text-[#DFFE00]">Rankings</h2>

      <div className="space-y-2 px-4">
        <div className="bg-zinc-900 rounded-lg p-4 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 bg-[#B4E3DB]">
              <AvatarFallback className="text-black font-quickzap">
                WO
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Wolfcito | Luis Fern...</p>
              <p className="text-gray-400">202,001 $veMode</p>
            </div>
          </div>
          <span className="text-gray-400">{'>'}100</span>
        </div>

        <h3 className="text-2xl font-bold py-4 text-[#DFFE00]">TOP 100</h3>

        <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-20 font-sans">
          {[
            {
              initials: 'AS',
              name: 'Aster',
              amount: '39,960,346',
              rank: 1,
              color: '#8B94E3',
            },
            {
              initials: 'LE',
              name: 'Lemon',
              amount: '29,757,266',
              rank: 2,
              color: '#B8D5A1',
            },
            {
              initials: 'FA',
              name: 'Farina',
              amount: '17,739,091',
              rank: 3,
              color: '#F2D76D',
            },
            {
              initials: 'ЛІ',
              name: 'ЛідіяНевмержицька',
              amount: '12,750,313',
              rank: 4,
              color: '#89CDE0',
            },
            {
              initials: 'DA',
              name: 'Dalex',
              amount: '12,698,583',
              rank: 5,
              color: '#89CDE0',
            },
            {
              initials: 'ST',
              name: 'StellarRain',
              amount: '12,001,234',
              rank: 6,
              color: '#E38B9A',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-zinc-900 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  className="h-12 w-12"
                  style={{ backgroundColor: item.color }}
                >
                  <AvatarFallback className="text-black font-quickzap">
                    {item.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-400">{item.amount} $veMode</p>
                </div>
              </div>

              {item.rank <= 3 ? (
                <Image
                  src={
                    item.rank === 1
                      ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/goldmedal'
                      : item.rank === 2
                      ? 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/platemedal'
                      : 'https://res.cloudinary.com/guffenix/image/upload/f_auto,q_auto/v1/flappymode/coopermedal'
                  }
                  alt={`Rank ${item.rank}`}
                  width={24}
                  height={24}
                  className="w-auto h-6"
                />
              ) : (
                <span className="text-gray-400">#{item.rank}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="bg-black text-white border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#DFFE00]">
              Top 10 Leaderboard
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">Rank</TableHead>
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-right text-gray-400">
                  Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highScores.map((entry, index) => (
                <TableRow key={index} className="border-gray-800">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{entry.nickname}</TableCell>
                  <TableCell className="text-right">
                    {format(entry.score, '0.00 a')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
