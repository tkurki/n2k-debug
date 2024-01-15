export type Brand<K, T> = K & { __brand: T }

export type PgnNumber = Brand<number, 'PgnNumber'>

export interface EventData {
  event: string
  data: EventPayload
}
type EventPayload = PgnData | string | UnparsedPgn

export interface PgnData {
  prio: number
  pgn: number
  dst: number
  src: number
  timestamp: string
  input: string[]
  fields: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  description: string
}

export interface UnparsedPgn {
  pgn: PgnNumber
  data: {
    type: 'Buffer'
    data: number[]
  }
}
export function isUnparsedPgn(pl: EventPayload): pl is UnparsedPgn {
  const unparsed = pl as UnparsedPgn
  return unparsed.pgn !== undefined && unparsed.data !== undefined
}

import { PGNs } from '@canboat/pgns'
export const pgnsById = PGNs.reduce<{
  [key: number]: {
    PGN: number
    Id: string
    Description: string
  }
}>((acc, pgn) => {
  acc[pgn.PGN] = pgn
  return acc
}, {})
