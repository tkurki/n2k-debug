import React from 'react'
import { useObservableState } from 'observable-hooks'
import Select from 'react-select'
import { Col, Input, Label, Row, Table } from 'reactstrap'
import { Subject } from 'rxjs'

interface DataListProps {
  data: Subject<EventData[]>
  onRowClicked: (row: any) => void
  filterPgns: Subject<PgnNumber[]>
  doFiltering: Subject<boolean>
}

const filterFor = (doFiltering: boolean | undefined, pgnNumbers: PgnNumber[] | undefined) => {
  if (!doFiltering || pgnNumbers === undefined || pgnNumbers.length === 0) {
    return () => true
  }
  return (eventData: EventData) =>
    (eventData.event === 'N2KAnalyzerOut' && pgnNumbers.indexOf((eventData.data as PgnData).pgn as PgnNumber) >= 0) ||
    (eventData.event === 'canboatjs:unparsed:data' &&
      pgnNumbers.indexOf(Number((eventData.data as string).split(',')[2]) as PgnNumber) >= 0)
}

export const DataList = (props: DataListProps) => {
  const data = useObservableState<EventData[]>(props.data)
  const filterPgns = useObservableState(props.filterPgns)
  const doFiltering = useObservableState(props.doFiltering)

  const addToFilteredPgns = (i: PgnNumber) => {
    const safeFilteredPgns = filterPgns || []
    if (safeFilteredPgns.indexOf(i) === -1) {
      props.filterPgns.next([...safeFilteredPgns, i])
    }
  }
  return (
    <div
      style={{
        width: '100%',
        height: '900px',
        overflow: 'auto',
      }}
    >
      <Table responsive bordered striped size="sm">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>pgn</th>
            <th>src</th>
            <th>data</th>
          </tr>
        </thead>
        <tbody>
          {(data || []).filter(filterFor(doFiltering, filterPgns)).map((row: EventData, i: number) => {
            if (row.event === 'canboatjs:unparsed:data' && typeof row.data === 'string') {
              const [timestamp, prio, pgn, src, dest, ...input] = (row.data as string).split(',')
              return (
                <tr key={i}>
                  <td>{timestamp.split('T')[1]}</td>
                  <td style={{ color: 'red' }} onClick={() => addToFilteredPgns(Number(pgn) as PgnNumber)}>
                    {pgn}
                  </td>
                  <td>{src}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace' }}>{input.join(' ')}</span>
                  </td>
                </tr>
              )
            }
            if (row.event === 'N2KAnalyzerOut') {
              const { timestamp, pgn, src, input } = row.data as PgnData
              return (
                <tr key={timestamp + i}>
                  <td>{timestamp.split('T')[1]}</td>
                  <td onClick={() => addToFilteredPgns(pgn as PgnNumber)}>{pgn}</td>
                  <td>{src}</td>
                  <td onClick={() => props.onRowClicked(row)}>
                    <span style={{ fontFamily: 'monospace' }}>{(input || [])[0]?.split(',').slice(5).join(' ')}</span>
                  </td>
                </tr>
              )
            }
          })}
        </tbody>
      </Table>
    </div>
  )
}

import { PGNs } from '@canboat/pgns'
import { PgnData, PgnNumber } from '../types'
import { EventData } from './AppPanel'
const pgnOptions = PGNs.map((pgn) => ({ value: pgn.PGN, label: `${pgn.PGN} ${pgn.Description}` }))
const pgnOptionsByPgn = pgnOptions.reduce<{
  [pgnNumber: PgnNumber]: {
    value: number
    label: string
  }
}>((acc, pgnOption) => {
  acc[pgnOption.value as PgnNumber] = pgnOption
  return acc
}, {})

const toPgnOption = (i: PgnNumber) =>
  pgnOptionsByPgn[i] || {
    value: i,
    label: `${i} Unknown`,
  }

export interface PgnOption {
  value: number
  label: string
}
interface FilterPanelProps {
  filterPgns: Subject<PgnNumber[]>
  doFiltering: Subject<boolean>
}
export const FilterPanel = (props: FilterPanelProps) => {
  const selectedValues = useObservableState(props.filterPgns)
  const doFiltering = useObservableState(props.doFiltering)
  return (
    <>
      <Row>
        <Col xs="12" md="11">
          <Select
            value={selectedValues?.map(toPgnOption)}
            isMulti
            name="colors"
            options={pgnOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={(values) => props.filterPgns.next(values.map((v) => v.value as PgnNumber))}
          />
        </Col>
        <Col xs="12" md="1" align="right">
          <Label className="switch switch-text switch-primary">
            <Input
              type="checkbox"
              id="Meta"
              name="meta"
              className="switch-input"
              onChange={() => props.doFiltering.next(!doFiltering)}
              checked={doFiltering}
            />
            <span className="switch-label" data-on="Yes" data-off="No" />
            <span className="switch-handle" />
          </Label>
        </Col>
      </Row>
    </>
  )
}
