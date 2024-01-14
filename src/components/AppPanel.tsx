import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { ReplaySubject } from 'rxjs'
// import * as pkg from '../../package.json'
import { PgnData, PgnNumber } from '../types'
import { DataList, FilterPanel, PgnOption } from './DataList'
import { SentencePanel } from './SentencePanel'

// const SAFEPLUGINID = pkg.name.replace(/[-@/]/g, '_')
// const saveSettingsItems = (items: any) => {
//   let settings
//   try {
//     settings = JSON.parse(window.localStorage.getItem(SAFEPLUGINID) || '')
//   } catch (e) {
//     settings = {}
//   }
//   window.localStorage.setItem(SAFEPLUGINID, JSON.stringify({ ...settings, ...items }))
// }

export interface EventData {
  event: string
  data: PgnData | string
}

const AppPanel = (props: any) => {
  const [ws, setWs] = useState(null)
  const [data] = useState(new ReplaySubject<EventData[]>())
  const [list, setList] = useState<any[]>([])
  const [selectedPgn] = useState(new ReplaySubject<PgnData>())
  const [doFiltering] = useState(new ReplaySubject<boolean>())
  const [filterPgns] = useState(new ReplaySubject<PgnNumber[]>())

  useEffect(() => {
    const ws = props.adminUI.openWebsocket({
      subscribe: 'none',
      events: 'N2KAnalyzerOut,canboatjs:unparsed:data',
    })
    ws.onmessage = (x: any) => {
      const parsed = JSON.parse(x.data) as EventData
      setList((prev) => {
        if (prev.length < 1000) {
          prev.push(parsed)
        }
        data.next([...prev])
        return prev
      })
    }
    setWs(ws)
  }, [])

  return (
    <Card>
      <CardHeader>NMEA 2000 Debugging Utility</CardHeader>
      <CardBody>
    <div id="content">
      <Row>
        <Col xs="12" md="6">
          <FilterPanel doFiltering={doFiltering} filterPgns={filterPgns} />
        </Col>
      </Row>
      <Row>
        <Col xs="12" md="6">
          <DataList
            data={data}
            filterPgns={filterPgns}
            doFiltering={doFiltering}
            onRowClicked={(row: any) => selectedPgn.next(row.data)}
          />
        </Col>
        <Col xs="12" md="6">
          <SentencePanel selectedPgn={selectedPgn}></SentencePanel>
        </Col>
      </Row>
    </div></CardBody>
    </Card>
  )
}

export default AppPanel
