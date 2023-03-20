import logo from './logo.svg';
import Court from './Court';
import './App.css';

async function getTeams() {
  const teams = await fetch("https://pj23k7u4lg.execute-api.us-east-1.amazonaws.com/prod/teams")
  return await teams.json()
}

function App() {
  let teamList = []
  getTeams().then((teams) => {
    for (const team of teams) {
      teamList.push(<option value={team}>{team}</option>)
    }
  })
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    <div>
      <div id="menu">
        <form name="form1" id="form1" action="/action_page.php">
          Team: <select name="subject" id="subject">
            <option value="" selected="selected">Select team</option>
            {teamList}
          </select>
          <br />
          <br />
          Player: <select name="topic" id="topic">
            <option value="" selected="selected">Please player</option>
          </select>
          <br />
          <br />
          <input type="submit" onclick="showDiv()" value="Submit" />
        </form>

        <div id="" stat_panel>
          <p>PPG: </p>
          <p>APG: </p>
          <p>RPG: </p>
        </div>
      </div>
      <Court />
    </div>
  );
}

export default App;
