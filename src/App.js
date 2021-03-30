import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={CreateRoom} />
        <Route path="/room/:roomID" component={Room} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;

// function Home(props) {
//   const handleJoin = () => {
//       Axios.get(`http://localhost:5000/join`).then(res => {
//           props.history?.push(`/join/${res.data.link}? 
//          quality=${quality}`);
//       })
//   }

//   return (
//       <React.Fragment>
//           <button onClick={handleJoin}>join</button>
//       </React.Fragment>
//   )
// }