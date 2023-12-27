import React from 'react'

import { Subject } from 'rxjs'
import { useObservableState } from 'observable-hooks'
import { pgnsById } from '../types'

interface SentencePanelProps {
  selectedPgn: Subject<any>
}
export const SentencePanel = (props: SentencePanelProps) => {
  const pgnData = useObservableState<any>(props.selectedPgn)

  return (
    <>
      <h5>{pgnsById[pgnData?.pgn]?.Description}</h5>
      <pre>{JSON.stringify(pgnData, null, 2)}</pre>
    </>
  )
}
