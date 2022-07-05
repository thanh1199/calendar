
import style from "./style.module.scss";
import Calendar from "./Calendar";
import { useDispatch, useSelector } from "react-redux";
import { reSetTime } from "./redux/time"
import { useCallback, useEffect, useState } from "react";
import { reloadAttend } from "./redux/attend";
import Deleted from "./Deleted";

const nowDate = new Date()

function App() {
  const [login, setLogin] = useState(false)
  const [adminId, setAdminId] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const handleLogin = () => {
    if (adminId === "" || adminPassword === "") {
      setAdminId("")
      setAdminPassword("")
    }
    else {
      const data = new FormData()
      data.append("adminId", adminId)
      data.append("password", adminPassword)
      fetch("https://webpg2-1.herokuapp.com/calendar.php?login=login", {
        method: "POST",
        body: data
      })
      .then((response) => response.json())
      .then((mess) => {
        setLogin(mess)
        setAdminId("LOGIN is wrong")
        setAdminPassword("")
      })
      .catch(error => console.log(error))
    }
  }
  
  const userId = useSelector(state => state.userId)
  const time = useSelector(state => state.time)
  const dispatch = useDispatch()

  const handleReload = useCallback(() => {
    const data = new FormData()
    data.append("user_id", userId)
    fetch ("https://webpg2-1.herokuapp.com/calendar.php?user_id="+userId, { 
      method: "POST",
      body: data
    })
    .then((response) => response.json())
    .then((obj) => {dispatch(reloadAttend(obj)); console.log("loaded user attend")})
    .catch(error => console.log(error))
  }, [dispatch, userId])
  
  useEffect(() => {
    handleReload()
  }, [handleReload])

  const handleLeft = () => {
    const newMonth_lastDate = new Date(time[0], time[1], 0)
    const newDate = time[2] > newMonth_lastDate.getDate() ? newMonth_lastDate.getDate() : time[2]
    dispatch(reSetTime([newMonth_lastDate.getFullYear(), newMonth_lastDate.getMonth(), newDate]))
  }

  const handleRight = () => {
    const newMonth_lastDate = new Date(time[0], time[1]+2, 0)
    const newDate = time[2] > newMonth_lastDate.getDate() ? newMonth_lastDate.getDate() : time[2]
    dispatch(reSetTime([newMonth_lastDate.getFullYear(), newMonth_lastDate.getMonth(), newDate]))
  }

  if (login) {
    return (
      <div className={style.container}>
        <div className={style.userName} onClick={() => handleReload()} >{userId}</div>
        <div className={style.control}>
          <span onClick={() => handleLeft()}>&#60;</span>
          <span onClick={() => dispatch(reSetTime([nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()]))}>◎</span>
          <span onClick={() => handleRight()}>&#62;</span>
        </div>
        <Calendar numberOfYear={time[0]} numberOfMonth={time[1]} numberOfDate={time[2]} />
        <Deleted />
      </div>
    )
  } else {
    return (<div className={style.loginBox}>
      <label>Admin id: </label>
      <input value={adminId} onChange={(e) => setAdminId(e.target.value)} />
      <label>Password: </label>
      <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
      <input type="button" value="LOGIN" onClick={() => handleLogin()} className={style.submit} />
     </div>)
  }
}

export default App;
