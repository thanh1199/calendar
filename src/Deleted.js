import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setShowDeletedBox } from "./redux/deleteBox"
import style from "./style.module.scss"
// import clsx from "clsx"


function Deleted () {
    const dispatch = useDispatch()
    const userId = useSelector(state => state.userId)
    const show = useSelector(state => state.deleted)
    const [log, setLog] = useState([])

    log.sort((a, b) => b.incre-a.incre)
    const logStart = log.filter((l) => l.biko === "start")
    const logShow = log.filter((l) => l.biko === "exit")
    const notSolve = logShow.filter((l) => l.solve === 0)

    useEffect(() => {
        const data = new FormData()
        data.append("userId", userId)
        fetch("https://webpg2-1.herokuapp.com/calendar.php?attendDelete=see", {
            method: "POST",
            body: data,
        })
        .then((response) => response.json())
        .then((obj) => {setLog(obj); console.log("loaded deleteLog")})
        .catch(error => console.log(error))
    }, [setLog, userId, show])

    const handleSolve = (log, solveTo) => {
        const data = new FormData()
        data.append("id", log.id)
        data.append("userId", log.user_id)
        data.append("solveTo", solveTo)
        fetch("https://webpg2-1.herokuapp.com/calendar.php?attendDelete=setSolve", {
            method: "POST",
            body: data,
        })
        .then(() => {
            const data_ = new FormData()
            data_.append("userId", userId)
            fetch("https://webpg2-1.herokuapp.com/calendar.php?attendDelete=see", {
                method: "POST",
                body: data_,
            })
            .then((response) => response.json())
            .then((obj) => {setLog(obj); console.log("loaded deleteLog")})
            .catch(error => console.log(error))
        })
        .catch(error => console.log(error))
    }

    const getElementId = useCallback((event) => {
        if (!event.target.parentNode.id.includes("deleted")) {
            dispatch(setShowDeletedBox(false))
        }
        console.log("click")
    }, [dispatch])

    if (show) {
        document.addEventListener("click", getElementId)

        return (<div id="deletedSlide" className={style.deleteLog}>
            <input 
                type="button" 
                value={`DELETED LOG (${notSolve.length})`} 
                onClick={() => dispatch(setShowDeletedBox(false))} 
            />
            <div id="deletedBox" className={style.box}>{logShow.map((l, i) => {
                return(<p id="deletedLog" key={i} style={l.solve===0? {backgroundColor: "#ff9393"} : {}}>
                    {l.deleteTime}: {l.deltaTime} 
                    <span 
                        style={l.solve===0? {} : {pointerEvents: "none", backgroundColor: "#00bda0"}} 
                        className={style.ok}
                        onClick={() => handleSolve(l, 1)}
                    >&#10003;</span>
                    <span 
                        style={l.solve===0? {pointerEvents: "none", backgroundColor: "#ff7f7f"}: {}}
                        onClick={() => handleSolve(l, 0)}
                    >！</span><br/>
                    {logStart[i].day}_{logStart[i].shour}:{logStart[i].smin} ~ {l.day}_{l.ehour}:{l.emin}
                </p>)
            })}</div>
        </div>)
    } else {
        document.removeEventListener("click", getElementId)
        return (<div id="deletedBox" className={style.deleteLog}>
            <input 
                type="button" 
                value={`DELETED LOG (${notSolve.length})`} 
                onClick={() => dispatch(setShowDeletedBox(true))} 
            />
        </div>)
    }
}

export default Deleted