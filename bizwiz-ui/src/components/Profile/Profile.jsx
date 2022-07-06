import "./Profile.css"
import { useEffect } from "react"

export default function Profile(props){
  useEffect(()=>{
    try{
      const userToken = localStorage.getItem("userToken")
      if(userToken.length > 0){
        //get profile by making a call to the api with a /profile endpoint
      }
      else{
        window.location.replace("/login")
      }
    }
    catch{
      window.location.replace("/login")
    }
  })
  return(
    <button onClick={props.handleLogout}>
      Log Out
    </button>
  )
}