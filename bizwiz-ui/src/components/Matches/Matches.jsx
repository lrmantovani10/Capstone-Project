import "./Matches.css"
import { useEffect } from "react"
export default function Matches(props){

  useEffect(()=>{
    try{
      const userToken = localStorage.getItem("userToken")
      if(userToken.length > 0){
        //get matches by making a call to the api with a /matches endpoint
      }
      else{
        window.location.replace("/login")
      }
    }
    catch{
      window.location.replace("/login")
    }
  })

  return(<div></div>)
}