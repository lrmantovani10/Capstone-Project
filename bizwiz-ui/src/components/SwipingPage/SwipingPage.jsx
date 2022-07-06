import './SwipingPage.css';
import '@fontsource/abel';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect } from 'react';

export default function SwipingPage(props) {
  useEffect(()=>{
    try{
      const userToken = localStorage.getItem("userToken")
      if(userToken.length > 0){
        
      }
      else{
        window.location.replace("/login")
      }
    }
    catch{
      window.location.replace("/login")
    }
  })
  return (
    <div className="swipingGeneral">
      <div className="swipingProfile" id="randomKey">
        <h1>Name</h1>
        <div className="swipingBasic">
          <img id="profileImage" src="https://media-exp1.licdn.com/dms/image/C4D03AQE0xz_SxsONqg/profile-displayphoto-shrink_200_200/0/1589167523717?e=1660176000&v=beta&t=OigSQxmC6kWKW5MF80JMa1CkYg8xXl1okbAgFknD6Es" />
          <div className="aboutMe">
            <h2>Intro</h2>
            <p className="myIntro">
              Developer @fb CS @UChicago
            </p>
          </div>
        </div>
        <div className="workPictures">
          <div className="pictureHorizontal">
            <img alt="First professional memory" className="workPicture" src="https://upload.wikimedia.org/wikipedia/commons/0/05/HONDA_ASIMO.jpg" />
            <img alt="Second professional memory" className="workPicture" src="https://upload.wikimedia.org/wikipedia/commons/0/05/HONDA_ASIMO.jpg" />
            <img alt="Third professional memory" className="workPicture" src="https://upload.wikimedia.org/wikipedia/commons/0/05/HONDA_ASIMO.jpg" />
          </div>
          <div className="pictureHorizontal">
            <img alt="Fourth professional memory" className="workPicture" src="https://upload.wikimedia.org/wikipedia/commons/0/05/HONDA_ASIMO.jpg" />
            <img alt="Fifth professional memory" className="workPicture" src="https://upload.wikimedia.org/wikipedia/commons/0/05/HONDA_ASIMO.jpg" />
            <img alt="Sixth professional memory" className="workPicture" src="https://upload.wikimedia.org/wikipedia/commons/0/05/HONDA_ASIMO.jpg" />
          </div>
        </div>
        <div className="externals">
          <a target="_blank" href="abc.xyz" className="qualification">Meta University Engineer</a>
          <a target="_blank" href="abc.xyz" className="qualification">LinkedIn profile</a>
          <a target="_blank" href="abc.xyz" className="qualification">Resume</a>
          <a target="_blank" href="abc.xyz" className="qualification">GitHub</a>
        </div>
      </div>
      <div className="buttonChoice">
        <ThemeProvider theme={props.purpleTheme}>
          <Button
            onClick={() => props.handleReject()}
            variant="outlined"
            style={{
              backgroundColor: 'white', marginTop: '30px', width: '150px', height: '40px', borderRadius: '5%',
            }}
          >
            Reject
          </Button>
          <Button
            onClick={() => props.handleMatch()}
            variant="contained"
            style={{
              marginTop: '30px', width: '150px', height: '40px', borderRadius: '5%',
            }}
          >
            Match
          </Button>
        </ThemeProvider>
      </div>
    </div>
  );
}
