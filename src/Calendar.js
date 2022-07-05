
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import style from "./style.module.scss"
import {reSetTime} from "./redux/time"
import { useState } from "react";
import Selected from "./Selected";

// const youbi = ["日","月","火","水","木","金","土"]

function Calendar () {
    const dispatch = useDispatch()
    const time = useSelector(state => state.time)
    const attend = useSelector(state => state.attend)
    const [select,setSelect] = useState(false)
    const [workingOnSelected, setWorkingOnSelected] = useState([])

    const workingData = attend.map((working) => {
        const ymdStart = working[0].day.split("/").join(",").split("-").join(",").split(",")
        const shour = parseInt(working[0].shour)
        const smin = parseInt(working[0].smin)
        const dayStart = new Date(ymdStart[0], ymdStart[1]-1, ymdStart[2], shour, smin)

        const breakHm = working[0].deltaTime.split("時").join(",").split("分間").join(",").split(",").slice(0, -1).map((a) => parseInt(a))
        const dayBreak = new Date(ymdStart[0], ymdStart[1]-1, ymdStart[2], shour+breakHm[0], smin+breakHm[1])

        var ymdEnd, ehour, emin, dayEnd = false
        if (working[1]) {
            ymdEnd = working[1].day.split("/").join(",").split("-").join(",").split(",")
            ehour = working[1].ehour
            emin = working[1].emin
            dayEnd = new Date(ymdEnd[0], ymdEnd[1]-1, ymdEnd[2], ehour, emin)
        }

        const oneWorking = {
            id: working[0].id,
            userId: working[0].user_id,
            start: dayStart,
            break: dayBreak,
            end: dayEnd
        }
        
        return oneWorking
    })

    const showedMonth_firstDate = new Date(time[0], time[1], 1)
    const showedMonth_lastDate = new Date(time[0], time[1] + 1, 0)
    
    var showedMonth_DatesArray = Array.apply(null, Array(showedMonth_lastDate.getDate())).map((a, i) => {
        var date = new Date(
            showedMonth_lastDate.getFullYear(), 
            showedMonth_lastDate.getMonth(), 
            i+1
        )
        return date
    })

    const addToHead_ = Array(showedMonth_firstDate.getDay()===0 ? 6 : showedMonth_firstDate.getDay()-1)
    const addToHead = Array.apply(null, addToHead_).map((a, i) => {
        var date = new Date(
            showedMonth_firstDate.getFullYear(), 
            showedMonth_firstDate.getMonth(), 
            - i
        )
        return date
    })
    addToHead.sort((a, b) => a-b)

    const addToFoot_ = Array(showedMonth_lastDate.getDay()===0 ? 0 : 7 - showedMonth_lastDate.getDay())
    const addToFoot = Array.apply(null, addToFoot_).map((a, i) => {
        var date = new Date(
            showedMonth_lastDate.getFullYear(), 
            showedMonth_lastDate.getMonth(), 
            showedMonth_lastDate.getDate() + i + 1
        )
        return date
    })
    showedMonth_DatesArray = [...addToHead, ...showedMonth_DatesArray, ...addToFoot]

    const isSameDate = (initDate, compareDate) => {
        const delta = (compareDate - initDate)/(1000*60*60)
        return delta>= 0 && delta < 24 ? true : false
    }
    const showedWorkingData = showedMonth_DatesArray.map((date) => {
        const workingInThisDate = workingData.filter((working) => 
            isSameDate(date, working.start) || isSameDate(date, working.end)
        )
        const result = workingInThisDate.map((working) => {
            var string
            if (isSameDate(date, working.start) && isSameDate(date, working.end)) {
                string = "出・退"
            } else if (isSameDate(date, working.start)) {
                string = "出 ~"
            } else if (isSameDate(date, working.end)) {
                string = "~ 退"
            }
            return string
        })
        return result
    })

    const handleSelect = (newYear, newMonth, newDate) => {
        const newTime = new Date(newYear, newMonth, newDate)
        const newWorkingOnSelected = workingData.filter((working) => 
            isSameDate(newTime, working.start) || isSameDate(newTime, working.end)
        )

        setWorkingOnSelected(newWorkingOnSelected)
        dispatch(reSetTime([newTime.getFullYear(), newTime.getMonth(), newTime.getDate()]))
        setSelect(true)
    }

    const handleLeft = () => {
        const newDate = new Date(time[0], time[1], time[2]-1)
        handleSelect(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    }
    const handleRight = () => {
        const newDate = new Date(time[0], time[1], time[2]+1)
        handleSelect(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    }
    const handleNow = () => {
        const newDate = new Date()
        handleSelect(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    }
    
    //// test 
    // const day = new Date()
    // if (attend.length !== 0) {
        // console.log(isSameDate(showedMonth_DatesArray[4], day))
    // }

    return (<div>
        <div className={style.showedCurrent}>{`${time[0]} 年 ${time[1]+1} 月`}</div>
        <div className={style.dayRow}>
            <span>月</span>
            <span>火</span>
            <span>水</span>
            <span>木</span>
            <span>金</span>
            <span>土</span>
            <span>日</span>
        </div>
        <div className={style.calendarContainer}>{
            showedMonth_DatesArray.map((date, i) => {
                return (<div 
                    key={i} 
                    className={clsx(
                        style.date, 
                        time[2]===date.getDate() && time[1]===date.getMonth() ? style.dateSelect : "",
                        time[1]!==date.getMonth() ? style.notThisMonth : ""
                    )}
                    onClick={() => handleSelect(date.getFullYear(), date.getMonth(), date.getDate())}>
                    <p>{date.getDate()}</p>
                    {showedWorkingData[i].map((working, ii) => <p key={ii}>{working}</p>)}
                </div>)
            })
        }</div>
        <div className={clsx(style.onTop, select? "": style.onTopHidden)}>
            <div className={style.toLeft} onClick={() => handleLeft()}>&#60;</div>
            <div className={style.toNow} onClick={() => handleNow()}>◎</div>
            <div className={style.toRight} onClick={() => handleRight()}>&#62;</div>
            <div className={style.close} onClick={() => setSelect(false)}>&#10005;</div>
            <Selected data={workingOnSelected} close={setSelect} />
        </div>
    </div>)
}

export default Calendar