

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { reloadAttend } from "./redux/attend";
import { setShowDeletedBox } from "./redux/deleteBox";
import style from "./style.module.scss"



function Selected ({ data, close=()=>{} }) {
    const time = useSelector(state => state.time)
    const today = new Date(time[0], time[1], time[2])
    const tomorrow = new Date(time[0], time[1], time[2]+1)
    var h, t

    return (<div className={style.onTopBox}>
        {data.map((d, i) => {
            if (!d.end) {
                h = 50
                t = 46 + ((d.start - today)/(1000*60)) * (25/15)
                return (<div key={i} className={style.workingNotConfirm} style={{top: t+"px", height: h+"px"}}>{i+1}</div>)
            } else {
                var breakTime = (d.break - d.start)/(1000*60)
                if (d.start.getDate()!==time[2]) {
                    h = 26 + ((d.end - today)/(1000*60)) * (25/15)
                    t = 20
                    breakTime = 0
                }
                if (d.end.getDate()!==time[2]) {
                    h = 26 + ((tomorrow - d.start)/(1000*60)) * (25/15)
                    t = 45 + ((d.start - today)/(1000*60)) * (25/15)
                }
                if (d.start.getDate() === d.end.getDate()) {
                    h = 1 + ((d.end - d.start)/(1000*60)) * (25/15)
                    t = 45 + ((d.start - today)/(1000*60)) * (25/15)
                }
                return (<div key={i} className={style.working} style={{top: t+"px", height: h+"px"}}>
                    {i+1}
                    <span style={{height: breakTime+"px"}} />
                </div>)
            }
        })}
        <Show24h />
        <Info data={data} close={close} />
    </div>)
}

function Info ({ data, close=()=>{} }) {
    const userId = useSelector(state => state.userId)
    const time = useSelector(state => state.time)
    const timeShow = new Date(time[0], time[1], time[2])
    const today = new Date()
    today.setHours(0,0,0,0)
    const isFuture = (timeShow - today)/(1000*60*60) >= 24
    const [shour, setShour] = useState(0)
    const [smin, setSmin] = useState(0)
    const [breakHour, setBreakHour] = useState(0)
    const [breakMin, setBreakMin] = useState(0)
    const [totalHour, setTotalHour] = useState(0)
    const [totalMin, setTotalMin] = useState(0)
    const dispatch = useDispatch()

    const handleDelete = (working, stop=false) => {
        close(false)
        const fetchFunction = (url, data) => {
            fetch(url, { method: "POST", body: data })
            .then(() => {
                const data_ = new FormData()
                data_.append("user_id", userId)
                fetch ("https://webpg2-1.herokuapp.com/calendar.php?user_id="+userId, { 
                  method: "POST",
                  body: data_
                })
                .then((response) => response.json())
                .then((obj) => {
                    dispatch(reloadAttend(obj))
                    dispatch(setShowDeletedBox(true))
                    console.log("loaded user attend")})
                .catch(error => console.log(error))
            })
            .catch(error => console.log(error))
        }
        const data = new FormData()
        data.append("id", working.id)
        data.append("userId", userId)

        if (stop) {
            const now = new Date()
            const dayEnd = `${now.getFullYear()}-${("0"+(now.getMonth()+1)).slice(-2)}-${now.getDate()}`
            const ehour = now.getHours()
            const emin = now.getMinutes()
            const workingHour_h = Math.floor((now.getTime() - working.start.getTime())/(1000*60*60))
            const workingHour_m = Math.floor(((now.getTime() - working.start.getTime())/(1000*60*60) - workingHour_h)*60)
            const workingHour = workingHour_h+"時"+workingHour_m+"分間"

            data.append("dayEnd", dayEnd)
            data.append("ehour", ehour)
            data.append("emin", emin)
            data.append("workingHour", workingHour)

            fetchFunction("https://webpg2-1.herokuapp.com/calendar.php?delete=delete&stop=stop", data)
        } else {
            fetchFunction("https://webpg2-1.herokuapp.com/calendar.php?delete=delete", data)
        }
    }

    const handleAdd = () => {
        if (totalHour === 0 && totalMin === 0) {}
        else {
            const dayStart = `${timeShow.getFullYear()}-${("0"+(timeShow.getMonth()+1)).slice(-2)}-${("0"+timeShow.getDate()).slice(-2)}`
            const breakTime = `${breakHour}時${breakMin}分間`
            const dayEnd_ = new Date(timeShow.getFullYear(), timeShow.getMonth(), timeShow.getDate(), parseInt(shour)+parseInt(breakHour)+parseInt(totalHour), parseInt(smin)+parseInt(breakMin)+parseInt(totalMin))
            const dayEnd = `${dayEnd_.getFullYear()}-${("0"+(dayEnd_.getMonth()+1)).slice(-2)}-${("0"+dayEnd_.getDate()).slice(-2)}`
            const ehour = dayEnd_.getHours()
            const emin = dayEnd_.getMinutes()
            const workingHour = `${totalHour}時${totalMin}分間`

            const data = new FormData()
            data.append("userId", userId)
            data.append("dayStart", dayStart)
            data.append("shour", parseInt(shour))
            data.append("smin", parseInt(smin))
            data.append("breakTime", breakTime)
            data.append("dayEnd", dayEnd)
            data.append("ehour", ehour)
            data.append("emin", emin)
            data.append("workingHour", workingHour)

            fetch("https://webpg2-1.herokuapp.com/calendar.php?add=add", { 
                method: "POST", 
                body: data 
            })
            .then(() => {
                const data_ = new FormData()
                data_.append("user_id", userId)
                fetch ("https://webpg2-1.herokuapp.com/calendar.php?user_id="+userId, { 
                  method: "POST",
                  body: data_
                })
                .then((response) => response.json())
                .then((obj) => {
                    dispatch(reloadAttend(obj))
                    console.log("added new working to attend")})
                .catch(error => console.log(error))
            })
            .catch(error => console.log(error))

            close(false)
            setShour("0")
            setSmin("0")
            setBreakHour("0")
            setBreakMin("0")
            setTotalHour("0")
            setTotalMin("0")
        }
    }

    const handleTyping = (initValue, type) => {
        var value = initValue === "" ? "0" : initValue
        if (initValue.length >= 3) {value = initValue.slice(-2)}
        const checkNumberTime = (v) => {
            var result = true
            v.split("").forEach((vv) => {
                var isNum = "0123456789".includes(vv)
                if (!isNum) {result = false}
            })
            
            if (result) {
                if (type === "shour" || type === "breakHour") {
                    parseInt(v) <= 23 ? result=true : result=false
                }
                if (type === "totalHour") {
                    parseInt(v) <= 12 ? result=true : result=false
                }
                if (type === "smin" || type === "breakMin" || type === "totalMin") {
                    parseInt(v) <= 59 ? result=true : result=false
                }
            }

            return result
        }
        if (!checkNumberTime(value)) {
            setShour(shour)
            setSmin(smin)
            setBreakHour(breakHour)
            setBreakMin(breakMin)
            setTotalHour(totalHour)
            setTotalMin(totalMin)
        }
        else if (type === "shour") {
            setShour(value)
        } else if (type === "smin") {
            setSmin(value)
        } else if (type === "breakHour") {
            setBreakHour(value)
        } else if (type === "breakMin") {
            setBreakMin(value)
        } else if (type === "totalHour") {
            setTotalHour(value)
        } else if (type === "totalMin") {
            setTotalMin(value)
        }
    }
    return (<div className={style.info}>
        <div className={style.today}>{timeShow.getFullYear()}年 {timeShow.getMonth()+1}月 {timeShow.getDate()}日</div>
        <div className={style.add} style={{display: data.length === 0 && !isFuture ? "block" : "none"}}>
            <input 
                value={shour}
                onChange={(e) => handleTyping(e.target.value, "shour")}
            />
            <label> : </label>
            <input
                value={smin}
                onChange={(e) => handleTyping(e.target.value, "smin")}
            />
            <label>に出勤した。</label><br/><br/>
            <input
                value={breakHour}
                onChange={(e) => handleTyping(e.target.value, "breakHour")}
            />
            <label>時</label>
            <input
                value={breakMin}
                onChange={(e) => {handleTyping(e.target.value, "breakMin")}}
            />
            <label>分間を休憩した。</label><br/><br/>
            <input
                value={totalHour}
                onChange={(e) => {handleTyping(e.target.value, "totalHour")}}
            />
            <label>時</label>
            <input
                value={totalMin}
                onChange={(e) => handleTyping(e.target.value, "totalMin")}
            />
            <label>分間（休憩除く）働いた。</label><br/><br/>
            <input type="button" onClick={() => handleAdd()} value="追加" className={style.submit} />

            <div className={style.readme}>
                <p>＊「時」は２３に超えない数字。</p>
                <p>＊「分」は５９に超えない数字。</p>
                <p>＊　労働時間は１３時間にすることはできない。</p>
            </div>
            
        </div>
        {data.map((d, i) => {
            if (!d.end) {
                return (<div key={i} className={style.infoLog}>
                    <div className={style.deleteLog} onClick={() => handleDelete(d, true)}>delete</div>
                    <span>{i+1}</span> 出勤中<br/>
                    出: {("0"+d.start.getHours()).slice(-2)}:{("0"+d.start.getMinutes()).slice(-2)}
                </div>)
            } else {
                var start, end
                if (d.start.getDate() !== timeShow.getDate()) {
                    start = `${d.start.getFullYear()}/${d.start.getMonth()+1}/${d.start.getDate()}_ `+("0"+d.start.getHours()).slice(-2)+":"+("0"+d.start.getMinutes()).slice(-2)
                    end = "今日_ "+("0"+d.end.getHours()).slice(-2)+":"+("0"+d.end.getMinutes()).slice(-2)
                }
                if (d.end.getDate() !== timeShow.getDate()) {
                    start = "今日_ "+("0"+d.start.getHours()).slice(-2)+":"+("0"+d.start.getMinutes()).slice(-2)
                    end = `${d.end.getFullYear()}/${d.end.getMonth()+1}/${d.end.getDate()}_ `+("0"+d.end.getHours()).slice(-2)+":"+("0"+d.end.getMinutes()).slice(-2)
                }
                if (d.end.getDate() === d.start.getDate()) {
                    start = ("0"+d.start.getHours()).slice(-2)+":"+("0"+d.start.getMinutes()).slice(-2)
                    end = ("0"+d.end.getHours()).slice(-2)+":"+("0"+d.end.getMinutes()).slice(-2)
                }
                const workingTime = ((d.end - d.start)/(1000*60*60)).toFixed(2)
                return (<div key={i} className={style.infoLog}>
                    <div className={style.deleteLog} onClick={() => handleDelete(d)}>delete</div>
                    <span>{i+1}</span> {workingTime} 時間<br/>
                    出: {start} <br/>
                    休: {(d.break - d.start)/(1000*60)} 分<br/>
                    退: {end}
                </div>)
            }
        })}
    </div>)
}

function Show24h () {
    return(<div className={style._24h}>
        <p className={style.hourContinue}><span>昨日</span></p>
        <p className={style.hourHead}><span>00:00</span></p><p><span>00:15</span></p><p><span>00:30</span></p><p><span>00:45</span></p>
        <p className={style.hourHead}><span>01:00</span></p><p><span>01:15</span></p><p><span>01:30</span></p><p><span>01:45</span></p>
        <p className={style.hourHead}><span>02:00</span></p><p><span>02:15</span></p><p><span>02:30</span></p><p><span>02:45</span></p>
        <p className={style.hourHead}><span>03:00</span></p><p><span>03:15</span></p><p><span>03:30</span></p><p><span>03:45</span></p>
        <p className={style.hourHead}><span>04:00</span></p><p><span>04:15</span></p><p><span>04:30</span></p><p><span>04:45</span></p>
        <p className={style.hourHead}><span>05:00</span></p><p><span>05:15</span></p><p><span>05:30</span></p><p><span>05:45</span></p>
        <p className={style.hourHead}><span>06:00</span></p><p><span>06:15</span></p><p><span>06:30</span></p><p><span>06:45</span></p>
        <p className={style.hourHead}><span>07:00</span></p><p><span>07:15</span></p><p><span>07:30</span></p><p><span>07:45</span></p>
        <p className={style.hourHead}><span>08:00</span></p><p><span>08:15</span></p><p><span>08:30</span></p><p><span>08:45</span></p>
        <p className={style.hourHead}><span>09:00</span></p><p><span>09:15</span></p><p><span>09:30</span></p><p><span>09:45</span></p>
        <p className={style.hourHead}><span>10:00</span></p><p><span>10:15</span></p><p><span>10:30</span></p><p><span>01:45</span></p>
        <p className={style.hourHead}><span>11:00</span></p><p><span>11:15</span></p><p><span>11:30</span></p><p><span>11:45</span></p>
        <p className={style.hourHead}><span>12:00</span></p><p><span>12:15</span></p><p><span>12:30</span></p><p><span>12:45</span></p>
        <p className={style.hourHead}><span>13:00</span></p><p><span>13:15</span></p><p><span>13:30</span></p><p><span>13:45</span></p>
        <p className={style.hourHead}><span>14:00</span></p><p><span>14:15</span></p><p><span>14:30</span></p><p><span>14:45</span></p>
        <p className={style.hourHead}><span>15:00</span></p><p><span>15:15</span></p><p><span>15:30</span></p><p><span>15:45</span></p>
        <p className={style.hourHead}><span>16:00</span></p><p><span>16:15</span></p><p><span>16:30</span></p><p><span>16:45</span></p>
        <p className={style.hourHead}><span>17:00</span></p><p><span>17:15</span></p><p><span>17:30</span></p><p><span>17:45</span></p>
        <p className={style.hourHead}><span>18:00</span></p><p><span>18:15</span></p><p><span>18:30</span></p><p><span>18:45</span></p>
        <p className={style.hourHead}><span>19:00</span></p><p><span>19:15</span></p><p><span>19:30</span></p><p><span>19:45</span></p>
        <p className={style.hourHead}><span>20:00</span></p><p><span>20:15</span></p><p><span>20:30</span></p><p><span>20:45</span></p>
        <p className={style.hourHead}><span>21:00</span></p><p><span>21:15</span></p><p><span>21:30</span></p><p><span>21:45</span></p>
        <p className={style.hourHead}><span>22:00</span></p><p><span>22:15</span></p><p><span>22:30</span></p><p><span>22:45</span></p>
        <p className={style.hourHead}><span>23:00</span></p><p><span>23:15</span></p><p><span>23:30</span></p><p><span>23:45</span></p>
        <p className={style.hourHead}><span>終日</span></p>
        <p className={style.hourContinue}><span>明日</span></p>
    </div>)
}

export default Selected